import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const USERS_DATA = [
  { email: 'alex@hobbyist.app',   username: 'alexchen',  displayName: 'Alex Chen',    color: '#E8A020', bio: 'Reading, watching, and listening my way through life. SF → NYC.', interests: ['book','film'] },
  { email: 'maya@hobbyist.app',   username: 'mayap',     displayName: 'Maya Patel',   color: '#7A9E7E', bio: 'Design + sci-fi + too much coffee.', interests: ['book','podcast'] },
  { email: 'jordan@hobbyist.app', username: 'jordank',   displayName: 'Jordan Kim',   color: '#6B8DD6', bio: 'Cinema lover, aspiring critic.', interests: ['film'] },
  { email: 'sam@hobbyist.app',    username: 'samr',      displayName: 'Sam Rivera',   color: '#C47D5A', bio: 'Game dev by day, bookworm by night.', interests: ['game','book'] },
  { email: 'priya@hobbyist.app',  username: 'priyan',    displayName: 'Priya Nair',   color: '#9B6DB5', bio: 'Podcast addict. Always listening.', interests: ['podcast','film'] },
  { email: 'theo@hobbyist.app',   username: 'theow',     displayName: 'Theo Walsh',   color: '#4AADAB', bio: 'Music, film, the occasional novel.', interests: ['film','game'] },
  { email: 'ines@hobbyist.app',   username: 'inesm',     displayName: 'Ines Moreau',  color: '#E87070', bio: 'Parisienne in Brooklyn. Books and films and wine.', interests: ['book','film'] },
  { email: 'kai@hobbyist.app',    username: 'kain',      displayName: 'Kai Nakamura', color: '#D4A853', bio: 'Speedrunner and slow reader.', interests: ['game','podcast'] },
]

async function addPosts(clubId, userIds, posts) {
  for (const p of posts) {
    const post = await prisma.post.create({
      data: {
        clubId,
        userId: userIds[p.au],
        title: p.title,
        body: p.body,
        createdAt: new Date(Date.now() - p.daysAgo * 86400000),
      }
    })
    for (const r of (p.replies || [])) {
      await prisma.reply.create({
        data: {
          postId: post.id,
          userId: userIds[r.au],
          text: r.text,
          createdAt: new Date(Date.now() - r.daysAgo * 86400000),
        }
      })
    }
    for (const li of (p.likes || [])) {
      await prisma.reaction.create({ data: { userId: userIds[li], targetType: 'post', targetId: post.id, emoji: '❤️' } }).catch(() => {})
    }
  }
}

async function addChat(clubId, userIds, messages) {
  for (const m of messages) {
    await prisma.chatMessage.create({
      data: {
        clubId,
        userId: userIds[m.au],
        text: m.text,
        createdAt: new Date(Date.now() - m.minsAgo * 60000),
      }
    })
  }
}

