import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { signAccessToken, signRefreshToken, verifyToken } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#E8A020','#7A9E7E','#6B8DD6','#C47D5A','#9B6DB5','#4AADAB','#E87070','#D4A853']

function pickColor(email) {
  let hash = 0
  for (const c of email) hash = (hash << 5) - hash + c.charCodeAt(0)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 2, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('displayName').isLength({ min: 1, max: 60 }).trim(),
  body('password').isLength({ min: 8 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const { email, username, displayName, password } = req.body

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  })
  if (exists) {
    const field = exists.email === email ? 'email' : 'username'
    return res.status(409).json({ error: `That ${field} is already taken` })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      username: username.toLowerCase(),
      displayName,
      passwordHash,
      avatarInitials: initials(displayName),
      avatarColor: pickColor(email),
    }
  })

  const accessToken = signAccessToken(user.id)
  const refreshToken = signRefreshToken(user.id)
  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 86400000) }
  })

  res.cookie('rt', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 86400000 })
  res.status(201).json({
    accessToken,
    user: { id: user.id, email: user.email, username: user.username, displayName: user.displayName, avatarColor: user.avatarColor, avatarInitials: user.avatarInitials, onboardingDone: user.onboardingDone }
  })
}))

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

  const accessToken = signAccessToken(user.id)
  const refreshToken = signRefreshToken(user.id)
  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 86400000) }
  })

  res.cookie('rt', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 86400000 })
  res.json({
    accessToken,
    user: { id: user.id, email: user.email, username: user.username, displayName: user.displayName, avatarColor: user.avatarColor, avatarInitials: user.avatarInitials, onboardingDone: user.onboardingDone }
  })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.rt
  if (!token) return res.status(401).json({ error: 'No refresh token' })

  let payload
  try { payload = verifyToken(token) } catch { return res.status(401).json({ error: 'Invalid refresh token' }) }

  const stored = await prisma.refreshToken.findUnique({ where: { token } })
  if (!stored || stored.userId !== payload.sub) return res.status(401).json({ error: 'Invalid refresh token' })

  await prisma.refreshToken.delete({ where: { token } })
  const newRefresh = signRefreshToken(payload.sub)
  await prisma.refreshToken.create({
    data: { userId: payload.sub, token: newRefresh, expiresAt: new Date(Date.now() + 7 * 86400000) }
  })

  res.cookie('rt', newRefresh, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 86400000 })
  res.json({ accessToken: signAccessToken(payload.sub) })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.rt
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {})
    res.clearCookie('rt')
  }
  res.json({ ok: true })
}))

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  // Always return success to prevent enumeration
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600000) }
    })
    // In production: send email with reset link
    console.log(`[DEV] Password reset link: http://localhost:5173/reset-password?token=${token}`)
  }
  res.json({ message: 'If that email exists, a reset link has been sent.' })
}))

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const { token, password } = req.body
  const reset = await prisma.passwordReset.findUnique({ where: { token } })
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Reset link is invalid or expired' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } })
  await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } })
  await prisma.refreshToken.deleteMany({ where: { userId: reset.userId } })
  res.json({ message: 'Password updated. Please log in.' })
}))

export default router
