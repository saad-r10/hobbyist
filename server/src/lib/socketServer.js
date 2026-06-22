import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../middleware/auth.js'

const prisma = new PrismaClient()

let io = null

export function initSocketServer(httpServer, corsOrigins) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Not authenticated'))
    try {
      const payload = verifyToken(token)
      socket.userId = payload.sub
      next()
    } catch {
      next(new Error('Token expired or invalid'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.userId

    // Join personal room for feed events
    socket.join(`user:${userId}`)

    // Join a room for every club the user belongs to
    try {
      const memberships = await prisma.clubMember.findMany({
        where: { userId },
        select: { clubId: true },
      })
      for (const { clubId } of memberships) {
        socket.join(`club:${clubId}`)
      }
    } catch { /* non-fatal — live events just won't arrive */ }

    socket.on('chat:join', (clubId) => {
      socket.join(`club:${clubId}`)
    })

    socket.on('chat:leave', (clubId) => {
      socket.leave(`club:${clubId}`)
    })
  })

  return io
}

/** Broadcast a new chat message to everyone in the club except the sender */
export function emitChatMessage(clubId, message, senderSocketId) {
  if (!io) return
  const room = io.to(`club:${clubId}`)
  if (senderSocketId) {
    room.except(senderSocketId).emit('chat:message', message)
  } else {
    room.emit('chat:message', message)
  }
}

/** Push a feed activity item to all users who share a club with the actor */
export async function emitFeedActivity(actorId, activity) {
  if (!io) return
  try {
    const myClubIds = (await prisma.clubMember.findMany({
      where: { userId: actorId },
      select: { clubId: true },
    })).map(m => m.clubId)

    const recipientIds = (await prisma.clubMember.findMany({
      where: { clubId: { in: myClubIds }, userId: { not: actorId } },
      select: { userId: true },
      distinct: ['userId'],
    })).map(m => m.userId)

    for (const uid of recipientIds) {
      io.to(`user:${uid}`).emit('feed:activity', activity)
    }
  } catch { /* non-fatal */ }
}

export function getIO() { return io }
