/**
 * demo.js — In-memory mock data for the GitHub Pages static demo.
 *
 * VITE_DEMO_MODE=true bakes this into the bundle. The real app (npm run dev)
 * never imports this path — api/client.js routes to the real Express backend.
 *
 * State is backed by sessionStorage so it survives tab navigation but resets
 * when the browser tab is closed (matching user expectations for a demo).
 */

// ── Seed data ─────────────────────────────────────────────────────────────

const SEED_USERS = [
  { id: 1, displayName: 'Alex Chen',    username: 'alexchen', avatarColor: '#E8A020', avatarInitials: 'AC', bio: 'Reading, watching, and listening my way through life. SF → NYC.', interests: ['book','film'] },
  { id: 2, displayName: 'Maya Patel',   username: 'mayap',    avatarColor: '#7A9E7E', avatarInitials: 'MP', bio: 'Design + sci-fi + too much coffee.', interests: ['book','podcast'] },
  { id: 3, displayName: 'Jordan Kim',   username: 'jordank',  avatarColor: '#6B8DD6', avatarInitials: 'JK', bio: 'Cinema lover, aspiring critic.', interests: ['film'] },
  { id: 4, displayName: 'Sam Rivera',   username: 'samr',     avatarColor: '#C47D5A', avatarInitials: 'SR', bio: 'Game dev by day, bookworm by night.', interests: ['game','book'] },
  { id: 5, displayName: 'Priya Nair',   username: 'priyan',   avatarColor: '#9B6DB5', avatarInitials: 'PN', bio: 'Podcast addict. Always listening.', interests: ['podcast','film'] },
  { id: 6, displayName: 'Theo Walsh',   username: 'theow',    avatarColor: '#4AADAB', avatarInitials: 'TW', bio: 'Music, film, the occasional novel.', interests: ['film','game'] },
  { id: 7, displayName: 'Ines Moreau',  username: 'inesm',    avatarColor: '#E87070', avatarInitials: 'IM', bio: 'Parisienne in Brooklyn. Books and films and wine.', interests: ['book','film'] },
  { id: 8, displayName: 'Kai Nakamura', username: 'kain',     avatarColor: '#D4A853', avatarInitials: 'KN', bio: 'Speedrunner and slow reader.', interests: ['game','podcast'] },
]

