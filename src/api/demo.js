// Mock data used when VITE_DEMO_MODE=true (GitHub Pages / static deploy)

const USERS = [
  { id: 1, displayName: 'Alex Chen',    username: 'alexchen', avatarColor: '#E8A020', avatarInitials: 'AC' },
  { id: 2, displayName: 'Maya Patel',   username: 'mayap',    avatarColor: '#7A9E7E', avatarInitials: 'MP' },
  { id: 3, displayName: 'Jordan Kim',   username: 'jordank',  avatarColor: '#6B8DD6', avatarInitials: 'JK' },
  { id: 4, displayName: 'Sam Rivera',   username: 'samr',     avatarColor: '#C47D5A', avatarInitials: 'SR' },
  { id: 5, displayName: 'Priya Nair',   username: 'priyan',   avatarColor: '#9B6DB5', avatarInitials: 'PN' },
  { id: 6, displayName: 'Theo Walsh',   username: 'theow',    avatarColor: '#4AADAB', avatarInitials: 'TW' },
  { id: 7, displayName: 'Ines Moreau',  username: 'inesm',    avatarColor: '#E87070', avatarInitials: 'IM' },
  { id: 8, displayName: 'Kai Nakamura', username: 'kain',     avatarColor: '#D4A853', avatarInitials: 'KN' },
]

export const ME = {
  id: 1, email: 'alex@hobbyist.app', username: 'alexchen', displayName: 'Alex Chen',
  avatarColor: '#E8A020', avatarInitials: 'AC',
  bio: 'Reading, watching, and listening my way through life. SF → NYC.',
  onboardingDone: true,
  interests: ['book', 'film'],
  stats: { finished: 11, clubs: 4 },
}

let _likes = {}
let _chatMessages = {
  1: [
    { id: 1, text: 'Did everyone get to chapter 20?', time: '10:32 AM', user: USERS[1] },
    { id: 2, text: 'Just finished it last night! No spoilers but… wow.', time: '10:45 AM', user: USERS[2] },
    { id: 3, text: 'Still on chapter 18. One more day I promise 😅', time: '11:02 AM', user: USERS[0] },
    { id: 4, text: 'The ending of chapter 17 absolutely wrecked me.', time: '11:15 AM', user: USERS[3] },
    { id: 5, text: 'I had to put it down for a full day after that chapter.', time: '11:18 AM', user: USERS[4] },
    { id: 6, text: "No spoilers but Sam's arc is going somewhere wild in part 3", time: 'Yesterday, 3:14 PM', user: USERS[1] },
  ],
  2: [
    { id: 10, text: 'The final shot is going to stay with me for weeks.', time: '3:00 PM', user: USERS[2] },
    { id: 11, text: 'Sandra Hüller deserves every award she got.', time: '3:20 PM', user: USERS[0] },
    { id: 12, text: 'Are we doing Past Lives next or The Zone of Interest?', time: '4:00 PM', user: USERS[1] },
    { id: 13, text: 'Past Lives please! I need something that wrecks me emotionally.', time: '4:20 PM', user: USERS[3] },
  ],
  3: [
    { id: 20, text: 'The way John B. describes the mercury clocks is just... haunting.', time: '11:00 AM', user: USERS[1] },
    { id: 21, text: 'First time listener. I went in blind and my jaw is on the floor.', time: '11:40 AM', user: USERS[0] },
    { id: 22, text: "Don't say anything else! I'm only on episode 4.", time: '12:00 PM', user: USERS[7] },
  ],
  4: [
    { id: 30, text: 'Hades II hit early access and it is ALREADY better than the original.', time: '9:00 AM', user: USERS[3] },
    { id: 31, text: 'The new cast mechanic forces completely different builds.', time: '9:20 AM', user: USERS[0] },
    { id: 32, text: 'I keep dying at the same boss. Any tips?', time: '10:00 AM', user: USERS[7] },
    { id: 33, text: 'Max your Omega attacks early. Trust me.', time: '10:20 AM', user: USERS[5] },
  ],
}

