import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { notifyNewPost, notifyReply, notifyLike } from '../lib/notifications.js'
import { checkAchievements } from '../achievements.js'

const router = Router()
const prisma = new PrismaClient()

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

// GET /api/posts/club/:clubId
router.get('/club/:clubId', requireAuth, asyncHandler(async (req, res) => {
  const clubId = Number(req.params.clubId)

  const posts = await prisma.post.findMany({
    where: { clubId },
    include: {
      user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } },
      replies: {
        include: { user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } } },
        orderBy: { createdAt: 'asc' },
      },
      likes: { select: { userId: true } },
      _count: { select: { replies: true, likes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const formatted = posts.map(p => ({
    id: p.id,
    title: p.title,
    body: p.body,
    time: timeAgo(p.createdAt),
    createdAt: p.createdAt,
    user: p.user,
    likeCount: p._count.likes,
    replyCount: p._count.replies,
    likedByMe: p.likes.some(l => l.userId === req.userId),
    replies: p.replies.map(r => ({
      id: r.id,
      text: r.text,
      time: timeAgo(r.createdAt),
      user: r.user,
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
  await checkAchievements(prisma, req.userId)

  res.status(201).json({
    id: post.id,
    title: post.title,
    body: post.body,
    time: 'just now',
    createdAt: post.createdAt,
    user: post.user,
    likeCount: 0,
    replyCount: 0,
    likedByMe: false,
    replies: [],
  })
}))

// POST /api/posts/:id/like
router.post('/:id/like', requireAuth, asyncHandler(async (req, res) => {
  const postId = Number(req.params.id)
  const userId = req.userId

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } }
  })

  if (existing) {
    await prisma.postLike.delete({ where: { userId_postId: { userId, postId } } })
    res.json({ liked: false })
  } else {
    await prisma.postLike.create({ data: { userId, postId } })

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true, clubId: true } })
    if (post) {
      await notifyLike(prisma, { postOwnerId: post.userId, actorId: userId, clubId: post.clubId, postId })
    }

    res.json({ liked: true })
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

  res.status(201).json({ id: reply.id, text: reply.text, time: 'just now', user: reply.user })
}))

export default router