const SEED_CLUBS = [
  { id: 1, name: 'The Midnight Readers', type: 'book', emoji: '📚', accentColor: '#C47D5A', bgColor: '#2A1A0E', isPublic: true, isMember: true, myRole: 'admin', description: 'A cozy literary club for those who read past their bedtime.', memberCount: 6,
    currentItem: { id: 1, title: 'Tomorrow, and Tomorrow, and Tomorrow', subtitle: 'Gabrielle Zevin', description: "A dazzling novel about creativity, failure, and the lifelong bonds forged in the pursuit of making something from nothing.", coverColor: '#5A3520', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593321201-L.jpg', type: 'book', myProgress: 72 },
    pastItems: [
      { id: 2, title: 'The Midnight Library', subtitle: 'Matt Haig', coverColor: '#1A2850', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg', type: 'book', avgRating: 4.1, ratingCount: 4 },
      { id: 3, title: 'All the Light We Cannot See', subtitle: 'Anthony Doerr', coverColor: '#3A2020', coverUrl: 'https://covers.openlibrary.org/b/isbn/9781476746586-L.jpg', type: 'book', avgRating: 4.5, ratingCount: 5 },
    ],
    members: [
      { user: SEED_USERS[0], role: 'admin', progress: 72 }, { user: SEED_USERS[1], role: 'member', progress: 100 },
      { user: SEED_USERS[2], role: 'member', progress: 100 }, { user: SEED_USERS[3], role: 'member', progress: 85 },
    ],
  },
  { id: 2, name: 'Frame by Frame', type: 'film', emoji: '🎬', accentColor: '#6B8DD6', bgColor: '#0D1528', isPublic: true, isMember: true, myRole: 'member', description: 'A film club dedicated to close reading of cinema.', memberCount: 4,
    currentItem: { id: 5, title: 'Anatomy of a Fall', subtitle: 'Justine Triet', description: "A French legal drama that asks difficult questions about truth, memory, and marriage.", coverColor: '#1A2030', type: 'film', myProgress: 100 },
    pastItems: [
      { id: 6, title: 'Past Lives', subtitle: 'Celine Song', coverColor: '#0D1A28', type: 'film', avgRating: 4.6, ratingCount: 4 },
    ],
    members: [
      { user: SEED_USERS[0], role: 'member', progress: 100 }, { user: SEED_USERS[2], role: 'admin', progress: 100 },
    ],
  },
  { id: 3, name: 'Deep Dive Pods', type: 'podcast', emoji: '🎙️', accentColor: '#4AADAB', bgColor: '#0D2020', isPublic: true, isMember: true, myRole: 'member', description: 'One podcast series per month, discussed chapter by chapter.', memberCount: 4,
    currentItem: { id: 8, title: 'S-Town', subtitle: 'Brian Reed / Serial', description: "A deeply reported story about a man named John who despises his Alabama town.", coverColor: '#0A2020', type: 'podcast', myProgress: 85 },
    pastItems: [],
    members: [
      { user: SEED_USERS[0], role: 'member', progress: 85 }, { user: SEED_USERS[4], role: 'admin', progress: 100 },
    ],
  },
  { id: 4, name: 'Pixel & Play', type: 'game', emoji: '🎮', accentColor: '#9B6DB5', bgColor: '#1A1028', isPublic: true, isMember: true, myRole: 'member', description: 'Playing through classics and indie gems together.', memberCount: 4,
    currentItem: { id: 10, title: 'Hades II', subtitle: 'Supergiant Games', description: "The princess of the underworld battles through Greek mythology.", coverColor: '#2A1040', type: 'game', myProgress: 65 },
    pastItems: [
      { id: 11, title: 'Balatro', subtitle: 'LocalThunk', coverColor: '#1A0A0A', type: 'game', avgRating: 4.75, ratingCount: 4 },
    ],
    members: [
      { user: SEED_USERS[0], role: 'member', progress: 65 }, { user: SEED_USERS[3], role: 'admin', progress: 90 },
    ],
  },
]

const DEFAULT_USER = {
  id: 1, email: 'alex@hobbyist.app', username: 'alexchen', displayName: 'Alex Chen',
  avatarColor: '#E8A020', avatarInitials: 'AC',
  bio: 'Reading, watching, and listening my way through life. SF → NYC.',
  onboardingDone: true, interests: ['book', 'film'],
  stats: { finished: 11, clubs: 4 },
}

// ── Session-backed state ──────────────────────────────────────────────────

const SESSION_KEY = 'hobbyist-demo-v2'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage unavailable or corrupt */ }
  return null
}

function saveSession(state) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)) } catch { /* storage unavailable */ }
}