let _posts = {
  1: [
    { id: 1, title: "The video game metaphors in ch.12 — intentional or incidental?", body: "I kept thinking about how Zevin uses the language of 'game over' to describe real endings.", time: '2 days ago', user: USERS[1], likeCount: 4, replyCount: 2, likedByMe: false, replies: [
      { id: 1, text: "Definitely intentional. The whole book is built on the idea that we get to restart, revise, iterate.", time: '2 days ago', user: USERS[2] },
      { id: 2, text: "What got me is how 'loading' feels like grief — you're stuck between states.", time: '1 day ago', user: USERS[0] },
    ]},
    { id: 2, title: "Sadie vs Sam — who do you relate to more?", body: "I'm firmly Team Sadie. The way she pours herself into work and still feels unseen resonates deeply.", time: '4 days ago', user: USERS[3], likeCount: 7, replyCount: 1, likedByMe: false, replies: [
      { id: 3, text: "Sam for me, actually. His path felt more like someone learning how to belong — flawed and earnest.", time: '3 days ago', user: USERS[4] },
    ]},
    { id: 3, title: "Pacing discussion: did the time jumps work for you?", body: "Some chapters felt like years flew by and others like we were in slow motion.", time: '6 days ago', user: USERS[0], likeCount: 3, replyCount: 0, likedByMe: false, replies: [] },
  ],
  2: [
    { id: 4, title: "The courtroom scenes and the question of objective truth", body: "Triet builds the entire film around the impossibility of ever knowing what really happened.", time: '3 days ago', user: USERS[2], likeCount: 5, replyCount: 1, likedByMe: false, replies: [
      { id: 5, text: "And the dog! The dog becomes the most reliable witness in the whole film.", time: '3 days ago', user: USERS[0] },
    ]},
  ],
  3: [],
  4: [
    { id: 6, title: "The Omega attack system is game-changing", body: "Supergiant completely rethought the combat loop.", time: '5 days ago', user: USERS[3], likeCount: 3, replyCount: 2, likedByMe: false, replies: [
      { id: 7, text: "I keep forgetting to use them and then dying. Still learning.", time: '5 days ago', user: USERS[0] },
      { id: 8, text: "Build your Hexes around Omega and it completely breaks the mid-game.", time: '4 days ago', user: USERS[3] },
    ]},
  ],
}

let _progress = { 1: 72, 2: 80, 3: 85, 4: 65 }
let _postIdCounter = 100
let _chatIdCounter = 200
let _importedItems = []

