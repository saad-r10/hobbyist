import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.userId

  const [ratings, activities, memberships] = await Promise.all([
    prisma.rating.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.clubMember.count({ where: { userId } }),
  ])

  // Summary
  const avgRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : 0

  // Monthly breakdown for last 6 months
  const now = new Date()
  const monthly = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

    const monthActivities = activities.filter(a => {
      const t = new Date(a.createdAt)
      return t >= d && t < end
    })

    const byType = { book: 0, film: 0, podcast: 0, game: 0 }
    monthActivities.forEach(a => {
      if (a.type === 'rated' || a.type === 'finished_item') {
        // Try to figure out type from title or default to book
        byType.book++
      }
    })

    monthly.push({
      month: MONTH_NAMES[d.getMonth()],
      total: monthActivities.length,
      ...byType,
    })
  }

  // Type distribution
  const typeMap = { book: 0, film: 0, podcast: 0, game: 0 }
  ratings.forEach(r => {
    const type = r.item.type
    if (typeMap[type] !== undefined) typeMap[type]++
  })
  const total = Object.values(typeMap).reduce((a, b) => a + b, 0) || 1
  const types = Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
    pct: Math.round((count / total) * 100),
  }))

  // Activity heatmap: last 52 weeks
  const heatmap = []
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  const dayMap = {}
  activities.forEach(a => {
    const key = new Date(a.createdAt).toDateString()
    dayMap[key] = (dayMap[key] || 0) + 1
  })

  for (let w = 0; w < 52; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(yearAgo)
      date.setDate(date.getDate() + w * 7 + d)
      const count = dayMap[date.toDateString()] || 0
      week.push({ date: date.toISOString().slice(0, 10), count })
    }
    heatmap.push(week)
  }

  // Recent ratings
  const recentRatings = ratings.slice(0, 8).map(r => ({
    id: r.id,
    title: r.item.title,
    subtitle: r.item.subtitle,
    type: r.item.type,
    rating: r.rating,
    review: r.review,
    createdAt: r.createdAt,
  }))

  res.json({
    summary: {
      finished: ratings.length,
      avgRating: Number(avgRating),
      clubs: memberships,
      thisYear: activities.filter(a => new Date(a.createdAt).getFullYear() === now.getFullYear()).length,
    },
    monthly,
    types,
    heatmap,
    recentRatings,
  })
}))

export default router
