import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

function safeUser(u) {
  return {
    id: u.id, email: u.email, username: u.username, displayName: u.displayName,
    bio: u.bio, avatarColor: u.avatarColor, avatarInitials: u.avatarInitials,
    onboardingDone: u.onboardingDone, interests: JSON.parse(u.interests || '[]'),
    createdAt: u.createdAt,
  }
}

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const [finishedCount, clubCount] = await Promise.all([
    prisma.rating.count({ where: { userId: req.userId } }),
    prisma.clubMember.count({ where: { userId: req.userId } }),
  ])

  res.json({ ...safeUser(user), stats: { finished: finishedCount, clubs: clubCount } })
}))

router.put('/me', requireAuth, [
  body('displayName').optional().isLength({ min: 1, max: 60 }).trim(),
  body('bio').optional().isLength({ max: 300 }).trim(),
  body('interests').optional().isArray(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const { displayName, bio, interests } = req.body
  const data = {}
  if (displayName !== undefined) data.displayName = displayName
  if (bio !== undefined) data.bio = bio
  if (interests !== undefined) data.interests = JSON.stringify(interests)

  const user = await prisma.user.update({ where: { id: req.userId }, data })
  res.json(safeUser(user))
}))

router.post('/me/onboarding', requireAuth, [
  body('interests').isArray(),
  body('bio').optional().trim(),
], asyncHandler(async (req, res) => {
  const { interests, bio } = req.body
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { interests: JSON.stringify(interests), bio: bio || '', onboardingDone: true }
  })
  res.json(safeUser(user))
}))

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(safeUser(user))
}))

export default router
