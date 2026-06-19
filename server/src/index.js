import { createServer } from 'http'
import app from './app.js'
import { initSocketServer } from './lib/socketServer.js'

const PORT = process.env.PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'

const corsOrigins = isDev
  ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173']
  : (process.env.CLIENT_ORIGIN || 'https://saad-r10.github.io')

const httpServer = createServer(app)
initSocketServer(httpServer, corsOrigins)

httpServer.listen(PORT, () => {
  console.log(`[hobbyist] server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`)
})
