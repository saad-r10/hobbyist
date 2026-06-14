import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { notifyClubJoin } from '../lib/notifications.js'

const router = Router()
const prisma = new PrismaClient()

const CLUB_TYPES = {
  book: { emoji: '📚', accent: '#C47D5A', bg: '#2A1A0E' },
  film: { emoji: '🎬', accent: '#6B8DD6', bg: '#0D1528' },
  podcast: { emoji: '🎙️', accent: '#4AADAB', bg: '#0D2020' },
  game: { emoji: '🎮', accent: '#9B6DB5', bg: '#1A1028' },
}

async function formatClub(club, userId) {
  const currentItem = await prisma.clubItem.findFirst({
    where: { clubId: club.id, status: 'current' }
  })

  let myProgress = 0
  if (currentItem && userId) {
    const mp = await prisma.memberProgress.findUnique({
      where: { userId_itemId: { userId, itemId: currentItem.id } }
    })
    myProgress = mp?.progress ?? 0
  }

  const memberCount = await prisma.clubMember.count({ where: { clubId: club.id } })

  return {
    id: club.id,
    name: club.name,
    description: club.description,
    type: club.type,
    emoji: club.emoji,
    accentColor: club.accentColor,
    bgColor: club.bgColor,
    isPublic: club.isPublic,
    memberCount,
    currentItem: currentItem ? {
      id: currentItem.id,
      title: currentItem.title,
      subtitle: currentItem.subtitle,
      description: currentItem.description,
      coverColor: currentItem.coverColor,
      type: currentItem.type,
      myProgress,
    } : null,
  }
}

// GET /api/clubs — my clubs
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const memberships = await prisma.clubMember.findMany({
    where: { userId: req.userId },
    include: { club: true },
    orderBy: { joinedAt: 'desc' },
  })

  const clubs = await Promise.all(memberships.map(m => formatClub(m.club, req.userId)))
  res.json(clubs)
}))

// GET /api/clubs/explore — all public clubs (not joined)
router.get('/explore', requireAuth, asyncHandler(async (req, res) => {
  const myIds = (await prisma.clubMember.findMany({
    where: { userId: req.userId }, select: { clubId: true }
  })).map(m => m.clubId)

  const clubs = await prisma.club.findMany({
    where: { isPublic: true, id: { notIn: myIds } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const formatted = await Promise.all(clubs.map(c => formatClub(c, req.userId)))
  res.json(formatted)
}))

// GET /api/clubs/:id — single club with full detail
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id)
  const membership = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: req.userId, clubId } },
  })
  if (!membership) {
    const club = await prisma.club.findUnique({ where: { id: clubId } })
    if (!club || !club.isPublic) return res.status(403).json({ error: 'Not a member' })
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } })
  if (!club) return res.status(404).json({ error: 'Club not found' })

  const [currentItem, pastItems, memberDetails] = await Promise.all([
    prisma.clubItem.findFirst({ where: { clubId, status: 'current' } }),
    prisma.clubItem.findMany({
      where: { clubId, status: 'past' },
      include: { ratings: true },
      orderBy: { finishedAt: 'desc' },
    }),
    prisma.clubMember.findMany({
      where: { clubId },
      include: { user: { select: { id: true, displayName: true, avatarColor: true, avatarInitials: true, username: true } } },
    }),
  ])

  let myProgress = 0
  let allProgress = []
  if (currentItem) {
    const progressRows = await prisma.memberProgress.findMany({
      where: { itemId: currentItem.id },
    })
    const myRow = progressRows.find(p => p.userId === req.userId)
    myProgress = myRow?.progress ?? 0
    allProgress = progressRows
  }

  const formattedPast = pastItems.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    coverColor: item.coverColor,
    type: item.type,
    finishedAt: item.finishedAt,
    avgRating: item.ratings.length
      ? item.ratings.reduce((s, r) => s + r.rating, 0) / item.ratings.length
      : null,
    ratingCount: item.ratings.length,
  }))

  const formattedMembers = memberDetails.map(m => {
    const prog = allProgress.find(p => p.userId === m.userId)
    return {
      user: m.user,
      role: m.role,
      joinedAt: m.joinedAt,
      progress: prog?.progress ?? 0,
    }
  })

  res.json({
    id: club.id,
    name: club.name,
    description: club.description,
    type: club.type,
    emoji: club.emoji,
    accentColor: club.accentColor,
    bgColor: club.bgColor,
    isPublic: club.isPublic,
    isMember: !!membership,
    myRole: membership?.role ?? null,
    currentItem: currentItem ? {
      id: currentItem.id,
      title: currentItem.title,
      subtitle: currentItem.subtitle,
      description: currentItem.description,
      coverColor: currentItem.coverColor,
      type: currentItem.type,
      myProgress,
    } : null,
    pastItems: formattedPast,
    members: formattedMembers,
  })
}))

