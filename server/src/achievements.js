export const ACHIEVEMENTS = [
  { id: 'first_finish',    emoji: '📖', name: 'First Chapter',    description: 'Submit your first rating',               category: 'milestone' },
  { id: 'completionist',   emoji: '✅', name: 'Completionist',    description: 'Rate 10 items',                          category: 'milestone' },
  { id: 'prolific',        emoji: '🏆', name: 'Prolific',         description: 'Rate 25 items',                          category: 'milestone' },
  { id: 'bookworm',        emoji: '📚', name: 'Bookworm',         description: 'Rate 5 books',                           category: 'books'     },
  { id: 'cinephile',       emoji: '🎬', name: 'Cinephile',        description: 'Rate 5 films',                           category: 'films'     },
  { id: 'polymath',        emoji: '🌐', name: 'Polymath',         description: 'Rate at least one of every media type',  category: 'milestone' },
  { id: 'founder',         emoji: '🏛️', name: 'Founder',          description: 'Create your first club',                 category: 'social'   },
  { id: 'joiner',          emoji: '🤝', name: 'Club Hopper',      description: 'Join 3 clubs',                           category: 'social'   },
  { id: 'social_butterfly',emoji: '🦋', name: 'Social Butterfly', description: 'Write 10 posts',                         category: 'social'   },
  { id: 'critic',          emoji: '✍️', name: 'Critic',           description: 'Leave 5 reviews with text',              category: 'quality'  },
]

export async function checkAchievements(prisma, userId) {
  const earned = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const earnedSet = new Set(earned.map(e => e.achievementId))

  const [clubRatings, memberships, postCount, activities, personalRatings] = await Promise.all([
    prisma.rating.findMany({ where: { userId }, select: { itemId: true, review: true } }),
    prisma.clubMember.findMany({ where: { userId }, select: { clubId: true } }),
    prisma.post.count({ where: { userId } }),
    prisma.activity.findMany({ where: { userId, type: 'created_club' }, select: { id: true } }),
    prisma.personalRating.findMany({ where: { userId }, select: { type: true, review: true } }),
  ])

  const itemIds = clubRatings.map(r => r.itemId)
  const items = itemIds.length > 0
    ? await prisma.clubItem.findMany({ where: { id: { in: itemIds } }, select: { id: true, type: true } })
    : []
  const itemTypeMap = Object.fromEntries(items.map(i => [i.id, i.type]))

  const ratingsByType = {}
  for (const r of clubRatings) {
    const type = itemTypeMap[r.itemId]
    if (type) ratingsByType[type] = (ratingsByType[type] || 0) + 1
  }
  for (const pr of personalRatings) {
    ratingsByType[pr.type] = (ratingsByType[pr.type] || 0) + 1
  }

  const totalRatings = clubRatings.length + personalRatings.length
  const reviewsWithText = [
    ...clubRatings.filter(r => r.review?.trim()),
    ...personalRatings.filter(r => r.review?.trim()),
  ].length

  const checks = {
    first_finish:     () => totalRatings >= 1,
    completionist:    () => totalRatings >= 10,
    prolific:         () => totalRatings >= 25,
    bookworm:         () => (ratingsByType.book || 0) >= 5,
    cinephile:        () => (ratingsByType.film || 0) >= 5,
    polymath:         () => ['book', 'film', 'podcast', 'game'].every(t => (ratingsByType[t] || 0) >= 1),
    founder:          () => activities.length >= 1,
    joiner:           () => memberships.length >= 3,
    social_butterfly: () => postCount >= 10,
    critic:           () => reviewsWithText >= 5,
  }

  const newlyEarned = []
  for (const [id, check] of Object.entries(checks)) {
    if (!earnedSet.has(id) && check()) {
      await prisma.userAchievement.create({ data: { userId, achievementId: id } })
      newlyEarned.push(id)
    }
  }

  return newlyEarned
}
