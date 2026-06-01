import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/search?q=query&type=all|users|clubs|items&limit=8
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim()
  const type = req.query.type || 'all'
  const limit = Math.min(Number(req.query.limit) || 8, 20)

  if (q.length < 1) return res.json({ users: [], clubs: [], items: [] })

  const term = `%${q}%`

  const [users, clubs, items] = await Promise.all([
    type === 'all' || type === 'users'
      ? prisma.user.findMany({
          where: {
            OR: [
              { displayName: { contains: q } },
              { username: { contains: q } },
              { bio: { contains: q } },
            ]
          },
          select: { id: true, displayName: true, username: true, avatarColor: true, avatarInitials: true, bio: true },
          take: limit,
        })
      : [],
    type === 'all' || type === 'clubs'
      ? prisma.club.findMany({
          where: {
            isPublic: true,
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { type: { contains: q } },
            ]
          },
          include: { _count: { select: { members: true } } },
          take: limit,
        })
      : [],
    type === 'all' || type === 'items'
      ? prisma.clubItem.findMany({
          where: {
            OR: [
              { title: { contains: q } },
              { subtitle: { contains: q } },
            ]
          },
          include: { club: { select: { name: true, accentColor: true } } },
          orderBy: { addedAt: 'desc' },
          take: limit,
        })
      : [],
  ])

  res.json({
    users,
    clubs: clubs.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      emoji: c.emoji,
      accentColor: c.accentColor,
      memberCount: c._count.members,
    })),
    items: items.map(i => ({
      id: i.id,
      title: i.title,
      subtitle: i.subtitle,
      type: i.type,
      clubName: i.club?.name,
      clubColor: i.club?.accentColor,
    })),
  })
}))

export default router