const CLUBS_DATA = [
  { id: 1, name: 'The Midnight Readers', type: 'book', emoji: '📚', accentColor: '#C47D5A', bgColor: '#2A1A0E', isPublic: true, isMember: true, myRole: 'admin', description: 'A cozy literary club for those who read past their bedtime.', memberCount: 6,
    currentItem: { id: 1, title: 'Tomorrow, and Tomorrow, and Tomorrow', subtitle: 'Gabrielle Zevin', description: "A dazzling novel about creativity, failure, and the lifelong bonds forged in the pursuit of making something from nothing.", coverColor: '#5A3520', type: 'book', myProgress: 72 },
    pastItems: [
      { id: 2, title: 'The Midnight Library', subtitle: 'Matt Haig', coverColor: '#1A2850', type: 'book', avgRating: 4.1, ratingCount: 4 },
      { id: 3, title: 'All the Light We Cannot See', subtitle: 'Anthony Doerr', coverColor: '#3A2020', type: 'book', avgRating: 4.5, ratingCount: 5 },
      { id: 4, title: 'Demon Copperhead', subtitle: 'Barbara Kingsolver', coverColor: '#1E2A1A', type: 'book', avgRating: 4.3, ratingCount: 4 },
    ],
    members: [
      { user: USERS[0], role: 'admin', progress: 72 }, { user: USERS[1], role: 'member', progress: 100 },
      { user: USERS[2], role: 'member', progress: 100 }, { user: USERS[3], role: 'member', progress: 85 },
      { user: USERS[4], role: 'member', progress: 40 }, { user: USERS[5], role: 'member', progress: 25 },
    ],
  },
  { id: 2, name: 'Frame by Frame', type: 'film', emoji: '🎬', accentColor: '#6B8DD6', bgColor: '#0D1528', isPublic: true, isMember: true, myRole: 'member', description: 'A film club dedicated to close reading of cinema.', memberCount: 4,
    currentItem: { id: 5, title: 'Anatomy of a Fall', subtitle: 'Justine Triet', description: "A French legal drama that asks difficult questions about truth, memory, and marriage.", coverColor: '#1A2030', type: 'film', myProgress: 100 },
    pastItems: [
      { id: 6, title: 'Past Lives', subtitle: 'Celine Song', coverColor: '#0D1A28', type: 'film', avgRating: 4.6, ratingCount: 4 },
      { id: 7, title: 'The Zone of Interest', subtitle: 'Jonathan Glazer', coverColor: '#0D200D', type: 'film', avgRating: 4.2, ratingCount: 3 },
    ],
    members: [
      { user: USERS[0], role: 'member', progress: 100 }, { user: USERS[2], role: 'admin', progress: 100 },
      { user: USERS[5], role: 'member', progress: 60 }, { user: USERS[6], role: 'member', progress: 90 },
    ],
  },
  { id: 3, name: 'Deep Dive Pods', type: 'podcast', emoji: '🎙️', accentColor: '#4AADAB', bgColor: '#0D2020', isPublic: true, isMember: true, myRole: 'member', description: 'One podcast series per month, discussed chapter by chapter.', memberCount: 4,
    currentItem: { id: 8, title: 'S-Town', subtitle: 'Brian Reed / Serial', description: "A deeply reported story about a man named John who despises his Alabama town.", coverColor: '#0A2020', type: 'podcast', myProgress: 85 },
    pastItems: [
      { id: 9, title: 'Serial Season 1', subtitle: 'Sarah Koenig', coverColor: '#0D1A1A', type: 'podcast', avgRating: 4.3, ratingCount: 3 },
    ],
    members: [
      { user: USERS[0], role: 'member', progress: 85 }, { user: USERS[4], role: 'admin', progress: 100 },
      { user: USERS[7], role: 'member', progress: 50 }, { user: USERS[1], role: 'member', progress: 70 },
    ],
  },
  { id: 4, name: 'Pixel & Play', type: 'game', emoji: '🎮', accentColor: '#9B6DB5', bgColor: '#1A1028', isPublic: true, isMember: true, myRole: 'member', description: 'Playing through classics and indie gems together.', memberCount: 4,
    currentItem: { id: 10, title: 'Hades II', subtitle: 'Supergiant Games', description: "The princess of the underworld battles through Greek mythology in this god-like sequel.", coverColor: '#2A1040', type: 'game', myProgress: 65 },
    pastItems: [
      { id: 11, title: 'Balatro', subtitle: 'LocalThunk', coverColor: '#1A0A0A', type: 'game', avgRating: 4.75, ratingCount: 4 },
      { id: 12, title: 'Elden Ring', subtitle: 'FromSoftware', coverColor: '#1A1A0A', type: 'game', avgRating: 4.6, ratingCount: 4 },
    ],
    members: [
      { user: USERS[0], role: 'member', progress: 65 }, { user: USERS[3], role: 'admin', progress: 90 },
      { user: USERS[5], role: 'member', progress: 45 }, { user: USERS[7], role: 'member', progress: 80 },
    ],
  },
]

function delay(ms = 350) { return new Promise(r => setTimeout(r, ms)) }

