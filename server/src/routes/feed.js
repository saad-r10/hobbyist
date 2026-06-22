import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { formatActivity } from '../lib/activityFormat.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/feed — global activity from all clubs the user is in
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const myClubIds = (await prisma.clubMember.findMany({
    where: { userId: req.userId }, select: { clubId: true }
  })).map(m => m.clubId)

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

  res.json(activities.map(formatActivity))
}))

export default router
