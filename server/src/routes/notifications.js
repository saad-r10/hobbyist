import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

const PAGE_SIZE = 20

const USER_SELECT = { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true }

function subTabFor(type) {
  if (type === 'chat') return 'chat'
  if (type === 'club_join') return 'members'
  return 'discussion'
}

function messageFor(n) {
  const actorName = n.actor?.displayName || 'Someone'
  const clubName = n.club?.name || 'a club'

  switch (n.type) {
    case 'post':
      return `${actorName} posted in ${clubName}`
    case 'reply':
      return `${actorName} replied to your post`
    case 'like':
      return `${actorName} liked your post`
    case 'chat':
      return n.count > 1 ? `${n.count} new messages in ${clubName}` : `${actorName} sent a message in ${clubName}`
    case 'club_join':
      return `${actorName} joined ${clubName}`
    default:
      return 'New notification'
  }
}

function formatNotification(n) {
  return {
    id: n.id,
    type: n.type,
    read: n.read,
    count: n.count,
    createdAt: n.createdAt,
    actor: n.actor,
    message: messageFor(n),
    target: { tab: 'clubs', clubId: n.clubId, subTab: subTabFor(n.type) },
  }
}

// GET /api/notifications
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const userId = req.userId

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      include: {
        actor: { select: USER_SELECT },
        club: { select: { id: true, name: true, emoji: true, accentColor: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: [{ read: 'asc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ])

  res.json({
    notifications: notifications.map(formatNotification),
    unreadCount,
    hasMore: notifications.length === PAGE_SIZE,
  })
}))

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.userId, read: false },
    data: { read: true },
  })
  res.json({ ok: true })
}))

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== req.userId) {
    return res.status(404).json({ error: 'Notification not found' })
  }

  await prisma.notification.update({ where: { id }, data: { read: true } })
  res.json({ ok: true })
}))

export default router
