import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { ACHIEVEMENTS } from '../achievements.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/achievements
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const earned = await prisma.userAchievement.findMany({
    where: { userId: req.userId },
    orderBy: { earnedAt: 'asc' },
  })

  const earnedMap = Object.fromEntries(earned.map(e => [e.achievementId, e]))

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    earned: !!earnedMap[a.id],
    earnedAt: earnedMap[a.id]?.earnedAt || null,
    isNew: earnedMap[a.id] ? earnedMap[a.id].seenAt === null : false,
  }))

  res.json({ achievements })
}))

// POST /api/achievements/seen
router.post('/seen', requireAuth, asyncHandler(async (req, res) => {
  await prisma.userAchievement.updateMany({
    where: { userId: req.userId, seenAt: null },
    data: { seenAt: new Date() },
  })
  res.json({ ok: true })
}))

export default router
