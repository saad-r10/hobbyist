import { afterEach, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

afterEach(async () => {
  // Delete in dependency order; cascade handles children
  await prisma.activity.deleteMany()
  await prisma.memberProgress.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.reply.deleteMany()
  await prisma.post.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.clubItem.deleteMany()
  await prisma.clubMember.deleteMany()
  await prisma.club.deleteMany()
  await prisma.personalRating.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
