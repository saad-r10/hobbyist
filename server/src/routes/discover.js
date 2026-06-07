import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.userId

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const interests = JSON.parse(user?.interests || '[]')

  const myClubIds = (await prisma.clubMember.findMany({
    where: { userId }, select: { clubId: true }
  })).map(m => m.clubId)

  const [trending, newClubs, forYou, people] = await Promise.all([
    // Trending: public clubs with most members (that user isn't in)
    prisma.club.findMany({
      where: { isPublic: true, id: { notIn: myClubIds } },
      include: {
        _count: { select: { members: true, posts: true } },
        items: { where: { status: 'current' }, take: 1 },
      },
      orderBy: { members: { _count: 'desc' } },
      take: 8,
    }),

    // New: recently created public clubs
    prisma.club.findMany({
      where: {
        isPublic: true,
        id: { notIn: myClubIds },
        createdAt: { gte: new Date(Date.now() - 90 * 86400000) },
      },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),

    // For You: clubs matching user interests not already joined
    interests.length > 0
      ? prisma.club.findMany({
          where: {
            isPublic: true,
            id: { notIn: myClubIds },
            type: { in: interests },
          },
          include: { _count: { select: { members: true } }, items: { where: { status: 'current' }, take: 1 } },
          orderBy: { members: { _count: 'desc' } },
          take: 8,
        })
      : [],

    // People: users who share club memberships but aren't the current user
    prisma.user.findMany({
      where: {
        id: { not: userId },
        memberships: { some: { clubId: { in: myClubIds } } },
      },
      select: { id: true, displayName: true, username: true, avatarColor: true, avatarInitials: true, bio: true, interests: true },
      take: 6,
    }),
  ])

  function formatClub(c) {
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      emoji: c.emoji,
      accentColor: c.accentColor,
      bgColor: c.bgColor,
      memberCount: c._count?.members ?? 0,
      postCount: c._count?.posts ?? 0,
      currentItem: c.items?.[0] ? { title: c.items[0].title, subtitle: c.items[0].subtitle } : null,
    }
  }

  res.json({
    trending: trending.map(formatClub),
    newClubs: newClubs.map(formatClub),
    forYou: forYou.map(formatClub),
    people: people.map(p => ({ ...p, interests: JSON.parse(p.interests || '[]') })),
    myClubCount: myClubIds.length,
  })
}))

export default router
