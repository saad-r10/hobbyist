import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { notifyNewPost, notifyReply, notifyReaction } from '../lib/notifications.js'

const router = Router()
const prisma = new PrismaClient()

const ALLOWED_EMOJI = ['👍', '❤️', '😂', '🎉', '😮']

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
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

// GET /api/posts/club/:clubId
router.get('/club/:clubId', requireAuth, asyncHandler(async (req, res) => {
  const clubId = Number(req.params.clubId)

  const posts = await prisma.post.findMany({
    where: { clubId },
    include: {
      user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } },
      replies: {
        include: {
          user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const postIds = posts.map(p => p.id)
  const replyIds = posts.flatMap(p => p.replies.map(r => r.id))

  const [postReactions, replyReactions] = await Promise.all([
    prisma.reaction.findMany({
      where: { targetType: 'post', targetId: { in: postIds } },
      include: { user: { select: { displayName: true } } },
    }),
    replyIds.length ? prisma.reaction.findMany({
      where: { targetType: 'reply', targetId: { in: replyIds } },
      include: { user: { select: { displayName: true } } },
    }) : Promise.resolve([]),
  ])

  const postRxByTarget = {}
  for (const r of postReactions) {
    if (!postRxByTarget[r.targetId]) postRxByTarget[r.targetId] = []
    postRxByTarget[r.targetId].push(r)
  }

  const replyRxByTarget = {}
  for (const r of replyReactions) {
    if (!replyRxByTarget[r.targetId]) replyRxByTarget[r.targetId] = []
    replyRxByTarget[r.targetId].push(r)
  }

  const formatted = posts.map(p => ({
    id: p.id,
    title: p.title,
    body: p.body,
    time: timeAgo(p.createdAt),
    createdAt: p.createdAt,
    user: p.user,
    reactions: groupReactions(postRxByTarget[p.id] || [], req.userId),
    replyCount: p.replies.length,
    replies: p.replies.map(r => ({
      id: r.id,
      text: r.text,
      time: timeAgo(r.createdAt),
      user: r.user,
      reactions: groupReactions(replyRxByTarget[r.id] || [], req.userId),
    })),
  }))

  res.json(formatted)
}))

// POST /api/posts/club/:clubId
router.post('/club/:clubId', requireAuth, [
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('body').isLength({ min: 1, max: 5000 }).trim(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const clubId = Number(req.params.clubId)
  const membership = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: req.userId, clubId } }
  })
  if (!membership) return res.status(403).json({ error: 'Not a member' })

  const post = await prisma.post.create({
    data: { clubId, userId: req.userId, title: req.body.title, body: req.body.body },
    include: {
      user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } },
    }
  })

  await notifyNewPost(prisma, { clubId, actorId: req.userId, postId: post.id })

  res.status(201).json({
    id: post.id,
    title: post.title,
    body: post.body,
    time: 'just now',
    createdAt: post.createdAt,
    user: post.user,
    reactions: [],
    replyCount: 0,
    replies: [],
  })
}))

// POST /api/posts/:id/react
router.post('/:id/react', requireAuth, [
  body('emoji').isIn(ALLOWED_EMOJI),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const targetId = Number(req.params.id)
  const { emoji } = req.body
  const userId = req.userId

  const existing = await prisma.reaction.findUnique({
    where: { userId_targetType_targetId_emoji: { userId, targetType: 'post', targetId, emoji } }
  })

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
    res.json({ reacted: false, emoji })
  } else {
    await prisma.reaction.create({ data: { userId, targetType: 'post', targetId, emoji } })

    const post = await prisma.post.findUnique({ where: { id: targetId }, select: { userId: true, clubId: true } })
    if (post) {
      await notifyReaction(prisma, { postOwnerId: post.userId, actorId: userId, clubId: post.clubId, postId: targetId })
    }

    res.json({ reacted: true, emoji })
  }
}))

// POST /api/posts/:id/replies/:replyId/react
router.post('/:id/replies/:replyId/react', requireAuth, [
  body('emoji').isIn(ALLOWED_EMOJI),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const targetId = Number(req.params.replyId)
  const { emoji } = req.body
  const userId = req.userId

  const existing = await prisma.reaction.findUnique({
    where: { userId_targetType_targetId_emoji: { userId, targetType: 'reply', targetId, emoji } }
  })

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
    res.json({ reacted: false, emoji })
  } else {
    await prisma.reaction.create({ data: { userId, targetType: 'reply', targetId, emoji } })
    res.json({ reacted: true, emoji })
  }
}))

// POST /api/posts/:id/replies
router.post('/:id/replies', requireAuth, [
  body('text').isLength({ min: 1, max: 2000 }).trim(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const postId = Number(req.params.id)
  const reply = await prisma.reply.create({
    data: { postId, userId: req.userId, text: req.body.text },
    include: { user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } } }
  })

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true, clubId: true } })
  if (post) {
    await notifyReply(prisma, { postOwnerId: post.userId, actorId: req.userId, clubId: post.clubId, postId })
  }

  res.status(201).json({ id: reply.id, text: reply.text, time: 'just now', user: reply.user, reactions: [] })
}))

export default router
