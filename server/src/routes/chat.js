import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { notifyChatMessage } from '../lib/notifications.js'

const router = Router()
const prisma = new PrismaClient()

const ALLOWED_EMOJI = ['👍', '❤️', '😂', '🎉', '😮']

function formatTime(date) {
  const d = new Date(date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (isToday) return t
  if (isYesterday) return `Yesterday, ${t}`
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${t}`
}

function groupReactions(reactions, userId) {
  const byEmoji = {}
  for (const r of reactions) {
    if (!byEmoji[r.emoji]) byEmoji[r.emoji] = { emoji: r.emoji, count: 0, reactedByMe: false, users: [] }
    byEmoji[r.emoji].count++
    byEmoji[r.emoji].users.push(r.user.displayName)
    if (r.userId === userId) byEmoji[r.emoji].reactedByMe = true
  }
  return Object.values(byEmoji).sort((a, b) => b.count - a.count)
}

// GET /api/chat/:clubId
router.get('/:clubId', requireAuth, asyncHandler(async (req, res) => {
  const clubId = Number(req.params.clubId)
  const membership = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: req.userId, clubId } }
  })
  if (!membership) return res.status(403).json({ error: 'Not a member' })

  const messages = await prisma.chatMessage.findMany({
    where: { clubId },
    include: { user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  const msgIds = messages.map(m => m.id)
  const reactions = msgIds.length ? await prisma.reaction.findMany({
    where: { targetType: 'chat', targetId: { in: msgIds } },
    include: { user: { select: { displayName: true } } },
  }) : []

  const rxByTarget = {}
  for (const r of reactions) {
    if (!rxByTarget[r.targetId]) rxByTarget[r.targetId] = []
    rxByTarget[r.targetId].push(r)
  }

  res.json(messages.map(m => ({
    id: m.id,
    text: m.text,
    time: formatTime(m.createdAt),
    createdAt: m.createdAt,
    user: m.user,
    reactions: groupReactions(rxByTarget[m.id] || [], req.userId),
  })))
}))

// POST /api/chat/:clubId
router.post('/:clubId', requireAuth, [
  body('text').isLength({ min: 1, max: 2000 }).trim(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const clubId = Number(req.params.clubId)
  const membership = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: req.userId, clubId } }
  })
  if (!membership) return res.status(403).json({ error: 'Not a member' })

  const msg = await prisma.chatMessage.create({
    data: { clubId, userId: req.userId, text: req.body.text },
    include: { user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } } }
  })

  await notifyChatMessage(prisma, { clubId, actorId: req.userId })

  res.status(201).json({
    id: msg.id,
    text: msg.text,
    time: formatTime(msg.createdAt),
    createdAt: msg.createdAt,
    user: msg.user,
    reactions: [],
  })
}))

// POST /api/chat/messages/:msgId/react
router.post('/messages/:msgId/react', requireAuth, [
  body('emoji').isIn(ALLOWED_EMOJI),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const targetId = Number(req.params.msgId)
  const { emoji } = req.body
  const userId = req.userId

  const existing = await prisma.reaction.findUnique({
    where: { userId_targetType_targetId_emoji: { userId, targetType: 'chat', targetId, emoji } }
  })

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
    res.json({ reacted: false, emoji })
  } else {
    await prisma.reaction.create({ data: { userId, targetType: 'chat', targetId, emoji } })
    res.json({ reacted: true, emoji })
  }
}))

export default router