export const DEMO_HANDLERS = {
  '/auth/refresh': async () => ({ accessToken: 'demo-token' }),
  '/auth/login': async () => ({ accessToken: 'demo-token', user: ME }),
  '/auth/register': async () => ({ accessToken: 'demo-token', user: ME }),
  '/auth/logout': async () => ({ ok: true }),
  '/auth/forgot-password': async () => ({ message: 'Demo mode — no email sent.' }),

  '/users/me': async () => ({ ...ME }),
  '/users/me/onboarding': async (_, body) => ({ ...ME, ...body, onboardingDone: true }),
  'PUT /users/me': async (_, body) => ({ ...ME, ...body }),

  '/clubs': async () => {
    await delay()
    return CLUBS_DATA.map(c => ({ id: c.id, name: c.name, type: c.type, emoji: c.emoji, accentColor: c.accentColor, bgColor: c.bgColor, memberCount: c.memberCount, isPublic: c.isPublic, currentItem: c.currentItem ? { ...c.currentItem, myProgress: _progress[c.id] ?? c.currentItem.myProgress } : null }))
  },
  '/clubs/explore': async () => { await delay(); return [] },

  '/feed': async () => {
    await delay()
    return [
      { id: 1, type: 'rated', label: 'rated', title: 'Past Lives', clubName: '', rating: 5.0, time: '5 days ago', user: USERS[0], likeCount: 3, commentCount: 1, extra: { type: 'film' } },
      { id: 2, type: 'joined_club', label: 'joined', title: '', clubName: 'Pixel & Play', rating: null, time: '2 weeks ago', user: USERS[0], likeCount: 5, commentCount: 0, extra: {} },
      { id: 3, type: 'rated', label: 'rated', title: 'All the Light We Cannot See', clubName: '', rating: 5.0, time: '8 days ago', user: USERS[1], likeCount: 4, commentCount: 2, extra: { type: 'book' } },
      { id: 4, type: 'posted', label: 'posted in', title: '', clubName: 'The Midnight Readers', rating: null, time: '2 days ago', user: USERS[1], likeCount: 1, commentCount: 0, extra: {} },
      { id: 5, type: 'rated', label: 'rated', title: 'Past Lives', clubName: '', rating: 4.5, time: '6 days ago', user: USERS[2], likeCount: 2, commentCount: 0, extra: { type: 'film' } },
      { id: 6, type: 'rated', label: 'rated', title: 'Balatro', clubName: '', rating: 4.5, time: '10 days ago', user: USERS[3], likeCount: 6, commentCount: 1, extra: { type: 'game' } },
      { id: 7, type: 'rated', label: 'rated', title: 'Elden Ring', clubName: '', rating: 5.0, time: '12 days ago', user: USERS[5], likeCount: 7, commentCount: 2, extra: { type: 'game' } },
      { id: 8, type: 'rated', label: 'rated', title: 'Balatro', clubName: '', rating: 5.0, time: '9 days ago', user: USERS[7], likeCount: 4, commentCount: 0, extra: { type: 'game' } },
    ]
  },

  '/discover': async () => {
    await delay()
    // Demo mode: simulate real discover data (clubs not joined by Alex)
    // In real mode, these would be clubs from the DB that Alex hasn't joined
    return {
      trending: [],
      newClubs: [],
      forYou: [],
      people: [
        { id: 2, displayName: 'Maya Patel',   username: 'mayap',    avatarColor: '#7A9E7E', avatarInitials: 'MP', bio: 'Design + sci-fi + too much coffee.', interests: ['book','podcast'] },
        { id: 5, displayName: 'Priya Nair',   username: 'priyan',   avatarColor: '#9B6DB5', avatarInitials: 'PN', bio: 'Podcast addict. Always listening.', interests: ['podcast','film'] },
        { id: 7, displayName: 'Ines Moreau',  username: 'inesm',    avatarColor: '#E87070', avatarInitials: 'IM', bio: 'Parisienne in Brooklyn.', interests: ['book','film'] },
      ],
      myClubCount: 4,
    }
  },

  '/leaderboard': async () => {
    await delay()
    const entries = [
      { id: 2, displayName: 'Maya Patel',   username: 'mayap',    avatarColor: '#7A9E7E', avatarInitials: 'MP', score: 180, finished: 12, streak: 7,  rank: 1 },
      { id: 5, displayName: 'Priya Nair',   username: 'priyan',   avatarColor: '#9B6DB5', avatarInitials: 'PN', score: 160, finished: 10, streak: 5,  rank: 2 },
      { id: 3, displayName: 'Jordan Kim',   username: 'jordank',  avatarColor: '#6B8DD6', avatarInitials: 'JK', score: 140, finished: 9,  streak: 3,  rank: 3 },
      { id: 8, displayName: 'Kai Nakamura', username: 'kain',     avatarColor: '#D4A853', avatarInitials: 'KN', score: 120, finished: 8,  streak: 12, rank: 4 },
      { id: 7, displayName: 'Ines Moreau',  username: 'inesm',    avatarColor: '#E87070', avatarInitials: 'IM', score: 110, finished: 7,  streak: 2,  rank: 5 },
      { id: 4, displayName: 'Sam Rivera',   username: 'samr',     avatarColor: '#C47D5A', avatarInitials: 'SR', score: 100, finished: 7,  streak: 0,  rank: 6 },
      { id: 1, displayName: 'Alex Chen',    username: 'alexchen', avatarColor: '#E8A020', avatarInitials: 'AC', score: 90,  finished: 6,  streak: 4,  rank: 7 },
      { id: 6, displayName: 'Theo Walsh',   username: 'theow',    avatarColor: '#4AADAB', avatarInitials: 'TW', score: 70,  finished: 5,  streak: 1,  rank: 8 },
    ]
    return { entries, myRank: 7, myScore: 90 }
  },

  '/analytics': async () => {
    await delay()
    const imported = _importedItems.length
    const allRatings = [
      { id: 'r1', title: 'Past Lives', subtitle: 'Celine Song', type: 'film', rating: 5.0, source: 'club', createdAt: new Date(Date.now() - 5*86400000) },
      { id: 'r2', title: 'All the Light We Cannot See', subtitle: 'Anthony Doerr', type: 'book', rating: 4.5, source: 'club', createdAt: new Date(Date.now() - 8*86400000) },
      { id: 'r3', title: 'Balatro', subtitle: 'LocalThunk', type: 'game', rating: 5.0, source: 'club', createdAt: new Date(Date.now() - 10*86400000) },
      { id: 'r4', title: 'Elden Ring', subtitle: 'FromSoftware', type: 'game', rating: 4.5, source: 'club', createdAt: new Date(Date.now() - 12*86400000) },
      { id: 'r5', title: 'Serial Season 1', subtitle: 'Sarah Koenig', type: 'podcast', rating: 4.5, source: 'club', createdAt: new Date(Date.now() - 20*86400000) },
      { id: 'r6', title: 'The Midnight Library', subtitle: 'Matt Haig', type: 'book', rating: 4.0, source: 'club', createdAt: new Date(Date.now() - 45*86400000) },
      { id: 'r7', title: 'Demon Copperhead', subtitle: 'Barbara Kingsolver', type: 'book', rating: 4.5, source: 'club', createdAt: new Date(Date.now() - 135*86400000) },
      ..._importedItems.slice(0, 5),
    ]
    const heatmap = []
    const now = new Date()
    const yearAgo = new Date(now); yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    const lcg = (s) => { let x = s; return () => { x = (1664525 * x + 1013904223) & 0xffffffff; return (x >>> 0) / 0xffffffff } }
    const rand = lcg(42)
    for (let w = 0; w < 52; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(yearAgo); date.setDate(date.getDate() + w * 7 + d)
        const count = rand() > 0.75 ? Math.floor(rand() * 4) + 1 : 0
        week.push({ date: date.toISOString().slice(0, 10), count })
      }
      heatmap.push(week)
    }
    const importSources = {}
    _importedItems.forEach(i => { importSources[i.source || 'manual'] = (importSources[i.source || 'manual'] || 0) + 1 })
    return {
      summary: { finished: 7 + imported, avgRating: 4.5, clubs: 4, thisYear: 5 + imported, imported },
      monthly: [
        { month: 'Jan', total: 2, book: 1, film: 1, podcast: 0, game: 0 },
        { month: 'Feb', total: 3, book: 1, film: 1, podcast: 0, game: 1 },
        { month: 'Mar', total: 1, book: 1, film: 0, podcast: 0, game: 0 },
        { month: 'Apr', total: 4, book: 1, film: 1, podcast: 1, game: 1 },
        { month: 'May', total: 3, book: 1, film: 1, podcast: 0, game: 1 },
        { month: 'Jun', total: 2 + imported, book: 1, film: 1 + Math.min(imported, 2), podcast: 0, game: 0 },
      ],
      types: [
        { type: 'book', count: 3, pct: 30 },
        { type: 'film', count: 2 + Math.min(imported, 3), pct: 30 + Math.min(imported * 5, 20) },
        { type: 'game', count: 2, pct: 25 },
        { type: 'podcast', count: 1, pct: 15 },
      ],
      heatmap,
      recentRatings: allRatings,
      importSources,
    }
  },

  '/import': async (_, body) => {
    await delay(600)
    const items = (body?.items || []).map(i => ({ ...i, id: `imp-${Math.random()}`, source: body.source }))
    _importedItems = [...items, ..._importedItems].slice(0, 500)
    return { imported: items.length, skipped: 0, total: items.length }
  },
}