async function main() {
  console.log('Clearing database...')
  await prisma.reaction.deleteMany()
  await prisma.reply.deleteMany()
  await prisma.post.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.memberProgress.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.clubItem.deleteMany()
  await prisma.clubMember.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('password123', 12)
  const users = []
  for (const u of USERS_DATA) {
    const ini = u.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    users.push(await prisma.user.create({
      data: {
        email: u.email, username: u.username, displayName: u.displayName,
        passwordHash: password, bio: u.bio, avatarColor: u.color, avatarInitials: ini,
        interests: JSON.stringify(u.interests || []), onboardingDone: true,
        createdAt: new Date(Date.now() - 300 * 86400000),
      }
    }))
  }
  console.log(`✓ ${users.length} users`)

  // Club 1: The Midnight Readers (book)
  const club1 = await prisma.club.create({ data: {
    name: 'The Midnight Readers', type: 'book', emoji: '📚',
    accentColor: '#C47D5A', bgColor: '#2A1A0E',
    description: 'A cozy literary club for those who read past their bedtime. One ambitious novel per month.',
  }})
  const club1Members = [users[0], users[1], users[2], users[3], users[4], users[5]]
  for (const u of club1Members) {
    await prisma.clubMember.create({ data: { clubId: club1.id, userId: u.id, role: u.id === users[0].id ? 'admin' : 'member', joinedAt: new Date(Date.now() - 250 * 86400000) } })
  }
  const item1Current = await prisma.clubItem.create({ data: {
    clubId: club1.id, title: 'Tomorrow, and Tomorrow, and Tomorrow', subtitle: 'Gabrielle Zevin',
    description: "A dazzling novel about creativity, failure, and the lifelong bonds forged in the pursuit of making something from nothing — told through three decades of video game development.",
    coverColor: '#5A3520', type: 'book', status: 'current',
  }})
  await prisma.clubItem.create({ data: { clubId: club1.id, title: 'The Midnight Library', subtitle: 'Matt Haig', coverColor: '#1A2850', type: 'book', status: 'past', finishedAt: new Date(Date.now() - 45 * 86400000) } })
  await prisma.clubItem.create({ data: { clubId: club1.id, title: 'All the Light We Cannot See', subtitle: 'Anthony Doerr', coverColor: '#3A2020', type: 'book', status: 'past', finishedAt: new Date(Date.now() - 90 * 86400000) } })
  await prisma.clubItem.create({ data: { clubId: club1.id, title: 'Demon Copperhead', subtitle: 'Barbara Kingsolver', coverColor: '#1E2A1A', type: 'book', status: 'past', finishedAt: new Date(Date.now() - 135 * 86400000) } })
  const prog1 = [72, 100, 100, 85, 40, 25]
  for (let i = 0; i < club1Members.length; i++) {
    await prisma.memberProgress.create({ data: { userId: club1Members[i].id, itemId: item1Current.id, progress: prog1[i] } })
  }
  await addPosts(club1.id,
    club1Members.map(u => u.id),
    [
      { au: 1, daysAgo: 2, title: "The video game metaphors in ch.12 — intentional or incidental?", body: "I kept thinking about how Zevin uses the language of 'game over' to describe real endings. Is this just clever theming or does it cut deeper into the whole book's thesis?", likes: [0,2,3,5], replies: [
        { au: 2, text: "Definitely intentional. The whole book is built on the idea that we get to restart, revise, iterate. Failure is a mechanic, not a verdict.", daysAgo: 2 },
        { au: 0, text: "What got me is how 'loading' feels like grief — you're stuck between states and can't move until something resolves.", daysAgo: 1 },
      ]},
      { au: 3, daysAgo: 4, title: "Sadie vs Sam — who do you relate to more?", body: "I'm firmly Team Sadie. The way she pours herself into work and still feels unseen resonates deeply. Sam's arc felt too passive at times.", likes: [0,1,2,4,5], replies: [
        { au: 4, text: "Sam for me, actually. His path felt more like someone learning how to belong — flawed and earnest.", daysAgo: 3 },
      ]},
      { au: 0, daysAgo: 6, title: "Pacing discussion: did the time jumps work for you?", body: "Some chapters felt like years flew by and others like we were in slow motion inside a single afternoon. I think that's the point — but curious what the group thought.", likes: [1,4], replies: [] },
    ]
  )
  await addChat(club1.id, club1Members.map(u => u.id), [
    { au: 1, text: 'Did everyone get to chapter 20?', minsAgo: 90 },
    { au: 2, text: 'Just finished it last night! No spoilers but… wow.', minsAgo: 75 },
    { au: 0, text: 'Still on chapter 18. One more day I promise 😅', minsAgo: 58 },
    { au: 3, text: 'The ending of chapter 17 absolutely wrecked me.', minsAgo: 45 },
    { au: 4, text: 'I had to put it down for a full day after that chapter.', minsAgo: 42 },
    { au: 1, text: "No spoilers but Sam's arc is going somewhere wild in part 3", minsAgo: 1440 },
  ])

  // Club 2: Frame by Frame (film)
  const club2 = await prisma.club.create({ data: {
    name: 'Frame by Frame', type: 'film', emoji: '🎬',
    accentColor: '#6B8DD6', bgColor: '#0D1528',
    description: 'A film club dedicated to close reading of cinema. From Ozu to Nolan, we watch and dissect together.',
  }})
  const club2Members = [users[0], users[2], users[5], users[6]]
  for (const u of club2Members) {
    await prisma.clubMember.create({ data: { clubId: club2.id, userId: u.id, role: u.id === users[2].id ? 'admin' : 'member', joinedAt: new Date(Date.now() - 200 * 86400000) } })
  }
  const item2Current = await prisma.clubItem.create({ data: {
    clubId: club2.id, title: 'Anatomy of a Fall', subtitle: 'Justine Triet',
    description: "A French legal drama about a woman suspected of her husband's death. Truth is slippery, memory is unreliable, and language itself becomes a weapon.",
    coverColor: '#1A2030', type: 'film', status: 'current',
  }})
  await prisma.clubItem.create({ data: { clubId: club2.id, title: 'Past Lives', subtitle: 'Celine Song', coverColor: '#0D1A28', type: 'film', status: 'past', finishedAt: new Date(Date.now() - 30 * 86400000) } })
  await prisma.clubItem.create({ data: { clubId: club2.id, title: 'The Zone of Interest', subtitle: 'Jonathan Glazer', coverColor: '#0D200D', type: 'film', status: 'past', finishedAt: new Date(Date.now() - 65 * 86400000) } })
  const prog2 = [80, 100, 60, 90]
  for (let i = 0; i < club2Members.length; i++) {
    await prisma.memberProgress.create({ data: { userId: club2Members[i].id, itemId: item2Current.id, progress: prog2[i] } })
  }
  await addPosts(club2.id, club2Members.map(u => u.id), [
    { au: 1, daysAgo: 3, title: "The courtroom scenes and the question of objective truth", body: "Triet builds the entire film around the impossibility of ever knowing what really happened. The courtroom becomes a mirror for how we construct narratives — and how they can destroy us.", likes: [0,2,3], replies: [
      { au: 0, text: "And the dog! The dog becomes the most reliable witness in the whole film. That scene is devastating.", daysAgo: 3 },
    ]},
    { au: 2, daysAgo: 7, title: "Sound design discussion — the music argument scene", body: "That scene where the prosecution plays the recorded argument and the defense reframes it is one of the most technically brilliant sequences I've seen this year.", likes: [0,1], replies: [] },
  ])
  await addChat(club2.id, club2Members.map(u => u.id), [
    { au: 2, text: 'The final shot is going to stay with me for weeks.', minsAgo: 180 },
    { au: 0, text: 'Sandra Hüller deserves every award she got.', minsAgo: 160 },
    { au: 1, text: 'Are we doing Past Lives next or The Zone of Interest?', minsAgo: 120 },
    { au: 3, text: 'Past Lives please! I need something that wrecks me emotionally.', minsAgo: 100 },
  ])

  // Club 3: Deep Dive Pods (podcast)
  const club3 = await prisma.club.create({ data: {
    name: 'Deep Dive Pods', type: 'podcast', emoji: '🎙️',
    accentColor: '#4AADAB', bgColor: '#0D2020',
    description: 'One podcast series per month, discussed chapter by chapter. Long-form audio storytelling at its best.',
  }})
  const club3Members = [users[0], users[4], users[7], users[1]]
  for (const u of club3Members) {
    await prisma.clubMember.create({ data: { clubId: club3.id, userId: u.id, role: u.id === users[4].id ? 'admin' : 'member', joinedAt: new Date(Date.now() - 180 * 86400000) } })
  }
  const item3Current = await prisma.clubItem.create({ data: {
    clubId: club3.id, title: 'S-Town', subtitle: 'Brian Reed / Serial',
    description: "A deeply reported story about a man named John who despises his Alabama town and the mysteries he uncovers there. Seven episodes. All released at once.",
    coverColor: '#0A2020', type: 'podcast', status: 'current',
  }})
  await prisma.clubItem.create({ data: { clubId: club3.id, title: 'Serial Season 1', subtitle: 'Sarah Koenig', coverColor: '#0D1A1A', type: 'podcast', status: 'past', finishedAt: new Date(Date.now() - 50 * 86400000) } })
  const prog3 = [85, 100, 50, 70]
  for (let i = 0; i < club3Members.length; i++) {
    await prisma.memberProgress.create({ data: { userId: club3Members[i].id, itemId: item3Current.id, progress: prog3[i] } })
  }
  await addChat(club3.id, club3Members.map(u => u.id), [
    { au: 1, text: 'The way John B. describes the mercury clocks is just... haunting.', minsAgo: 240 },
    { au: 0, text: 'First time listener. I went in blind and my jaw is on the floor.', minsAgo: 200 },
    { au: 2, text: "Don't say anything else! I'm only on episode 4.", minsAgo: 180 },
    { au: 3, text: 'Episode 5 is when everything changes. No more hints.', minsAgo: 150 },
  ])

  // Club 4: Pixel & Play (game)
  const club4 = await prisma.club.create({ data: {
    name: 'Pixel & Play', type: 'game', emoji: '🎮',
    accentColor: '#9B6DB5', bgColor: '#1A1028',
    description: 'Playing through classics and indie gems together. One game, one month, infinite discussions.',
  }})
  const club4Members = [users[0], users[3], users[5], users[7]]
  for (const u of club4Members) {
    await prisma.clubMember.create({ data: { clubId: club4.id, userId: u.id, role: u.id === users[3].id ? 'admin' : 'member', joinedAt: new Date(Date.now() - 150 * 86400000) } })
  }
  const item4Current = await prisma.clubItem.create({ data: {
    clubId: club4.id, title: 'Hades II', subtitle: 'Supergiant Games',
    description: "The princess of the underworld battles through Greek mythology in this god-like sequel. New mechanics, new cast, same addictive loop.",
    coverColor: '#2A1040', type: 'game', status: 'current',
  }})
  await prisma.clubItem.create({ data: { clubId: club4.id, title: 'Balatro', subtitle: 'LocalThunk', coverColor: '#1A0A0A', type: 'game', status: 'past', finishedAt: new Date(Date.now() - 40 * 86400000) } })
  await prisma.clubItem.create({ data: { clubId: club4.id, title: 'Elden Ring', subtitle: 'FromSoftware', coverColor: '#1A1A0A', type: 'game', status: 'past', finishedAt: new Date(Date.now() - 85 * 86400000) } })
  const prog4 = [65, 90, 45, 80]
  for (let i = 0; i < club4Members.length; i++) {
    await prisma.memberProgress.create({ data: { userId: club4Members[i].id, itemId: item4Current.id, progress: prog4[i] } })
  }
  await addPosts(club4.id, club4Members.map(u => u.id), [
    { au: 1, daysAgo: 5, title: "The Omega attack system is game-changing", body: "Supergiant completely rethought the combat loop. Charging Omega attacks during a run adds so much more decision-making — do you hold for the big hit or keep the pressure up?", likes: [0,2,3], replies: [
      { au: 0, text: "I keep forgetting to use them and then dying because I wasted the buildup. Still learning.", daysAgo: 5 },
      { au: 3, text: "Build your Hexes around Omega and it completely breaks the mid-game in the best way.", daysAgo: 4 },
    ]},
  ])
  await addChat(club4.id, club4Members.map(u => u.id), [
    { au: 1, text: 'Hades II hit early access and it is ALREADY better than the original.', minsAgo: 300 },
    { au: 0, text: 'The new cast mechanic forces completely different builds. Love it.', minsAgo: 280 },
    { au: 3, text: 'I keep dying at the same boss. Any tips without spoilers?', minsAgo: 240 },
    { au: 2, text: 'Max your Omega attacks early. Trust me.', minsAgo: 220 },
  ])

  // Ratings for past items
  const pastItems = await prisma.clubItem.findMany({ where: { status: 'past' } })

  const ratingMap = [
    { title: 'The Midnight Library',  raters: [[users[0].id, 4.0], [users[1].id, 4.5], [users[2].id, 3.5], [users[3].id, 4.0]] },
    { title: 'All the Light We Cannot See', raters: [[users[0].id, 4.5], [users[1].id, 5.0], [users[2].id, 4.5], [users[3].id, 4.0], [users[4].id, 4.5]] },
    { title: 'Past Lives',             raters: [[users[0].id, 5.0], [users[2].id, 4.5], [users[5].id, 5.0], [users[6].id, 4.0]] },
    { title: 'The Zone of Interest',   raters: [[users[0].id, 4.0], [users[2].id, 4.5], [users[5].id, 4.0]] },
    { title: 'Balatro',                raters: [[users[0].id, 5.0], [users[3].id, 4.5], [users[5].id, 4.0], [users[7].id, 5.0]] },
    { title: 'Elden Ring',             raters: [[users[0].id, 4.5], [users[3].id, 5.0], [users[5].id, 5.0], [users[7].id, 4.0]] },
    { title: 'Serial Season 1',        raters: [[users[0].id, 4.5], [users[4].id, 4.0], [users[7].id, 4.5]] },
  ]

  for (const rm of ratingMap) {
    const item = pastItems.find(i => i.title === rm.title)
    if (!item) continue
    for (const [userId, rating] of rm.raters) {
      await prisma.rating.upsert({
        where: { userId_itemId: { userId, itemId: item.id } },
        update: { rating },
        create: { userId, itemId: item.id, rating, review: '' },
      })
    }
  }

  // Seed 60 days of activity for the heatmap
  for (let d = 0; d < 365; d++) {
    for (const u of users) {
      if (Math.random() > 0.78) {
        await prisma.activity.create({
          data: {
            userId: u.id,
            type: 'activity',
            createdAt: new Date(Date.now() - d * 86400000 - Math.random() * 86400000),
          }
        })
      }
    }
  }

  // Named activities for feed
  const namedActivities = [
    { userId: users[0].id, type: 'rated', title: 'Past Lives', rating: 5.0, daysAgo: 5 },
    { userId: users[0].id, type: 'joined_club', clubName: 'Pixel & Play', daysAgo: 30 },
    { userId: users[1].id, type: 'rated', title: 'All the Light We Cannot See', rating: 5.0, daysAgo: 8 },
    { userId: users[1].id, type: 'posted', clubName: 'The Midnight Readers', daysAgo: 2 },
    { userId: users[2].id, type: 'rated', title: 'Past Lives', rating: 4.5, daysAgo: 6 },
    { userId: users[3].id, type: 'rated', title: 'Balatro', rating: 4.5, daysAgo: 10 },
    { userId: users[4].id, type: 'joined_club', clubName: 'Deep Dive Pods', daysAgo: 14 },
    { userId: users[5].id, type: 'rated', title: 'Elden Ring', rating: 5.0, daysAgo: 12 },
    { userId: users[6].id, type: 'rated', title: 'The Midnight Library', rating: 3.5, daysAgo: 20 },
    { userId: users[7].id, type: 'rated', title: 'Balatro', rating: 5.0, daysAgo: 9 },
  ]
  for (const a of namedActivities) {
    await prisma.activity.create({
      data: { userId: a.userId, type: a.type, title: a.title || '', clubName: a.clubName || '', rating: a.rating ?? null, createdAt: new Date(Date.now() - a.daysAgo * 86400000) }
    })
  }

  console.log('\n✓ Seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Demo login: alex@hobbyist.app')
  console.log('Password:   password123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
