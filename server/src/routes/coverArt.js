import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { lookupCover } from '../services/coverArt.js'

const router = Router()

// GET /api/cover-art?title=&subtitle=&type=
// Returns { coverUrl: string|null } — used by the frontend to preview cover art before saving.
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { title, subtitle = '', type } = req.query
  if (!title || !type) return res.status(400).json({ error: 'title and type are required' })

  const coverUrl = await lookupCover(title.trim(), subtitle.trim(), type)
  res.json({ coverUrl })
}))

export default router