function initState() {
  const saved = loadSession()
  if (saved) return saved
  return {
    user: { ...DEFAULT_USER },
    clubs: SEED_CLUBS.map(c => ({ ...c })),
    progress: { 1: 72, 2: 100, 3: 85, 4: 65 },
    chatMessages: {
      1: [
        { id: 1, text: 'Did everyone get to chapter 20?', time: '10:32 AM', user: SEED_USERS[1] },
        { id: 2, text: 'Just finished it last night! No spoilers but… wow.', time: '10:45 AM', user: SEED_USERS[2] },
        { id: 3, text: 'Still on chapter 18. One more day I promise 😅', time: '11:02 AM', user: SEED_USERS[0] },
        { id: 4, text: 'The ending of chapter 17 absolutely wrecked me.', time: '11:15 AM', user: SEED_USERS[3] },
      ],
      2: [
        { id: 10, text: 'The final shot is going to stay with me for weeks.', time: '3:00 PM', user: SEED_USERS[2] },
        { id: 11, text: 'Sandra Hüller deserves every award she got.', time: '3:20 PM', user: SEED_USERS[0] },
      ],
      3: [
        { id: 20, text: 'The way John B. describes the mercury clocks is just... haunting.', time: '11:00 AM', user: SEED_USERS[1] },
        { id: 21, text: 'First time listener. I went in blind and my jaw is on the floor.', time: '11:40 AM', user: SEED_USERS[0] },
      ],
      4: [
        { id: 30, text: 'Hades II hit early access and it is ALREADY better than the original.', time: '9:00 AM', user: SEED_USERS[3] },
        { id: 31, text: 'The new cast mechanic forces completely different builds.', time: '9:20 AM', user: SEED_USERS[0] },
      ],
    },
    posts: {
      1: [
        { id: 1, title: "The video game metaphors in ch.12 — intentional or incidental?", body: "I kept thinking about how Zevin uses the language of 'game over' to describe real endings.", time: '2 days ago', user: SEED_USERS[1], likeCount: 4, replyCount: 2, likedByMe: false, replies: [
          { id: 1, text: "Definitely intentional. The whole book is built on the idea that we get to restart, revise, iterate.", time: '2 days ago', user: SEED_USERS[2] },
        ]},
        { id: 2, title: "Sadie vs Sam — who do you relate to more?", body: "I'm firmly Team Sadie.", time: '4 days ago', user: SEED_USERS[3], likeCount: 7, replyCount: 1, likedByMe: false, replies: [] },
      ],
      2: [
        { id: 3, title: "The courtroom scenes and objective truth", body: "Triet builds the entire film around the impossibility of ever knowing what really happened.", time: '3 days ago', user: SEED_USERS[2], likeCount: 5, replyCount: 1, likedByMe: false, replies: [] },
      ],
      3: [], 4: [],
    },
    nextId: 100,
    importedItems: [],
    notifications: [
      { id: 1, type: 'post', read: false, count: 1, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), actor: SEED_USERS[1], message: 'Maya Patel posted in The Midnight Readers', target: { tab: 'clubs', clubId: 1, subTab: 'discussion' } },
      { id: 2, type: 'reply', read: false, count: 1, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), actor: SEED_USERS[2], message: 'Jordan Kim replied to your post', target: { tab: 'clubs', clubId: 1, subTab: 'discussion' } },
      { id: 3, type: 'chat', read: false, count: 3, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), actor: SEED_USERS[2], message: '3 new messages in Frame by Frame', target: { tab: 'clubs', clubId: 2, subTab: 'chat' } },
      { id: 4, type: 'like', read: true, count: 1, createdAt: new Date(Date.now() - 26 * 3600000).toISOString(), actor: SEED_USERS[3], message: 'Sam Rivera liked your post', target: { tab: 'clubs', clubId: 1, subTab: 'discussion' } },
      { id: 5, type: 'club_join', read: true, count: 1, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), actor: SEED_USERS[4], message: 'Priya Nair joined Deep Dive Pods', target: { tab: 'clubs', clubId: 3, subTab: 'members' } },
    ],
  }
}

// Mutable demo state — initialised from sessionStorage or seed data
let _state = initState()

function persist() { saveSession(_state) }

function colorForName(name) {
  const colors = ['#E8A020','#7A9E7E','#6B8DD6','#C47D5A','#9B6DB5','#4AADAB','#E87070','#D4A853']
  let h = 0; for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return colors[Math.abs(h) % colors.length]
}

