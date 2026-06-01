import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// Simple streak: consecutive days with at least one activity
async function computeStreak(userId) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!activities.length) return 0

  const days = new Set(activities.map(a => new Date(a.createdAt).toDateString()))
  const sorted = [...days].map(d => new Date(d)).sort((a, b) => b - a)

  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (const day of sorted) {
    const dayStr = day.toDateString()
    const cursorStr = cursor.toDateString()
    if (dayStr === cursorStr) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else break
  }

  return streak
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const period = req.query.period || 'month'

  let since = new Date()
  if (period === 'week') since.setDate(since.getDate() - 7)
  else if (period === 'month') since.setMonth(since.getMonth() - 1)
  else since = new Date(0) // all-time

  const allUsers = await prisma.user.findMany({
    include: { activities: { where: { createdAt: { gte: since } } } }
  })

  const scored = allUsers.map(u => ({
    id: u.id,
    displayName: u.displayName,
    username: u.username,
    avatarColor: u.avatarColor,
    avatarInitials: u.avatarInitials,
    score: u.activities.length * 10,
    finished: u.activities.filter(a => a.type === 'finished_item' || a.type === 'rated').length,
  }))

  scored.sort((a, b) => b.score - a.score)

  // Add streaks for top 10 (expensive, so only top 10)
  const top10 = scored.slice(0, 10)
  const withStreaks = await Promise.all(top10.map(async (u, i) => ({
    ...u,
    rank: i + 1,
    streak: await computeStreak(u.id),
  })))

  const meEntry = withStreaks.find(e => e.id === req.userId)
  const myRank = meEntry ? meEntry.rank : scored.findIndex(e => e.id === req.userId) + 1

  res.json({ entries: withStreaks, myRank, myScore: scored.find(e => e.id === req.userId)?.score ?? 0 })
}))

export default router
