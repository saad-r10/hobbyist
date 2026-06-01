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
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isDev ? false : undefined,
}))

app.use(cors({
  origin: isDev
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:4173']
    : (process.env.CLIENT_ORIGIN || 'https://saad-r10.github.io'),
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Rate limiting — strict on auth, generous on API
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter)
app.use('/api', apiLimiter)

// Routes
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

app.get('/api/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }))
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[hobbyist] server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`)
})