function initialsFor(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function delay(ms = 300) { return new Promise(r => setTimeout(r, ms)) }

// ── Exported helpers used by AuthContext ─────────────────────────────────

export function getDemoUser() { return _state.user }

export function setDemoUser(user) {
  _state.user = user
  persist()
}

// ── Legacy export (used by old code) ────────────────────────────────────
// Returns the current demo user, NOT the hardcoded Alex Chen
export const ME = DEFAULT_USER

// ── Static + dynamic handlers ────────────────────────────────────────────

export const DEMO_HANDLERS = {
  // Auth — use provided credentials, not hardcoded Alex Chen
  '/auth/refresh': async () => ({ accessToken: 'demo-token' }),

  '/auth/login': async (_, body) => {
    // Check if logging in with a seeded user
    const seeded = SEED_USERS.find(u => u.username === body?.email?.split('@')[0] || body?.email === `${u.username}@hobbyist.app`)
    const user = seeded
      ? { ...seeded, email: `${seeded.username}@hobbyist.app`, onboardingDone: true, stats: { finished: 7, clubs: _state.clubs.length } }
      : _state.user
    _state.user = user
    persist()
    return { accessToken: 'demo-token', user }
  },

  '/auth/register': async (_, body) => {
    const displayName = body?.displayName || 'Demo User'
    const username = body?.username || 'demouser'
    const newUser = {
      id: ++_state.nextId,
      email: body?.email || `${username}@demo.app`,
      username,
      displayName,
      avatarColor: colorForName(displayName),
      avatarInitials: initialsFor(displayName),
      bio: '',
      onboardingDone: false,
      interests: [],
      stats: { finished: 0, clubs: 0 },
    }
    _state.user = newUser
    persist()
    return { accessToken: 'demo-token', user: newUser }
  },

  '/auth/logout': async () => {
    _state.user = { ...DEFAULT_USER }
    persist()
    return { ok: true }
  },

  '/auth/forgot-password': async () => ({ message: 'Demo mode — no email sent. Try logging in with any credentials.' }),

  // Users
  '/users/me': async () => ({
    ..._state.user,
    stats: { finished: _state.importedItems.filter(i => i.rating).length + 7, clubs: _state.clubs.length },
  }),

  'PUT /users/me': async (_, body) => {
    _state.user = { ..._state.user, ...body }
    persist()
    return _state.user
  },

  '/users/me/onboarding': async (_, body) => {
    _state.user = { ..._state.user, ...body, onboardingDone: true }
    persist()
    return _state.user
  },

  // Clubs — GET returns mutable list
  '/clubs': async () => {
    await delay()
    return _state.clubs.map(c => ({
      id: c.id, name: c.name, type: c.type, emoji: c.emoji,
      accentColor: c.accentColor, bgColor: c.bgColor,
      memberCount: c.memberCount, isPublic: c.isPublic,
      currentItem: c.currentItem ? { ...c.currentItem, myProgress: _state.progress[c.id] ?? c.currentItem.myProgress } : null,
    }))
  },

  '/clubs/explore': async () => { await delay(); return [] },

  '/feed': async () => {
    await delay()
    return [
      { id: 1, type: 'rated', label: 'rated', title: 'Past Lives', clubName: '', rating: 5.0, time: '5 days ago', user: SEED_USERS[0], likeCount: 3, commentCount: 1, extra: { type: 'film' } },
      { id: 2, type: 'joined_club', label: 'joined', title: '', clubName: 'Pixel & Play', rating: null, time: '2 weeks ago', user: SEED_USERS[0], likeCount: 5, commentCount: 0, extra: {} },
      { id: 3, type: 'rated', label: 'rated', title: 'All the Light We Cannot See', clubName: '', rating: 5.0, time: '8 days ago', user: SEED_USERS[1], likeCount: 4, commentCount: 2, extra: { type: 'book' } },
      { id: 4, type: 'posted', label: 'posted in', title: '', clubName: 'The Midnight Readers', rating: null, time: '2 days ago', user: SEED_USERS[1], likeCount: 1, commentCount: 0, extra: {} },
      { id: 5, type: 'rated', label: 'rated', title: 'Past Lives', clubName: '', rating: 4.5, time: '6 days ago', user: SEED_USERS[2], likeCount: 2, commentCount: 0, extra: { type: 'film' } },
      { id: 6, type: 'rated', label: 'rated', title: 'Balatro', clubName: '', rating: 4.5, time: '10 days ago', user: SEED_USERS[3], likeCount: 6, commentCount: 1, extra: { type: 'game' } },
    ]
  },

  '/discover': async () => {
    await delay()
    return {
      trending: [], newClubs: [], forYou: [],
      people: [
        { id: 2, displayName: 'Maya Patel',  username: 'mayap',  avatarColor: '#7A9E7E', avatarInitials: 'MP', bio: 'Design + sci-fi + too much coffee.', interests: ['book','podcast'] },
        { id: 5, displayName: 'Priya Nair',  username: 'priyan', avatarColor: '#9B6DB5', avatarInitials: 'PN', bio: 'Podcast addict. Always listening.', interests: ['podcast','film'] },
      ],
      myClubCount: _state.clubs.length,
    }
  },

  '/leaderboard': async () => {
    await delay()
    return {
      entries: [
        { id: 2, displayName: 'Maya Patel',  username: 'mayap',   avatarColor: '#7A9E7E', avatarInitials: 'MP', score: 180, finished: 12, streak: 7,  rank: 1 },
        { id: 5, displayName: 'Priya Nair',  username: 'priyan',  avatarColor: '#9B6DB5', avatarInitials: 'PN', score: 160, finished: 10, streak: 5,  rank: 2 },
        { id: 3, displayName: 'Jordan Kim',  username: 'jordank', avatarColor: '#6B8DD6', avatarInitials: 'JK', score: 140, finished: 9,  streak: 3,  rank: 3 },
        { id: 8, displayName: 'Kai Nakamura',username: 'kain',    avatarColor: '#D4A853', avatarInitials: 'KN', score: 120, finished: 8,  streak: 12, rank: 4 },
        { id: 1, displayName: _state.user.displayName, username: _state.user.username, avatarColor: _state.user.avatarColor, avatarInitials: _state.user.avatarInitials, score: 90, finished: 6, streak: 4, rank: 5 },
      ],
      myRank: 5, myScore: 90,
    }
  },

  '/analytics': async () => {
    await delay()
    const imported = _state.importedItems.length
    const lcg = (s) => { let x = s; return () => { x = (1664525 * x + 1013904223) & 0xffffffff; return (x >>> 0) / 0xffffffff } }
    const rand = lcg(42)
    const heatmap = []
    const now = new Date()
    const yearAgo = new Date(now); yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    for (let w = 0; w < 52; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(yearAgo); date.setDate(date.getDate() + w * 7 + d)
        week.push({ date: date.toISOString().slice(0, 10), count: rand() > 0.75 ? Math.floor(rand() * 4) + 1 : 0 })
      }
      heatmap.push(week)
    }
    const importSources = {}
    _state.importedItems.forEach(i => { importSources[i.source || 'manual'] = (importSources[i.source || 'manual'] || 0) + 1 })
    return {
      summary: { finished: 7 + imported, avgRating: 4.5, clubs: _state.clubs.length, thisYear: 5 + imported, imported },
      monthly: [
        { month: 'Jan', total: 2, book: 1, film: 1, podcast: 0, game: 0 },
        { month: 'Feb', total: 3, book: 1, film: 1, podcast: 0, game: 1 },
        { month: 'Mar', total: 1, book: 1, film: 0, podcast: 0, game: 0 },
        { month: 'Apr', total: 4, book: 1, film: 1, podcast: 1, game: 1 },
        { month: 'May', total: 3, book: 1, film: 1, podcast: 0, game: 1 },
        { month: 'Jun', total: 2 + imported, book: 1, film: 1, podcast: 0, game: 0 },
      ],
      types: [
        { type: 'book', count: 3, pct: 30 }, { type: 'film', count: 2, pct: 25 },
        { type: 'game', count: 2, pct: 25 }, { type: 'podcast', count: 1, pct: 20 },
      ],
      heatmap,
      recentRatings: [
        { id: 'r1', title: 'Past Lives', subtitle: 'Celine Song', type: 'film', rating: 5.0, source: 'club', createdAt: new Date(Date.now() - 5*86400000) },
        { id: 'r2', title: 'All the Light We Cannot See', subtitle: 'Anthony Doerr', type: 'book', rating: 4.5, source: 'club', createdAt: new Date(Date.now() - 8*86400000) },
        { id: 'r3', title: 'Balatro', subtitle: 'LocalThunk', type: 'game', rating: 5.0, source: 'club', createdAt: new Date(Date.now() - 10*86400000) },
        ..._state.importedItems.filter(i => i.rating).slice(0, 5),
      ],
      importSources,
    }
  },

  '/notifications': async () => {
    await delay()
    return {
      notifications: _state.notifications,
      unreadCount: _state.notifications.filter(n => !n.read).length,
      hasMore: false,
    }
  },

  '/import': async (_, body) => {
    await delay(600)
    const items = (body?.items || []).map(i => ({ ...i, id: `imp-${++_state.nextId}`, source: body.source }))
    _state.importedItems = [...items, ..._state.importedItems].slice(0, 500)
    persist()
    return { imported: items.length, skipped: 0, total: items.length }
  },
}