// Handlers that depend on path parameters
export function matchDemoHandler(method, path, body) {
  // Club detail
  const clubMatch = path.match(/^\/clubs\/(\d+)$/)
  if (clubMatch && method === 'GET') {
    const club = CLUBS_DATA.find(c => c.id === Number(clubMatch[1]))
    if (!club) return null
    return async () => { await delay(); return { ...club, currentItem: club.currentItem ? { ...club.currentItem, myProgress: _progress[club.id] ?? club.currentItem.myProgress } : null } }
  }

  // Progress update
  const progressMatch = path.match(/^\/clubs\/(\d+)\/progress$/)
  if (progressMatch && method === 'PUT') {
    return async () => { _progress[Number(progressMatch[1])] = body?.progress ?? 0; return { progress: body?.progress } }
  }

  // Posts list
  const postsMatch = path.match(/^\/posts\/club\/(\d+)$/)
  if (postsMatch && method === 'GET') {
    return async () => { await delay(); return _posts[Number(postsMatch[1])] || [] }
  }

  // New post
  if (postsMatch && method === 'POST') {
    return async () => {
      const clubId = Number(postsMatch[1])
      const p = { id: ++_postIdCounter, title: body.title, body: body.body, time: 'just now', user: USERS[0], likeCount: 0, replyCount: 0, likedByMe: false, replies: [] }
      _posts[clubId] = [p, ...(_posts[clubId] || [])]
      return p
    }
  }

  // Like toggle
  const likeMatch = path.match(/^\/posts\/(\d+)\/like$/)
  if (likeMatch) {
    return async () => {
      const id = Number(likeMatch[1])
      _likes[id] = !_likes[id]
      for (const posts of Object.values(_posts)) {
        const p = posts.find(p => p.id === id)
        if (p) { p.likedByMe = _likes[id]; p.likeCount += _likes[id] ? 1 : -1 }
      }
      return { liked: !!_likes[id] }
    }
  }

  // Reply
  const replyMatch = path.match(/^\/posts\/(\d+)\/replies$/)
  if (replyMatch) {
    return async () => {
      const postId = Number(replyMatch[1])
      const reply = { id: ++_postIdCounter, text: body.text, time: 'just now', user: USERS[0] }
      for (const posts of Object.values(_posts)) {
        const p = posts.find(p => p.id === postId)
        if (p) { p.replies.push(reply); p.replyCount++ }
      }
      return reply
    }
  }

  // Chat fetch
  const chatMatch = path.match(/^\/chat\/(\d+)$/)
  if (chatMatch && method === 'GET') {
    return async () => { await delay(); return _chatMessages[Number(chatMatch[1])] || [] }
  }

  // Chat send
  if (chatMatch && method === 'POST') {
    return async () => {
      const clubId = Number(chatMatch[1])
      const msg = { id: ++_chatIdCounter, text: body.text, time: 'just now', user: USERS[0] }
      if (!_chatMessages[clubId]) _chatMessages[clubId] = []
      _chatMessages[clubId].push(msg)
      return msg
    }
  }

  // Rate item
  const rateMatch = path.match(/^\/clubs\/(\d+)\/rate$/)
  if (rateMatch) {
    return async () => { await delay(400); return { rating: body.rating, review: body.review } }
  }

  // Add item
  const addItemMatch = path.match(/^\/clubs\/(\d+)\/items$/)
  if (addItemMatch) {
    return async () => ({ id: 99, ...body })
  }

  // Create club
  if (path === '/clubs' && method === 'POST') {
    return async () => {
      const defaults = { book: { emoji: '📚', accentColor: '#C47D5A', bgColor: '#2A1A0E' }, film: { emoji: '🎬', accentColor: '#6B8DD6', bgColor: '#0D1528' }, podcast: { emoji: '🎙️', accentColor: '#4AADAB', bgColor: '#0D2020' }, game: { emoji: '🎮', accentColor: '#9B6DB5', bgColor: '#1A1028' } }
      const d = defaults[body.type] || defaults.book
      return { id: 99, ...body, ...d, memberCount: 1, currentItem: null }
    }
  }

  // Join/leave
  if (path.match(/\/clubs\/\d+\/(join|leave)/)) return async () => ({ ok: true })

  // Users
  if (path.match(/^\/users\/\d+$/)) return async () => USERS.find(u => u.id === Number(path.split('/')[2])) || USERS[0]

  return null
}
