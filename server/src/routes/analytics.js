import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.userId

  const [clubRatings, personalRatings, activities, memberships] = await Promise.all([
    prisma.rating.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.personalRating.findMany({
      where: { userId },
      orderBy: [{ consumedAt: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.activity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.clubMember.count({ where: { userId } }),
  ])

  // Merge both rating sources into a unified list
  const allRatings = [
    ...clubRatings.map(r => ({
      id: `club-${r.id}`,
      title: r.item.title,
      subtitle: r.item.subtitle,
      type: r.item.type,
      rating: r.rating,
      review: r.review,
      source: 'club',
      createdAt: r.createdAt,
    })),
    ...personalRatings.map(r => ({
      id: `personal-${r.id}`,
      title: r.title,
      subtitle: r.subtitle,
      type: r.type,
      rating: r.rating,
      review: r.review,
      source: r.source,
      createdAt: r.consumedAt || r.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const rated = allRatings.filter(r => r.rating != null)
  const avgRating = rated.length
    ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1)
    : 0

  // Monthly breakdown — count unique finished items per month
  const now = new Date()
  const monthly = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

    const inMonth = allRatings.filter(r => {
      const t = new Date(r.createdAt)
      return t >= d && t < end
    })

    const byType = { book: 0, film: 0, podcast: 0, game: 0 }
    inMonth.forEach(r => { if (byType[r.type] !== undefined) byType[r.type]++ })

    monthly.push({
      month: MONTH_NAMES[d.getMonth()],
      total: inMonth.length,
      ...byType,
    })
  }

  // Type distribution across all ratings
  const typeMap = { book: 0, film: 0, podcast: 0, game: 0 }
  allRatings.forEach(r => { if (typeMap[r.type] !== undefined) typeMap[r.type]++ })
  const typeTotal = Object.values(typeMap).reduce((a, b) => a + b, 0) || 1
  const types = Object.entries(typeMap).map(([type, count]) => ({
    type, count, pct: Math.round((count / typeTotal) * 100),
  }))

  // Activity heatmap: personal ratings add weight on their consumed date
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  const dayMap = {}
  activities.forEach(a => {
    const key = new Date(a.createdAt).toDateString()
    dayMap[key] = (dayMap[key] || 0) + 1
  })
  personalRatings.forEach(r => {
    const date = r.consumedAt || r.createdAt
    const key = new Date(date).toDateString()
    dayMap[key] = (dayMap[key] || 0) + 1
  })

  const heatmap = []
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

  // Import breakdown for profile display
  const importSources = {}
  personalRatings.forEach(r => {
    importSources[r.source] = (importSources[r.source] || 0) + 1
  })

  res.json({
    summary: {
      finished: allRatings.length,
      avgRating: Number(avgRating),
      clubs: memberships,
      thisYear: allRatings.filter(r => new Date(r.createdAt).getFullYear() === now.getFullYear()).length,
      imported: personalRatings.length,
    },
    monthly,
    types,
    heatmap,
    recentRatings: allRatings.slice(0, 8),
    importSources,
  })
}))

export default router