// ── Dynamic path handlers ────────────────────────────────────────────────

export function matchDemoHandler(method, path, body) {
  // Public club preview (no auth)
  const publicClub = path.match(/^\/clubs\/public\/(\d+)$/)
  if (publicClub && method === 'GET') {
    return async () => {
      await delay()
      const id = Number(publicClub[1])
      const club = _state.clubs.find(c => c.id === id && c.isPublic)
      if (!club) return null
      return {
        id: club.id, name: club.name, description: club.description,
        type: club.type, emoji: club.emoji, accentColor: club.accentColor,
        bgColor: club.bgColor, memberCount: club.memberCount,
        currentItem: club.currentItem ? {
          title: club.currentItem.title, subtitle: club.currentItem.subtitle,
          coverUrl: club.currentItem.coverUrl ?? null,
          coverColor: club.currentItem.coverColor, type: club.currentItem.type,
        } : null,
      }
    }
  }

  // Club detail
  const clubDetail = path.match(/^\/clubs\/(\d+)$/)
  if (clubDetail && method === 'GET') {
    return async () => {
      await delay()
      const id = Number(clubDetail[1])
      const club = _state.clubs.find(c => c.id === id)
      if (!club) return null
      return { ...club, currentItem: club.currentItem ? { ...club.currentItem, myProgress: _state.progress[id] ?? club.currentItem.myProgress } : null }
    }
  }

  // Progress update
  const progress = path.match(/^\/clubs\/(\d+)\/progress$/)
  if (progress && method === 'PUT') {
    return async () => {
      const id = Number(progress[1])
      _state.progress[id] = body?.progress ?? 0
      // Update progress in the club's members list for the current user
      const club = _state.clubs.find(c => c.id === id)
      if (club?.members) {
        const m = club.members.find(m => m.user.id === _state.user.id)
        if (m) m.progress = body?.progress ?? 0
      }
      persist()
      return { progress: body?.progress }
    }
  }

  // Posts list
  const postsList = path.match(/^\/posts\/club\/(\d+)$/)
  if (postsList && method === 'GET') {
    return async () => { await delay(); return _state.posts[Number(postsList[1])] || [] }
  }

  // New post
  if (postsList && method === 'POST') {
    return async () => {
      const clubId = Number(postsList[1])
      const p = {
        id: ++_state.nextId, title: body.title, body: body.body, time: 'just now',
        user: _state.user, likeCount: 0, replyCount: 0, likedByMe: false, replies: [],
      }
      if (!_state.posts[clubId]) _state.posts[clubId] = []
      _state.posts[clubId].unshift(p)
      persist()
      return p
    }
  }

  // Like toggle
  const like = path.match(/^\/posts\/(\d+)\/like$/)
  if (like) {
    return async () => {
      const postId = Number(like[1])
      for (const posts of Object.values(_state.posts)) {
        const p = posts.find(p => p.id === postId)
        if (p) { p.likedByMe = !p.likedByMe; p.likeCount += p.likedByMe ? 1 : -1 }
      }
      const found = Object.values(_state.posts).flat().find(p => p.id === postId)
      persist()
      return { liked: found?.likedByMe ?? false }
    }
  }

  // Reply
  const reply = path.match(/^\/posts\/(\d+)\/replies$/)
  if (reply) {
    return async () => {
      const postId = Number(reply[1])
      const r = { id: ++_state.nextId, text: body.text, time: 'just now', user: _state.user }
      for (const posts of Object.values(_state.posts)) {
        const p = posts.find(p => p.id === postId)
        if (p) { p.replies.push(r); p.replyCount++ }
      }
      persist()
      return r
    }
  }

  // Chat fetch
  const chat = path.match(/^\/chat\/(\d+)$/)
  if (chat && method === 'GET') {
    return async () => { await delay(); return _state.chatMessages[Number(chat[1])] || [] }
  }

  // Chat send
  if (chat && method === 'POST') {
    return async () => {
      const clubId = Number(chat[1])
      const now = new Date()
      const t = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const msg = { id: ++_state.nextId, text: body.text, time: t, user: _state.user }
      if (!_state.chatMessages[clubId]) _state.chatMessages[clubId] = []
      _state.chatMessages[clubId].push(msg)
      persist()
      return msg
    }
  }

  // Rate item
  const rate = path.match(/^\/clubs\/(\d+)\/rate$/)
  if (rate) { return async () => { await delay(300); return { rating: body.rating, review: body.review } } }

  // Add item to club (admin)
  const addItem = path.match(/^\/clubs\/(\d+)\/items$/)
  if (addItem) {
    return async () => {
      const clubId = Number(addItem[1])
      const club = _state.clubs.find(c => c.id === clubId)
      if (club) {
        if (club.currentItem) club.pastItems.unshift({ ...club.currentItem, avgRating: null, ratingCount: 0 })
        club.currentItem = { id: ++_state.nextId, title: body.title, subtitle: body.subtitle || '', description: body.description || '', coverColor: body.coverColor || '#162030', type: body.type || club.type, myProgress: 0 }
        persist()
      }
      return club?.currentItem || body
    }
  }

  // Create club — adds to the mutable list
  if (path === '/clubs' && method === 'POST') {
    return async () => {
      const DEFAULTS = { book: { emoji: '📚', accentColor: '#C47D5A', bgColor: '#2A1A0E' }, film: { emoji: '🎬', accentColor: '#6B8DD6', bgColor: '#0D1528' }, podcast: { emoji: '🎙️', accentColor: '#4AADAB', bgColor: '#0D2020' }, game: { emoji: '🎮', accentColor: '#9B6DB5', bgColor: '#1A1028' } }
      const d = DEFAULTS[body.type] || DEFAULTS.book
      const newClub = {
        id: ++_state.nextId,
        name: body.name, description: body.description || '', type: body.type,
        ...d, isPublic: body.isPublic ?? true, isMember: true, myRole: 'admin',
        memberCount: 1, currentItem: null, pastItems: [],
        members: [{ user: _state.user, role: 'admin', progress: 0 }],
      }
      _state.clubs.unshift(newClub)
      persist()
      return { ...newClub }
    }
  }

  // Join club
  const join = path.match(/^\/clubs\/(\d+)\/join$/)
  if (join) {
    return async () => {
      const clubId = Number(join[1])
      const club = _state.clubs.find(c => c.id === clubId)
      if (club) { club.isMember = true; club.memberCount++; persist() }
      return { ok: true }
    }
  }

  // Leave club
  const leave = path.match(/^\/clubs\/(\d+)\/leave$/)
  if (leave) {
    return async () => {
      const clubId = Number(leave[1])
      _state.clubs = _state.clubs.filter(c => c.id !== clubId)
      persist()
      return { ok: true }
    }
  }

  // Users by ID
  if (path.match(/^\/users\/\d+$/)) {
    return async () => SEED_USERS.find(u => u.id === Number(path.split('/')[2])) || SEED_USERS[0]
  }

  // Mark all notifications read
  if (path === '/notifications/read-all' && method === 'POST') {
    return async () => {
      _state.notifications.forEach(n => { n.read = true })
      persist()
      return { ok: true }
    }
  }

  // Mark single notification read
  const notifRead = path.match(/^\/notifications\/(\d+)\/read$/)
  if (notifRead && method === 'POST') {
    return async () => {
      const id = Number(notifRead[1])
      const n = _state.notifications.find(n => n.id === id)
      if (n) { n.read = true; persist() }
      return { ok: true }
    }
  }

  // Search
  if (path.startsWith('/search')) {
    return async () => {
      const params = new URLSearchParams(path.split('?')[1] || '')
      const q = params.get('q')?.toLowerCase() || ''
      return {
        users: SEED_USERS.filter(u => u.displayName.toLowerCase().includes(q) || u.username.includes(q)),
        clubs: _state.clubs.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.type.includes(q)),
        items: [],
      }
    }
  }

  return null
}
