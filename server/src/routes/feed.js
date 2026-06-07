import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

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
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function activityLabel(type) {
  const map = {
    started_item: 'started',
    finished_item: 'finished',
    rated: 'rated',
    joined_club: 'joined',
    created_club: 'created',
    posted: 'posted in',
  }
  return map[type] || type
}

// GET /api/feed — global activity from all clubs the user is in
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  // Get clubs the user is in
  const myClubIds = (await prisma.clubMember.findMany({
    where: { userId: req.userId }, select: { clubId: true }
  })).map(m => m.clubId)

  // Get all members of those clubs
  const clubmateIds = (await prisma.clubMember.findMany({
    where: { clubId: { in: myClubIds } },
    select: { userId: true },
    distinct: ['userId'],
  })).map(m => m.userId)

  const activities = await prisma.activity.findMany({
    where: { userId: { in: clubmateIds } },
    include: {
      user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  })

  const feed = activities.map(a => ({
    id: a.id,
    type: a.type,
    label: activityLabel(a.type),
    title: a.title,
    clubName: a.clubName,
    rating: a.rating,
    extra: JSON.parse(a.extra || '{}'),
    time: timeAgo(a.createdAt),
    createdAt: a.createdAt,
    user: a.user,
    likeCount: Math.floor(Math.random() * 12),
    commentCount: Math.floor(Math.random() * 6),
  }))

  res.json(feed)
}))

export default router
