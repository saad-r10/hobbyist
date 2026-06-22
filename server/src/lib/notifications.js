// Helpers for creating Notification records when club activity happens.

export async function notifyNewPost(prisma, { clubId, actorId, postId }) {
  const members = await prisma.clubMember.findMany({
    where: { clubId, userId: { not: actorId } },
    select: { userId: true },
  })
  if (members.length === 0) return

  await prisma.notification.createMany({
    data: members.map(m => ({ userId: m.userId, actorId, clubId, postId, type: 'post' })),
  })
}

export async function notifyReply(prisma, { postOwnerId, actorId, clubId, postId }) {
  if (postOwnerId === actorId) return

  await prisma.notification.create({
    data: { userId: postOwnerId, actorId, clubId, postId, type: 'reply' },
  })
}

export async function notifyReaction(prisma, { postOwnerId, actorId, clubId, postId }) {
  if (postOwnerId === actorId) return

  await prisma.notification.create({
    data: { userId: postOwnerId, actorId, clubId, postId, type: 'like' },
  })
}

export async function notifyClubJoin(prisma, { clubId, actorId }) {
  const admins = await prisma.clubMember.findMany({
    where: { clubId, role: 'admin', userId: { not: actorId } },
    select: { userId: true },
  })
  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map(a => ({ userId: a.userId, actorId, clubId, type: 'club_join' })),
  })
}

export async function notifyChatMessage(prisma, { clubId, actorId }) {
  const members = await prisma.clubMember.findMany({
    where: { clubId, userId: { not: actorId } },
    select: { userId: true },
  })

  for (const { userId } of members) {
    const existing = await prisma.notification.findFirst({
      where: { userId, clubId, type: 'chat', read: false },
    })

    if (existing) {
      await prisma.notification.update({
        where: { id: existing.id },
        data: { count: { increment: 1 }, actorId },
      })
    } else {
      await prisma.notification.create({
        data: { userId, actorId, clubId, type: 'chat' },
      })
    }
  }
}