// POST /api/clubs — create
router.post('/', requireAuth, [
  body('name').isLength({ min: 1, max: 80 }).trim(),
  body('type').isIn(['book', 'film', 'podcast', 'game']),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('isPublic').optional().isBoolean(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const { name, type, description, isPublic = true } = req.body
  const defaults = CLUB_TYPES[type] || CLUB_TYPES.book

  const club = await prisma.club.create({
    data: {
      name, type, description: description || '', isPublic,
      emoji: defaults.emoji, accentColor: defaults.accent, bgColor: defaults.bg,
    }
  })

  await prisma.clubMember.create({ data: { userId: req.userId, clubId: club.id, role: 'admin' } })

  await prisma.activity.create({
    data: { userId: req.userId, type: 'created_club', clubName: club.name }
  })

  res.status(201).json(await formatClub(club, req.userId))
}))

// POST /api/clubs/:id/join
router.post('/:id/join', requireAuth, asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id)
  const club = await prisma.club.findUnique({ where: { id: clubId } })
  if (!club) return res.status(404).json({ error: 'Club not found' })

  const existing = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: req.userId, clubId } }
  })
  if (existing) return res.status(409).json({ error: 'Already a member' })

  await prisma.clubMember.create({ data: { userId: req.userId, clubId } })
  await prisma.activity.create({
    data: { userId: req.userId, type: 'joined_club', clubName: club.name }
  })
  await notifyClubJoin(prisma, { clubId, actorId: req.userId })

  res.json({ ok: true })
}))

// DELETE /api/clubs/:id/leave
router.delete('/:id/leave', requireAuth, asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id)
  await prisma.clubMember.deleteMany({ where: { userId: req.userId, clubId } })
  res.json({ ok: true })
}))

// PUT /api/clubs/:id/progress — update my progress on current item
router.put('/:id/progress', requireAuth, [
  body('progress').isInt({ min: 0, max: 100 }),
], asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id)
  const { progress } = req.body

  const currentItem = await prisma.clubItem.findFirst({ where: { clubId, status: 'current' } })
  if (!currentItem) return res.status(404).json({ error: 'No current item' })

  await prisma.memberProgress.upsert({
    where: { userId_itemId: { userId: req.userId, itemId: currentItem.id } },
    update: { progress },
    create: { userId: req.userId, itemId: currentItem.id, progress },
  })

  res.json({ progress })
}))

// POST /api/clubs/:id/items — add item to club (admin only)
router.post('/:id/items', requireAuth, [
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('subtitle').optional().trim(),
  body('description').optional().trim(),
  body('type').isIn(['book', 'film', 'podcast', 'game']),
  body('coverColor').optional(),
], asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id)
  const membership = await prisma.clubMember.findUnique({
    where: { userId_clubId: { userId: req.userId, clubId } }
  })
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add items' })
  }

  // Mark existing current item as past
  await prisma.clubItem.updateMany({
    where: { clubId, status: 'current' },
    data: { status: 'past', finishedAt: new Date() },
  })

  const item = await prisma.clubItem.create({
    data: {
      clubId,
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      type: req.body.type,
      coverColor: req.body.coverColor || '#162030',
    }
  })

  res.status(201).json(item)
}))

// POST /api/clubs/:id/rate — rate current item
router.post('/:id/rate', requireAuth, [
  body('rating').isFloat({ min: 1, max: 5 }),
  body('review').optional().trim(),
], asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id)
  const { rating, review } = req.body

  const currentItem = await prisma.clubItem.findFirst({ where: { clubId, status: 'current' } })
  if (!currentItem) return res.status(404).json({ error: 'No current item to rate' })

  const saved = await prisma.rating.upsert({
    where: { userId_itemId: { userId: req.userId, itemId: currentItem.id } },
    update: { rating, review: review || '' },
    create: { userId: req.userId, itemId: currentItem.id, rating, review: review || '' },
  })

  await prisma.activity.create({
    data: { userId: req.userId, type: 'rated', title: currentItem.title, rating, clubName: '' }
  })

  res.json(saved)
}))

export default router
