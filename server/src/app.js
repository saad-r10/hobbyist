import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import clubRoutes from './routes/clubs.js'
import feedRoutes from './routes/feed.js'
import discoverRoutes from './routes/discover.js'
import leaderboardRoutes from './routes/leaderboard.js'
import analyticsRoutes from './routes/analytics.js'
import postRoutes from './routes/posts.js'
import chatRoutes from './routes/chat.js'
import importRoutes from './routes/import.js'
import searchRoutes from './routes/search.js'
import notificationRoutes from './routes/notifications.js'
import coverArtRoutes from './routes/coverArt.js'
import achievementRoutes from './routes/achievements.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const isDev = process.env.NODE_ENV !== 'production'

// Trust Railway's reverse proxy so express-rate-limit can read the real client IP
app.set('trust proxy', 1)

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isDev ? false : undefined,
}))

app.use(cors({
  origin: isDev
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173']
    : (process.env.CLIENT_ORIGIN || 'https://saad-r10.github.io'),
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter)
app.use('/api', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/discover', discoverRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/import', importRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/cover-art', coverArtRoutes)
app.use('/api/achievements', achievementRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }))

// Serve the built frontend (single-service deploy) — must come after API routes
// so unmatched /api/* requests still fall through to the JSON error handler.
if (!isDev) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distDir = path.join(__dirname, '../../dist')

  app.use(express.static(distDir))
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.use(errorHandler)

export default app
