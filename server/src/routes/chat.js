import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { notifyChatMessage } from '../lib/notifications.js'
import { emitChatMessage } from '../lib/socketServer.js'

const router = Router()
const prisma = new PrismaClient()

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

  res.json(messages.map(m => ({
    id: m.id,
    text: m.text,
    time: formatTime(m.createdAt),
    createdAt: m.createdAt,
    user: m.user,
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

  const formatted = {
    id: msg.id,
    text: msg.text,
    time: formatTime(msg.createdAt),
    createdAt: msg.createdAt,
    user: msg.user,
  }

  // Broadcast to all club members except the sender (they have optimistic UI)
  emitChatMessage(clubId, formatted)

  res.status(201).json(formatted)
}))

export default router
