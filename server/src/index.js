import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

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

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
