import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// POST /api/import
// Body: { source: 'letterboxd'|'goodreads', items: [{ title, subtitle, type, rating, consumedAt }] }
router.post('/', requireAuth, [
  body('source').isIn(['letterboxd', 'goodreads', 'manual']),
  body('items').isArray({ min: 1, max: 5000 }),
  body('items.*.title').isString().trim().notEmpty(),
  body('items.*.type').isIn(['book', 'film', 'podcast', 'game']),
  body('items.*.rating').optional({ nullable: true }).isFloat({ min: 0.5, max: 5 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

  const { source, items } = req.body
  const userId = req.userId

  let imported = 0
  let skipped = 0

  for (const item of items) {
    const { title, subtitle = '', type, rating, consumedAt } = item

    try {
      await prisma.personalRating.upsert({
        where: { userId_title_type: { userId, title: title.trim(), type } },
        update: {
          subtitle: subtitle.trim(),
          rating: rating ?? null,
          source,
          consumedAt: consumedAt ? new Date(consumedAt) : null,
        },
        create: {
          userId,
          title: title.trim(),
          subtitle: subtitle.trim(),
          type,
          rating: rating ?? null,
          source,
          consumedAt: consumedAt ? new Date(consumedAt) : null,
        },
      })
      imported++
    } catch {
      skipped++
    }
  }

  // Log as an activity
  await prisma.activity.create({
    data: {
      userId,
      type: 'import',
      title: `${imported} items`,
      extra: JSON.stringify({ source, imported, skipped }),
    }
  })

  res.json({ imported, skipped, total: items.length })
}))

// GET /api/import — fetch the user's personal library
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { type, source } = req.query

  const where = { userId: req.userId }
  if (type) where.type = type
  if (source) where.source = source

  const items = await prisma.personalRating.findMany({
    where,
    orderBy: [{ consumedAt: 'desc' }, { createdAt: 'desc' }],
    take: 500,
  })

  res.json(items)
}))

// DELETE /api/import/:id — remove a personal rating
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const item = await prisma.personalRating.findUnique({ where: { id } })
  if (!item || item.userId !== req.userId) return res.status(404).json({ error: 'Not found' })
  await prisma.personalRating.delete({ where: { id } })
  res.json({ ok: true })
}))

export default router
