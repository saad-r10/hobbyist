import { useState, useMemo, useRef, useEffect } from 'react'
import {
  BookOpen, Film, Mic, Gamepad2, Users, Bell, Home,
  Compass, Trophy, BarChart2, User, Heart, MessageCircle,
  Star, ChevronRight, ArrowLeft, Flame, Plus, Check,
  Clock, MessageSquare, Layers, Grid, List, Award,
  TrendingUp, Bookmark, Settings, Search, Zap, Coffee
} from 'lucide-react'

// ════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════

const ME = {
  id: 1, name: 'Alex Chen', username: '@alexchen', initials: 'AC',
  color: '#E8A020',
  bio: 'Reading, watching, and listening my way through life. SF → NYC. Always in the middle of too many things at once.',
  memberSince: 'March 2023',
  stats: { finished: 47, clubs: 4, following: 23, followers: 31 },
}

const USERS = [
  { id: 1, name: 'Alex Chen',     username: '@alexchen', initials: 'AC', color: '#E8A020' },
  { id: 2, name: 'Maya Patel',    username: '@mayap',    initials: 'MP', color: '#7A9E7E' },
  { id: 3, name: 'Jordan Kim',    username: '@jordank',  initials: 'JK', color: '#6B8DD6' },
  { id: 4, name: 'Sam Rivera',    username: '@samr',     initials: 'SR', color: '#C47D5A' },
  { id: 5, name: 'Priya Nair',    username: '@priyan',   initials: 'PN', color: '#9B6DB5' },
  { id: 6, name: 'Theo Walsh',    username: '@theow',    initials: 'TW', color: '#4AADAB' },
  { id: 7, name: 'Ines Moreau',   username: '@inesm',    initials: 'IM', color: '#E87070' },
  { id: 8, name: 'Kai Nakamura',  username: '@kain',     initials: 'KN', color: '#D4A853' },
]

const CLUBS = [
  {
    id: 1, name: 'The Midnight Readers', type: 'book',
    bg: '#2A1A0E', accent: '#C47D5A', members: 6,
    memberIds: [1,2,3,4,5,6],
    currentItem: {
      title: 'Tomorrow, and Tomorrow, and Tomorrow',
      subtitle: 'Gabrielle Zevin',
      description: 'A dazzling novel about creativity, failure, and the lifelong bonds forged in the pursuit of making something from nothing — told through three decades of video game development.',
      coverBg: '#5A3520', progress: 67,
    },
    nextMeetup: 'Jun 1', unread: 3,
    pastItems: [
      { title: 'The Midnight Library',         rating: 4.2, color: '#1A2850', type: 'book' },
      { title: 'All the Light We Cannot See',   rating: 4.7, color: '#3A2020', type: 'book' },
      { title: 'Demon Copperhead',              rating: 4.5, color: '#1E2A1A', type: 'book' },
      { title: 'Trust',                         rating: 4.0, color: '#201A2A', type: 'book' },
    ],
    discussions: [
      {
        id: 1, user: USERS[1],
        title: 'The video game metaphors in ch.12 — intentional or incidental?',
        body: 'I kept thinking about how Zevin uses the language of "game over" to describe real endings. Is this just clever theming or does it cut deeper into the whole book\'s thesis?',
        time: '2 days ago', likes: 4,
        replies: [
          { user: USERS[2], text: 'Definitely intentional. The whole book is built on the idea that we get to restart, revise, iterate. Failure is a mechanic, not a verdict.', time: '2 days ago' },
          { user: USERS[0], text: 'What got me is how "loading" feels like grief — you\'re stuck between states and can\'t move until something resolves.', time: '1 day ago' },
        ],
      },
      {
        id: 2, user: USERS[3],
        title: 'Sadie vs Sam — who do you relate to more?',
        body: 'I\'m firmly Team Sadie. The way she pours herself into work and still feels unseen resonates deeply. Sam\'s arc felt too passive at times.',
        time: '4 days ago', likes: 7,
        replies: [
          { user: USERS[4], text: 'Sam for me, actually. His path felt more like someone learning how to belong — flawed and earnest.', time: '3 days ago' },
        ],
      },
      {
        id: 3, user: USERS[0],
        title: 'Pacing discussion: did the time jumps work for you?',
        body: 'Some chapters felt like years flew by and others like we were in slow motion inside a single afternoon. I think that\'s the point — but curious what the group thought.',
        time: '6 days ago', likes: 3,
        replies: [],
      },
    ],
    chat: [
      { user: USERS[1], text: 'Did everyone get to chapter 20?', time: '10:32 AM' },
      { user: USERS[2], text: 'Just finished it last night! No spoilers but… wow.', time: '10:45 AM' },
      { user: USERS[0], text: 'Still on chapter 18. One more day I promise 😅', time: '11:02 AM' },
      { user: USERS[3], text: 'The ending of chapter 17 absolutely wrecked me.', time: '11:15 AM' },
      { user: USERS[4], text: 'I had to put it down for a full day after that chapter.', time: '11:18 AM' },
      { user: USERS[1], text: 'No spoilers but Sam\'s arc is going somewhere wild in part 3', time: 'Yesterday, 3:14 PM' },
    ],
    memberDetails: [
      { user: USERS[0], progress: 72,  lastActive: 'Today' },
      { user: USERS[1], progress: 100, lastActive: 'Today' },
      { user: USERS[2], progress: 100, lastActive: 'Yesterday' },
      { user: USERS[3], progress: 85,  lastActive: '2 days ago' },
      { user: USERS[4], progress: 40,  lastActive: '3 days ago' },
      { user: USERS[5], progress: 25,  lastActive: '5 days ago' },
    ],
  },
  {
    id: 2, name: 'Frame by Frame', type: 'film',
    bg: '#0D1528', accent: '#6B8DD6', members: 4,
    memberIds: [1,3,6,7],
    currentItem: {
      title: 'Past Lives',
      subtitle: 'dir. Celine Song',
      description: 'A luminous, quietly devastating drama about two childhood sweethearts from South Korea who reconnect in New York two decades later — and reckon with the lives they didn\'t choose.',
      coverBg: '#1E2D60', progress: 100,
    },
    nextMeetup: 'May 28', unread: 0,
    pastItems: [
      { title: 'The Holdovers',          rating: 4.6, color: '#2A1A10', type: 'film' },
      { title: 'Aftersun',               rating: 4.8, color: '#101E2A', type: 'film' },
      { title: 'Tár',                    rating: 4.3, color: '#1A1A2A', type: 'film' },
      { title: 'Women Talking',          rating: 4.4, color: '#1E1A10', type: 'film' },
    ],
    discussions: [
      {
        id: 1, user: USERS[6],
        title: 'That final taxi scene — what was your read?',
        body: 'Song holds on Nora\'s face for so long without cutting. The restraint is extraordinary. I\'ve watched it three times and see something different each time.',
        time: '3 days ago', likes: 9,
        replies: [
          { user: USERS[0], text: 'Grief that\'s been practiced for years finally getting permission to express itself. It\'s all she allowed herself.', time: '2 days ago' },
          { user: USERS[2], text: 'The way she composed herself right after — that was the real performance. The control.', time: '2 days ago' },
        ],
      },
      {
        id: 2, user: USERS[2],
        title: 'Should we vote on the next film? I have suggestions.',
        body: 'I\'m pushing for American Fiction or All of Us Strangers. Both have been sitting on my letterboxd watchlist. Anyone seen either?',
        time: '5 days ago', likes: 4,
        replies: [
          { user: USERS[6], text: 'American Fiction is extraordinary. Savagely funny and then it just… turns on you in the best way.', time: '4 days ago' },
        ],
      },
    ],
    chat: [
      { user: USERS[6], text: 'Should we do Fallen Leaves next? Or something less devastating lol', time: 'Monday 2:12 PM' },
      { user: USERS[2], text: 'I vote something with actual plot this time', time: 'Monday 2:48 PM' },
      { user: USERS[0], text: 'Ha! Fair. What about American Fiction?', time: 'Monday 3:05 PM' },
      { user: USERS[6], text: 'Yes!! That\'s been on my list forever', time: 'Tuesday 9:20 AM' },
      { user: USERS[2], text: 'Voting yes. Setting it for June meetup?', time: 'Tuesday 9:45 AM' },
    ],
    memberDetails: [
      { user: USERS[0], progress: 100, lastActive: 'Today' },
      { user: USERS[2], progress: 100, lastActive: 'Yesterday' },
      { user: USERS[5], progress: 100, lastActive: '2 days ago' },
      { user: USERS[6], progress: 100, lastActive: '3 days ago' },
    ],
  },
  {
    id: 3, name: 'Deep Dive Pods', type: 'podcast',
    bg: '#0C1A10', accent: '#7A9E7E', members: 8,
    memberIds: [1,2,3,4,5,6,7,8],
    currentItem: {
      title: '99% Invisible — "The Fancy Shape"',
      subtitle: 'Roman Mars',
      description: 'How the shapes we live among — of doorknobs, buildings, street grids, ballot papers — were designed by someone, for a reason, and how they quietly program our behavior every single day.',
      coverBg: '#1C3A20', progress: 45,
    },
    nextMeetup: 'Jun 5', unread: 12,
    pastItems: [
      { title: 'Blueprint for Armageddon (Hardcore History)', rating: 4.9, color: '#2A1A10', type: 'podcast' },
      { title: 'Serial — Season 1',                          rating: 4.4, color: '#10202A', type: 'podcast' },
      { title: 'S-Town',                                     rating: 4.8, color: '#1A1A10', type: 'podcast' },
      { title: 'Radiolab — "Antibodies, Part 1"',            rating: 4.5, color: '#1A2810', type: 'podcast' },
    ],
    discussions: [
      {
        id: 1, user: USERS[7],
        title: 'Does form really follow function — or is it the other way around?',
        body: 'This episode challenged my whole understanding of design intentionality. The fancy shape argument feels like it applies beyond architecture — to UI, to language, to institutions.',
        time: '1 day ago', likes: 6,
        replies: [
          { user: USERS[1], text: 'I kept thinking about how Instagram\'s algorithm is "designed" but then shapes the psychology of 800M people. Who follows whom here?', time: '23 hours ago' },
          { user: USERS[0], text: 'There\'s a great McLuhan parallel here. The medium shaping the message shaping the medium.', time: '20 hours ago' },
        ],
      },
    ],
    chat: [
      { user: USERS[7], text: 'Anyone finish the episode yet?', time: '9:00 AM' },
      { user: USERS[1], text: 'Done! The bit about Bauhaus was genuinely mind-expanding.', time: '9:30 AM' },
      { user: USERS[4], text: 'Halfway through. Not listening at work because I keep zoning out thinking about stuff lol', time: '10:15 AM' },
      { user: USERS[0], text: 'That\'s the sign of a truly great episode, Priya.', time: '10:22 AM' },
      { user: USERS[3], text: 'Can we add it to the discussion thread? I have A Lot to say', time: '11:00 AM' },
      { user: USERS[7], text: 'Already started one! Jump in.', time: '11:03 AM' },
    ],
    memberDetails: [
      { user: USERS[0], progress: 50,  lastActive: 'Today' },
      { user: USERS[1], progress: 100, lastActive: 'Today' },
      { user: USERS[2], progress: 30,  lastActive: 'Yesterday' },
      { user: USERS[3], progress: 0,   lastActive: '4 days ago' },
      { user: USERS[4], progress: 50,  lastActive: 'Today' },
      { user: USERS[5], progress: 80,  lastActive: 'Yesterday' },
      { user: USERS[6], progress: 100, lastActive: '2 days ago' },
      { user: USERS[7], progress: 100, lastActive: 'Today' },
    ],
  },
  {
    id: 4, name: 'Pixel & Play', type: 'game',
    bg: '#120E28', accent: '#9B6DB5', members: 5,
    memberIds: [1,2,5,7,8],
    currentItem: {
      title: 'Disco Elysium',
      subtitle: 'ZA/UM',
      description: 'An amnesiac detective pieces together a murder case — and his own shattered identity — across a crumbling postindustrial city. The most literary RPG ever made, and possibly the most honest game about failure.',
      coverBg: '#2A1A50', progress: 30,
    },
    nextMeetup: 'Jun 8', unread: 5,
    pastItems: [
      { title: 'Hades',                        rating: 4.7, color: '#2A1018', type: 'game' },
      { title: 'Celeste',                       rating: 4.6, color: '#101828', type: 'game' },
      { title: 'What Remains of Edith Finch',   rating: 4.8, color: '#101A10', type: 'game' },
      { title: 'Outer Wilds',                   rating: 4.9, color: '#201A10', type: 'game' },
    ],
    discussions: [
      {
        id: 1, user: USERS[4],
        title: 'The political factions — picking sides or staying deliberately neutral?',
        body: 'I\'ve been trying to stay ideologically curious but Moralist is feeling like the path of least resistance. Anyone go full Communist or Fascist? How does the writing handle it?',
        time: '5 days ago', likes: 8,
        replies: [
          { user: USERS[7], text: 'I went Ultraliberal as a bit and accidentally created a character I love. The writing commits completely.', time: '4 days ago' },
          { user: USERS[1], text: 'The Fascist dialogue is genuinely disturbing in how coherent it sounds. It\'s doing something very intentional.', time: '4 days ago' },
        ],
      },
    ],
    chat: [
      { user: USERS[4], text: 'Who else is stuck on the Martinaise dance floor quest??', time: 'Friday 2:15 PM' },
      { user: USERS[7], text: 'YES. I failed that check like 8 times in a row', time: 'Friday 3:20 PM' },
      { user: USERS[1], text: 'You need to use the Shivers passive ability. The game doesn\'t tell you this at all.', time: 'Friday 3:45 PM' },
      { user: USERS[4], text: 'WHAT. The game just… doesn\'t say that?!', time: 'Friday 3:47 PM' },
      { user: USERS[0], text: 'I haven\'t gotten there yet but now I\'m emotionally ready', time: 'Saturday 10:00 AM' },
    ],
    memberDetails: [
      { user: USERS[0], progress: 25, lastActive: 'Today' },
      { user: USERS[1], progress: 45, lastActive: 'Yesterday' },
      { user: USERS[4], progress: 40, lastActive: 'Today' },
      { user: USERS[6], progress: 10, lastActive: '1 week ago' },
      { user: USERS[7], progress: 60, lastActive: '2 days ago' },
    ],
  },
]

const FEED = [
  {
    id: 1, user: USERS[1], club: 'The Midnight Readers',
    activityType: 'finished', contentType: 'book',
    title: 'The Covenant of Water',
    note: 'Abraham Verghese does it again. A multigenerational saga set in India spanning 80 years — the kind of novel you want to live inside.',
    time: '2 hours ago', likes: 14, comments: 3,
  },
  {
    id: 2, user: USERS[6], club: 'Frame by Frame',
    activityType: 'rated', contentType: 'film',
    title: 'Past Lives', rating: 5,
    note: 'Absolutely wrecked. Cinema of the highest order. I sat in my car for twenty minutes after.',
    time: '5 hours ago', likes: 22, comments: 7,
  },
  {
    id: 3, user: USERS[7], club: 'Deep Dive Pods',
    activityType: 'discussed', contentType: 'podcast',
    title: '99% Invisible — "The Fancy Shape"',
    note: 'Started a thread about form vs. function. This episode keeps rewiring my brain.',
    time: '1 day ago', likes: 6, comments: 4,
  },
  {
    id: 4, user: USERS[0], club: 'Pixel & Play',
    activityType: 'started', contentType: 'game',
    title: 'Disco Elysium',
    note: 'Three hours in and I\'ve accidentally become a fascist. This game is something else entirely.',
    time: '1 day ago', likes: 11, comments: 5,
  },
  {
    id: 5, user: USERS[2], club: 'Frame by Frame',
    activityType: 'recommended', contentType: 'film',
    title: 'American Fiction',
    note: 'If we don\'t watch this for June I will personally dissolve the club. (Not really. But seriously.)',
    time: '2 days ago', likes: 8, comments: 2,
  },
  {
    id: 6, user: USERS[3], club: 'The Midnight Readers',
    activityType: 'rated', contentType: 'book',
    title: 'Tomorrow, and Tomorrow, and Tomorrow', rating: 4,
    note: null,
    time: '2 days ago', likes: 5, comments: 1,
  },
  {
    id: 7, user: USERS[5], club: 'Deep Dive Pods',
    activityType: 'finished', contentType: 'podcast',
    title: '99% Invisible — "The Fancy Shape"',
    note: 'Listened twice. The Bauhaus segment is something I\'ll be thinking about for weeks.',
    time: '3 days ago', likes: 4, comments: 0,
  },
  {
    id: 8, user: USERS[4], club: 'Pixel & Play',
    activityType: 'discussed', contentType: 'game',
    title: 'Disco Elysium',
    note: 'Asked about the political factions — the replies have been gold.',
    time: '5 days ago', likes: 9, comments: 3,
  },
]

const RECS = {
  featured: {
    title: 'Orbital', author: 'Samantha Harvey', type: 'book',
    rating: 4.6, genre: 'Literary Fiction',
    description: 'Booker Prize winner. A meditation on one day aboard the International Space Station — for readers who want something slow, luminous, and quietly devastating.',
    coverBg: '#0E1E38',
  },
  rows: [
    {
      label: 'Because you\'re in The Midnight Readers',
      items: [
        { title: 'The Women',      sub: 'Kristin Hannah',   type: 'book',    rating: 4.3, genre: 'Historical Fiction',  coverBg: '#3A1A1A' },
        { title: 'James',         sub: 'Percival Everett',  type: 'book',    rating: 4.7, genre: 'Literary Fiction',    coverBg: '#1A2A3A' },
        { title: 'The God of the Woods', sub: 'Lauren Fox', type: 'book',    rating: 4.1, genre: 'Thriller',            coverBg: '#1A3A1A' },
        { title: 'Long Island',   sub: 'Colm Tóibín',      type: 'book',    rating: 4.4, genre: 'Literary Fiction',    coverBg: '#2A2A1A' },
      ],
    },
    {
      label: 'Trending in Film Clubs this week',
      items: [
        { title: 'All of Us Strangers', sub: 'Andrew Haigh',    type: 'film', rating: 4.5, genre: 'Drama',           coverBg: '#1A1A3A' },
        { title: 'Robot Dreams',        sub: 'Pablo Berger',    type: 'film', rating: 4.6, genre: 'Animation',       coverBg: '#3A1A2A' },
        { title: 'The Zone of Interest',sub: 'Jonathan Glazer', type: 'film', rating: 4.2, genre: 'Historical',      coverBg: '#2A2A2A' },
        { title: 'Monster',             sub: 'Kore-eda',        type: 'film', rating: 4.7, genre: 'Drama',           coverBg: '#1A3A2A' },
      ],
    },
    {
      label: 'Members of Deep Dive Pods also loved',
      items: [
        { title: 'Conan O\'Brien Needs a Friend', sub: 'Conan O\'Brien',  type: 'podcast', rating: 4.4, genre: 'Comedy',        coverBg: '#3A2A10' },
        { title: 'Darknet Diaries',               sub: 'Jack Rhysider',   type: 'podcast', rating: 4.8, genre: 'True Crime',    coverBg: '#101A2A' },
        { title: 'The Anthropocene Reviewed',     sub: 'John Green',      type: 'podcast', rating: 4.9, genre: 'Essays',        coverBg: '#1A2A1A' },
        { title: 'Maintenance Phase',             sub: 'Aubrey Gordon',   type: 'podcast', rating: 4.7, genre: 'Health',        coverBg: '#2A1A2A' },
      ],
    },
  ],
}

const LEADERBOARD = [
  { rank: 1, user: USERS[1], club: 'Deep Dive Pods',        completed: 23, discussions: 47, streak: 34, pts: 2180 },
  { rank: 2, user: USERS[7], club: 'Pixel & Play',          completed: 19, discussions: 38, streak: 21, pts: 1870 },
  { rank: 3, user: USERS[6], club: 'Frame by Frame',        completed: 17, discussions: 31, streak: 15, pts: 1620 },
  { rank: 4, user: USERS[2], club: 'Frame by Frame',        completed: 15, discussions: 28, streak: 12, pts: 1450 },
  { rank: 5, user: USERS[4], club: 'Pixel & Play',          completed: 14, discussions: 25, streak: 9,  pts: 1320 },
  { rank: 6, user: USERS[3], club: 'The Midnight Readers',  completed: 12, discussions: 20, streak: 7,  pts: 1100 },
  { rank: 7, user: USERS[5], club: 'Deep Dive Pods',        completed: 11, discussions: 18, streak: 5,  pts: 980  },
  { rank: 8, user: USERS[0], club: 'All Clubs',             completed: 10, discussions: 15, streak: 8,  pts: 900  },
  { rank: 9,  user: { name: 'Carlos Mendez',  initials: 'CM', color: '#D4856A' }, club: 'Film Club Elite',  completed: 9,  discussions: 12, streak: 3, pts: 780 },
  { rank: 10, user: { name: 'Yuki Tanaka',    initials: 'YT', color: '#85B4C9' }, club: 'Midnight Readers', completed: 8,  discussions: 10, streak: 2, pts: 680 },
]

const ANALYTICS = {
  summary: { finished: 47, clubs: 4, discussions: 38, streak: 8 },
  monthly: [
    { month: 'Jan', books: 2, films: 3, podcasts: 1, games: 0 },
    { month: 'Feb', books: 3, films: 2, podcasts: 3, games: 1 },
    { month: 'Mar', books: 1, films: 4, podcasts: 2, games: 0 },
    { month: 'Apr', books: 4, films: 2, podcasts: 3, games: 2 },
    { month: 'May', books: 2, films: 3, podcasts: 4, games: 1 },
    { month: 'Jun', books: 1, films: 1, podcasts: 1, games: 0 },
  ],
  types: [
    { label: 'Books',    pct: 38, color: '#C47D5A' },
    { label: 'Films',    pct: 32, color: '#6B8DD6' },
    { label: 'Podcasts', pct: 21, color: '#7A9E7E' },
    { label: 'Games',    pct: 9,  color: '#9B6DB5' },
  ],
  genres: [
    { genre: 'Literary Fiction',   count: 18 },
    { genre: 'Drama / Arthouse',   count: 14 },
    { genre: 'History & Society',  count: 11 },
    { genre: 'Science Fiction',    count: 8  },
    { genre: 'Thriller / Mystery', count: 6  },
  ],
  recentRatings: [
    { title: 'Past Lives',                   type: 'film',    rating: 5 },
    { title: 'Tomorrow, and Tomorrow…',      type: 'book',    rating: 4 },
    { title: 'Hardcore History',             type: 'podcast', rating: 5 },
    { title: 'Hades',                        type: 'game',    rating: 4 },
    { title: 'The Holdovers',                type: 'film',    rating: 4 },
  ],
}

const PROFILE_FEED = FEED.filter(f => f.user.id === 1)

// ════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ════════════════════════════════════════════════════════

function Avatar({ initials, color, size = 'md' }) {
  const sz = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-13 h-13 text-base', xl: 'w-18 h-18 text-xl' }
  const px = { xs: 24, sm: 32, md: 40, lg: 52, xl: 72 }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none`}
      style={{
        width: px[size], height: px[size],
        fontSize: size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 13 : size === 'lg' ? 15 : 20,
        background: color + '28',
        color,
        border: `1.5px solid ${color}55`,
      }}
    >
      {initials}
    </div>
  )
}

function TypeIcon({ type, size = 14 }) {
  const icons = {
    book:    <BookOpen size={size} />,
    film:    <Film size={size} />,
    podcast: <Mic size={size} />,
    game:    <Gamepad2 size={size} />,
  }
  const colors = { book: '#C47D5A', film: '#6B8DD6', podcast: '#7A9E7E', game: '#9B6DB5' }
  return <span style={{ color: colors[type] }}>{icons[type]}</span>
}

function ActivityBadge({ type }) {
  const cfg = {
    finished:    { label: 'finished',    c: '#7A9E7E' },
    started:     { label: 'started',     c: '#6B8DD6' },
    rated:       { label: 'rated',       c: '#E8A020' },
    recommended: { label: 'recommended', c: '#C47D5A' },
    discussed:   { label: 'discussed',   c: '#9B6DB5' },
  }
  const d = cfg[type] || { label: type, c: '#aaa' }
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ color: d.c, background: d.c + '22' }}>
      {d.label}
    </span>
  )
}

function Stars({ rating, max = 5, size = 12 }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={size}
          fill={i < Math.round(rating) ? '#E8A020' : 'none'}
          color={i < Math.round(rating) ? '#E8A020' : 'rgba(255,255,255,0.2)'} />
      ))}
    </div>
  )
}

function ProgressRing({ pct, size = 44, stroke = 3.5, color = '#E8A020' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const off = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

function ProgressBar({ pct, color = '#E8A020', height = 4 }) {
  return (
    <div className="rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.08)' }}>
      <div className="h-full rounded-full progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 border border-white/5" style={{ background: '#162030' }}>
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded shimmer w-3/4" />
          <div className="h-3 rounded shimmer w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 rounded shimmer w-full" />
        <div className="h-4 rounded shimmer w-5/6" />
        <div className="h-3 rounded shimmer w-2/3 mt-3" />
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// GLOBAL FEED
// ════════════════════════════════════════════════════════

function FeedCard({ item }) {
  const [liked, setLiked] = useState(false)
  return (
    <div className="rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-150 cursor-pointer group"
      style={{ background: '#162030' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar initials={item.user.initials} color={item.user.color} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm" style={{ color: '#F5F0E8' }}>{item.user.name}</span>
            <ActivityBadge type={item.activityType} />
            <span className="text-xs" style={{ color: 'rgba(245,240,232,0.35)' }}>{item.time}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs" style={{ color: '#7A9E7E' }}>{item.club}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <TypeIcon type={item.contentType} size={13} />
        <span className="font-semibold text-sm leading-tight font-display" style={{ color: '#F5F0E8' }}>
          {item.title}
        </span>
        {item.rating != null && <Stars rating={item.rating} size={11} />}
      </div>

      {item.note && (
        <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'rgba(245,240,232,0.55)' }}>
          {item.note}
        </p>
      )}

      <div className="flex items-center gap-5 pt-2.5 border-t border-white/5">
        <button onClick={() => setLiked(l => !l)}
          className="flex items-center gap-1.5 text-sm transition-colors duration-100"
          aria-label="Like">
          <Heart size={13}
            fill={liked ? '#E8A020' : 'none'}
            color={liked ? '#E8A020' : 'rgba(255,255,255,0.3)'} />
          <span style={{ color: liked ? '#E8A020' : 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            {item.likes + (liked ? 1 : 0)}
          </span>
        </button>
        <button className="flex items-center gap-1.5 text-sm" aria-label="Comments"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          <MessageCircle size={13} />
          <span style={{ fontSize: 13 }}>{item.comments}</span>
        </button>
      </div>
    </div>
  )
}

function GlobalFeed() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 600); return () => clearTimeout(t) }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#F5F0E8' }}>What everyone's into</h1>
        <p className="text-sm" style={{ color: 'rgba(245,240,232,0.45)' }}>Activity across all your clubs</p>
      </div>
      <div className="space-y-3 fade-up">
        {!loaded
          ? [1,2,3].map(i => <SkeletonCard key={i} />)
          : FEED.map(item => <FeedCard key={item.id} item={item} />)
        }
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// CLUB DETAIL — sub-tabs
// ════════════════════════════════════════════════════════

function DiscussionTab({ club }) {
  const [expanded, setExpanded] = useState(null)
  return (
    <div className="space-y-3">
      <button className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
        style={{ background: club.accent + '22', color: club.accent, border: `1px solid ${club.accent}44` }}>
        <Plus size={14} /> New Discussion
      </button>
      {club.discussions.map(d => (
        <div key={d.id} className="rounded-xl border border-white/8 overflow-hidden" style={{ background: '#0F1923' }}>
          <div className="p-4">
            <div className="flex items-start gap-3 mb-2">
              <Avatar initials={d.user.initials} color={d.user.color} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'rgba(245,240,232,0.7)' }}>{d.user.name}</span>
                  <span className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>{d.time}</span>
                </div>
                <h4 className="font-semibold text-sm mt-1 leading-snug font-display" style={{ color: '#F5F0E8' }}>{d.title}</h4>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(245,240,232,0.55)' }}>{d.body}</p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Heart size={11} /> {d.likes}
              </button>
              <button onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                className="flex items-center gap-1.5 text-xs transition-colors hover:text-white/60"
                style={{ color: expanded === d.id ? club.accent : 'rgba(255,255,255,0.35)' }}>
                <MessageCircle size={11} /> {d.replies.length} {d.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            </div>
          </div>
          {expanded === d.id && d.replies.length > 0 && (
            <div className="border-t border-white/6" style={{ background: '#162030' }}>
              {d.replies.map((r, i) => (
                <div key={i} className="flex gap-3 p-3 border-b border-white/5 last:border-0">
                  <Avatar initials={r.user.initials} color={r.user.color} size="xs" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium" style={{ color: 'rgba(245,240,232,0.7)' }}>{r.user.name}</span>
                      <span className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>{r.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ChatTab({ club }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView() }, [])
  return (
    <div className="flex flex-col" style={{ minHeight: 300 }}>
      <div className="flex-1 space-y-3 pb-4">
        {club.chat.map((msg, i) => {
          const isMe = msg.user.id === 1
          return (
            <div key={i} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <Avatar initials={msg.user.initials} color={msg.user.color} size="xs" />}
              <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-xs mb-1 ml-1" style={{ color: 'rgba(245,240,232,0.4)' }}>{msg.user.name}</span>
                )}
                <div className="px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMe ? '#E8A020' : 'rgba(255,255,255,0.08)',
                    color: isMe ? '#0F1923' : '#F5F0E8',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontWeight: isMe ? 500 : 400,
                  }}>
                  {msg.text}
                </div>
                <span className={`text-xs mt-1 ${isMe ? 'mr-1' : 'ml-1'}`} style={{ color: 'rgba(245,240,232,0.3)' }}>
                  {msg.time}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <input type="text" placeholder="Send a message…"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F0E8', border: '1px solid rgba(255,255,255,0.1)' }}
          readOnly />
        <button className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#E8A020', color: '#0F1923' }}>
          Send
        </button>
      </div>
    </div>
  )
}

function MembersTab({ club }) {
  return (
    <div className="space-y-3">
      {club.memberDetails.map((m, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5" style={{ background: '#0F1923' }}>
          <Avatar initials={m.user.initials} color={m.user.color} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium" style={{ color: '#F5F0E8' }}>{m.user.name}</span>
              <span className="text-xs" style={{ color: club.accent }}>{m.progress}%</span>
            </div>
            <ProgressBar pct={m.progress} color={club.accent} height={3} />
            <span className="text-xs mt-1 block" style={{ color: 'rgba(245,240,232,0.35)' }}>Last active {m.lastActive}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function PastItemsTab({ club }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {club.pastItems.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-white/5 hover:border-white/12 transition-all duration-150 cursor-pointer"
          style={{ background: item.color }}>
          <div className="h-20 flex items-end p-3" style={{ background: item.color }}>
            <TypeIcon type={item.type} size={16} />
          </div>
          <div className="p-3" style={{ background: '#162030' }}>
            <p className="text-xs font-semibold font-display leading-tight mb-2" style={{ color: '#F5F0E8' }}>{item.title}</p>
            <Stars rating={item.rating} size={10} />
            <span className="text-xs mt-1 block" style={{ color: 'rgba(245,240,232,0.4)' }}>{item.rating} / 5</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ClubDetail({ club, onBack }) {
  const [subTab, setSubTab] = useState('discussion')
  const tabs = [
    { id: 'discussion', label: 'Discussion', icon: <MessageSquare size={13} /> },
    { id: 'chat',       label: 'Chat',       icon: <MessageCircle size={13} /> },
    { id: 'members',    label: 'Members',    icon: <Users size={13} /> },
    { id: 'past',       label: 'Past',       icon: <Clock size={13} /> },
  ]

  return (
    <div className="fade-up">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-opacity"
        style={{ color: 'rgba(245,240,232,0.5)' }}>
        <ArrowLeft size={14} /> Back to clubs
      </button>

      {/* Header */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: club.bg, border: `1px solid ${club.accent}30` }}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TypeIcon type={club.type} size={15} />
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: club.accent }}>
                  {club.type} club
                </span>
              </div>
              <h2 className="text-xl font-bold font-display" style={{ color: '#F5F0E8' }}>{club.name}</h2>
            </div>
            <div className="flex -space-x-2">
              {club.memberIds.slice(0, 4).map(id => {
                const u = USERS.find(u => u.id === id)
                return u ? <div key={id} className="ring-2" style={{ borderRadius: '50%', borderColor: club.bg }}>
                  <Avatar initials={u.initials} color={u.color} size="xs" />
                </div> : null
              })}
              {club.members > 4 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] ring-2 font-medium"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(245,240,232,0.7)', borderColor: club.bg }}>
                  +{club.members - 4}
                </div>
              )}
            </div>
          </div>

          {/* Current item */}
          <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex gap-4">
              <div className="w-14 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: club.currentItem.coverBg }}>
                <TypeIcon type={club.type} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs uppercase tracking-wide font-medium" style={{ color: club.accent }}>
                  Now {club.type === 'podcast' ? 'listening' : club.type === 'film' ? 'watching' : club.type === 'game' ? 'playing' : 'reading'}
                </span>
                <h3 className="font-bold font-display text-base leading-snug mt-0.5 mb-0.5" style={{ color: '#F5F0E8' }}>
                  {club.currentItem.title}
                </h3>
                <p className="text-xs mb-2" style={{ color: 'rgba(245,240,232,0.5)' }}>{club.currentItem.subtitle}</p>
                <div className="flex items-center gap-2">
                  <ProgressBar pct={club.currentItem.progress} color={club.accent} height={3} />
                  <span className="text-xs flex-shrink-0" style={{ color: club.accent }}>
                    {club.currentItem.progress}%
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(245,240,232,0.35)' }}>group average</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed mt-3" style={{ color: 'rgba(245,240,232,0.45)' }}>
              {club.currentItem.description}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,232,0.45)' }}>
              <Clock size={11} /> Next meetup: <span style={{ color: club.accent }}>{club.nextMeetup}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,232,0.45)' }}>
              <Users size={11} /> {club.members} members
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: '#162030' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: subTab === t.id ? club.accent : 'transparent',
              color: subTab === t.id ? '#0F1923' : 'rgba(245,240,232,0.45)',
            }}>
            {t.icon} <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="fade-up">
        {subTab === 'discussion' && <DiscussionTab club={club} />}
        {subTab === 'chat'       && <ChatTab club={club} />}
        {subTab === 'members'    && <MembersTab club={club} />}
        {subTab === 'past'       && <PastItemsTab club={club} />}
      </div>
    </div>
  )
}

function ClubCard({ club, onClick }) {
  const typeLabel = { book: 'Book Club', film: 'Film Club', podcast: 'Podcast Club', game: 'Games Club' }
  return (
    <div onClick={onClick}
      className="rounded-2xl overflow-hidden border cursor-pointer transition-all duration-150 hover:-translate-y-1"
      style={{ background: club.bg, border: `1px solid ${club.accent}25` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = club.accent + '55'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = club.accent + '25'; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TypeIcon type={club.type} size={12} />
              <span className="text-xs uppercase tracking-wide font-medium" style={{ color: club.accent }}>
                {typeLabel[club.type]}
              </span>
            </div>
            <h3 className="font-bold font-display text-base leading-snug" style={{ color: '#F5F0E8' }}>{club.name}</h3>
            <span className="text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>{club.members} members</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ProgressRing pct={club.currentItem.progress} size={44} color={club.accent} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold" style={{ color: club.accent }}>
                  {club.currentItem.progress}%
                </span>
              </div>
            </div>
            <span className="text-[9px] mt-0.5" style={{ color: 'rgba(245,240,232,0.35)' }}>avg</span>
          </div>
        </div>

        <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
            {club.type === 'podcast' ? 'Now listening' : club.type === 'film' ? 'Now watching' : club.type === 'game' ? 'Now playing' : 'Now reading'}
          </p>
          <p className="text-sm font-semibold font-display leading-snug" style={{ color: '#F5F0E8' }}>
            {club.currentItem.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.45)' }}>{club.currentItem.subtitle}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
            <Clock size={11} /> <span>Next meetup <span style={{ color: club.accent }}>{club.nextMeetup}</span></span>
          </div>
          {club.unread > 0 && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: '#E8A020', color: '#0F1923' }}>
              {club.unread}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MyClubs() {
  const [selected, setSelected] = useState(null)
  if (selected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ClubDetail club={selected} onBack={() => setSelected(null)} />
      </div>
    )
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#F5F0E8' }}>My Clubs</h1>
          <p className="text-sm" style={{ color: 'rgba(245,240,232,0.45)' }}>4 active clubs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: '#E8A020', color: '#0F1923' }}>
          <Plus size={14} /> New Club
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-up">
        {CLUBS.map(club => (
          <ClubCard key={club.id} club={club} onClick={() => setSelected(club)} />
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// RECOMMENDATIONS
// ════════════════════════════════════════════════════════

function RecCard({ item }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="relative rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-150"
      style={{ width: 150, background: item.coverBg, border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="h-24 flex items-center justify-center">
        <TypeIcon type={item.type} size={24} />
      </div>
      <div className="p-3" style={{ background: '#162030' }}>
        <p className="text-xs font-semibold font-display leading-snug mb-0.5 line-clamp-2" style={{ color: '#F5F0E8' }}>
          {item.title}
        </p>
        <p className="text-[11px] mb-1.5 truncate" style={{ color: 'rgba(245,240,232,0.45)' }}>{item.sub}</p>
        <div className="flex items-center gap-1">
          <Stars rating={item.rating} size={9} />
          <span className="text-[10px]" style={{ color: '#E8A020' }}>{item.rating}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-1.5 inline-block"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(245,240,232,0.5)' }}>
          {item.genre}
        </span>
      </div>
      {hovered && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(15,25,35,0.85)' }}>
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: '#E8A020', color: '#0F1923' }}>
            + Add to Club
          </button>
        </div>
      )}
    </div>
  )
}

function Recommendations() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#F5F0E8' }}>For You</h1>
        <p className="text-sm" style={{ color: 'rgba(245,240,232,0.45)' }}>Picks based on your clubs and taste</p>
      </div>

      {/* Featured */}
      <div className="rounded-2xl overflow-hidden mb-8 border border-white/5"
        style={{ background: RECS.featured.coverBg }}>
        <div className="p-6 sm:flex gap-6">
          <div className="w-full sm:w-40 h-40 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 sm:mb-0"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <TypeIcon type={RECS.featured.type} size={40} />
          </div>
          <div className="flex-1">
            <span className="text-xs uppercase tracking-widest font-medium px-2.5 py-1 rounded-full"
              style={{ background: '#E8A02022', color: '#E8A020' }}>
              Picked for you
            </span>
            <h2 className="text-2xl font-bold font-display mt-2 mb-1" style={{ color: '#F5F0E8' }}>{RECS.featured.title}</h2>
            <p className="text-sm mb-1" style={{ color: 'rgba(245,240,232,0.55)' }}>{RECS.featured.author}</p>
            <div className="flex items-center gap-2 mb-3">
              <Stars rating={RECS.featured.rating} size={12} />
              <span className="text-sm" style={{ color: '#E8A020' }}>{RECS.featured.rating}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(245,240,232,0.5)' }}>
                {RECS.featured.genre}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.6)' }}>
              {RECS.featured.description}
            </p>
            <button className="px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ background: '#E8A020', color: '#0F1923' }}>
              Add to a Club
            </button>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-8 fade-up">
        {RECS.rows.map((row, i) => (
          <div key={i}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgba(245,240,232,0.7)' }}>{row.label}</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {row.items.map((item, j) => <RecCard key={j} item={item} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════════════════════════

const MEDAL_COLORS = ['#D4AF37', '#A8A9AD', '#CD7F32']
const MEDAL_LABELS = ['🥇', '🥈', '🥉']

function PodiumCard({ entry, rank }) {
  const heights = [130, 100, 80]
  const color = MEDAL_COLORS[rank - 1]
  return (
    <div className="flex flex-col items-center" style={{ width: 110 }}>
      <Avatar initials={entry.user.initials} color={entry.user.color} size="lg" />
      <div className="mt-2 mb-1 text-center">
        <p className="text-xs font-semibold" style={{ color: '#F5F0E8' }}>{entry.user.name.split(' ')[0]}</p>
        <p className="text-[10px]" style={{ color: 'rgba(245,240,232,0.4)' }}>{entry.pts.toLocaleString()} pts</p>
      </div>
      <div className="w-full rounded-t-xl flex flex-col items-center justify-start pt-2"
        style={{ height: heights[rank - 1], background: color + '22', border: `1px solid ${color}44`, borderBottom: 'none' }}>
        <span className="text-xl">{MEDAL_LABELS[rank - 1]}</span>
        <span className="text-sm font-bold mt-1" style={{ color }}>#{rank}</span>
      </div>
    </div>
  )
}

function LeaderRow({ entry, isMe }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-100 ${isMe ? 'border-amber-500/30' : 'border-white/5 hover:border-white/10'}`}
      style={{ background: isMe ? 'rgba(232,160,32,0.08)' : '#162030' }}>
      <div className="w-7 text-center font-bold text-sm" style={{ color: entry.rank <= 3 ? MEDAL_COLORS[entry.rank-1] : 'rgba(245,240,232,0.4)' }}>
        {entry.rank}
      </div>
      <Avatar initials={entry.user.initials} color={entry.user.color} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: isMe ? '#E8A020' : '#F5F0E8' }}>
          {entry.user.name}{isMe && ' (you)'}
        </p>
        <p className="text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>{entry.club}</p>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>
        <div className="text-center">
          <div className="font-bold" style={{ color: '#F5F0E8' }}>{entry.completed}</div>
          <div>items</div>
        </div>
        <div className="text-center">
          <div className="font-bold" style={{ color: '#F5F0E8' }}>{entry.discussions}</div>
          <div>posts</div>
        </div>
        <div className="text-center flex items-center gap-0.5">
          <span className="font-bold" style={{ color: '#E87060' }}>{entry.streak}</span>
          <Flame size={11} style={{ color: '#E87060' }} />
        </div>
      </div>
      <div className="font-bold text-sm" style={{ color: '#E8A020' }}>
        {entry.pts.toLocaleString()}
      </div>
    </div>
  )
}

function Leaderboard() {
  const [period, setPeriod] = useState('month')
  const myEntry = LEADERBOARD.find(e => e.user.id === 1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#F5F0E8' }}>Leaderboard</h1>
          <p className="text-sm" style={{ color: 'rgba(245,240,232,0.45)' }}>Who's most active across all clubs</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#162030' }}>
          {['month', 'alltime'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: period === p ? '#E8A020' : 'transparent',
                color: period === p ? '#0F1923' : 'rgba(245,240,232,0.5)',
              }}>
              {p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Points key */}
      <div className="rounded-xl p-3 mb-6 flex flex-wrap gap-3" style={{ background: '#162030', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-xs font-medium" style={{ color: 'rgba(245,240,232,0.5)' }}>How points work:</span>
        {[['Finish item','50 pts'], ['Start discussion','20 pts'], ['Rate item','10 pts'], ['Reply','5 pts']].map(([label, pts]) => (
          <span key={label} className="text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
            {label} <span style={{ color: '#E8A020' }}>{pts}</span>
          </span>
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 mb-8">
        <PodiumCard entry={LEADERBOARD[1]} rank={2} />
        <PodiumCard entry={LEADERBOARD[0]} rank={1} />
        <PodiumCard entry={LEADERBOARD[2]} rank={3} />
      </div>

      {/* Table */}
      <div className="space-y-2 fade-up">
        {LEADERBOARD.map(entry => (
          <LeaderRow key={entry.rank} entry={entry} isMe={entry.user.id === 1} />
        ))}
      </div>

      {/* Your rank nudge */}
      {myEntry && (
        <div className="mt-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)' }}>
          <Zap size={16} style={{ color: '#E8A020', flexShrink: 0 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#E8A020' }}>You're ranked #{myEntry.rank}</p>
            <p className="text-xs" style={{ color: 'rgba(245,240,232,0.55)' }}>
              {LEADERBOARD[myEntry.rank - 2].pts - myEntry.pts} more points and you move up to #{myEntry.rank - 1}!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════

function MonthlyBarChart({ data }) {
  const maxTotal = Math.max(...data.map(d => d.books + d.films + d.podcasts + d.games))
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {data.map((m, i) => {
          const total = m.books + m.films + m.podcasts + m.games
          const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: 108 }}>
                {total > 0 && (
                  <div className="w-full overflow-hidden rounded-sm" style={{ height: `${pct}%`, minHeight: 4 }}>
                    {m.games    > 0 && <div style={{ height: `${(m.games/total)*100}%`,    background: '#9B6DB5', minHeight: 2 }} />}
                    {m.podcasts > 0 && <div style={{ height: `${(m.podcasts/total)*100}%`, background: '#7A9E7E', minHeight: 2 }} />}
                    {m.films    > 0 && <div style={{ height: `${(m.films/total)*100}%`,    background: '#6B8DD6', minHeight: 2 }} />}
                    {m.books    > 0 && <div style={{ height: `${(m.books/total)*100}%`,    background: '#C47D5A', minHeight: 2 }} />}
                  </div>
                )}
                {total === 0 && (
                  <div className="w-full rounded-sm" style={{ height: 3, background: 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
              <span className="text-[10px]" style={{ color: 'rgba(245,240,232,0.35)' }}>{m.month}</span>
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-3">
        {[['Books','#C47D5A'],['Films','#6B8DD6'],['Podcasts','#7A9E7E'],['Games','#9B6DB5']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
            <span className="text-[11px]" style={{ color: 'rgba(245,240,232,0.45)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ data }) {
  let cum = 0
  const segments = data.map(d => {
    const start = cum; cum += d.pct
    return { ...d, start, end: cum }
  })
  const gradient = segments.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ')
  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
        <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
        <div className="absolute rounded-full" style={{ inset: 18, background: '#0F1923' }} />
      </div>
      <div className="space-y-2">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs" style={{ color: 'rgba(245,240,232,0.7)' }}>{d.label}</span>
            <span className="text-xs font-bold ml-auto pl-4" style={{ color: d.color }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityHeatmap() {
  const seed = 42
  const data = useMemo(() => {
    let rng = seed
    const next = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff }
    return Array.from({ length: 364 }, () => {
      const r = next()
      if (r < 0.45) return 0
      if (r < 0.65) return 1
      if (r < 0.80) return 2
      if (r < 0.92) return 3
      return 4
    })
  }, [])

  const intensities = ['rgba(255,255,255,0.04)', '#1E4A28', '#2A6E38', '#3A9650', '#7A9E7E']
  const days = ['M', '', 'W', '', 'F', '', '']

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
          {days.map((d, i) => (
            <div key={i} className="text-[8px] flex items-center justify-end" style={{ height: 9, color: 'rgba(245,240,232,0.3)' }}>
              {d}
            </div>
          ))}
        </div>
        {/* Grid: 52 cols × 7 rows */}
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: 52 }, (_, week) => (
            <div key={week} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }, (_, day) => {
                const idx = week * 7 + day
                const val = idx < data.length ? data[idx] : 0
                return (
                  <div key={day} className="rounded-[2px]"
                    style={{ width: 9, height: 9, background: intensities[val] }}
                    title={`${val} activities`} />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px]" style={{ color: 'rgba(245,240,232,0.35)' }}>Less</span>
        {intensities.map((c, i) => (
          <div key={i} className="rounded-[2px]" style={{ width: 9, height: 9, background: c }} />
        ))}
        <span className="text-[10px]" style={{ color: 'rgba(245,240,232,0.35)' }}>More</span>
      </div>
    </div>
  )
}

function Analytics() {
  const { summary, monthly, types, genres, recentRatings } = ANALYTICS
  const maxGenre = Math.max(...genres.map(g => g.count))

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#F5F0E8' }}>Your Stats</h1>
        <p className="text-sm" style={{ color: 'rgba(245,240,232,0.45)' }}>A look at 2025 so far, Alex</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Items finished', value: summary.finished, color: '#E8A020',  icon: <Check size={15} /> },
          { label: 'Clubs joined',   value: summary.clubs,    color: '#7A9E7E',  icon: <Users size={15} /> },
          { label: 'Discussions',    value: summary.discussions,color:'#6B8DD6', icon: <MessageSquare size={15} /> },
          { label: 'Day streak',     value: `${summary.streak}🔥`,color:'#E87060',icon: <Flame size={15} /> },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-4 border border-white/5" style={{ background: '#162030' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: card.color }}>
              {card.icon}
              <span className="text-xs font-medium" style={{ color: 'rgba(245,240,232,0.5)' }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold font-display" style={{ color: '#F5F0E8' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Monthly bar chart */}
        <div className="rounded-xl p-4 border border-white/5" style={{ background: '#162030' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#F5F0E8' }}>Monthly activity</h3>
          <MonthlyBarChart data={monthly} />
        </div>

        {/* Donut */}
        <div className="rounded-xl p-4 border border-white/5" style={{ background: '#162030' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#F5F0E8' }}>By media type</h3>
          <DonutChart data={types} />
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl p-4 border border-white/5 mb-4" style={{ background: '#162030' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#F5F0E8' }}>Activity heatmap</h3>
        <ActivityHeatmap />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top genres */}
        <div className="rounded-xl p-4 border border-white/5" style={{ background: '#162030' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#F5F0E8' }}>Top genres</h3>
          <div className="space-y-3">
            {genres.map((g, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'rgba(245,240,232,0.65)' }}>{g.genre}</span>
                  <span className="text-xs font-medium" style={{ color: '#E8A020' }}>{g.count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full progress-fill"
                    style={{ width: `${(g.count / maxGenre) * 100}%`, background: '#E8A020' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent ratings */}
        <div className="rounded-xl p-4 border border-white/5" style={{ background: '#162030' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#F5F0E8' }}>Recent ratings</h3>
          <div className="space-y-3">
            {recentRatings.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <TypeIcon type={r.type} size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#F5F0E8' }}>{r.title}</p>
                  <Stars rating={r.rating} size={10} />
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color: '#E8A020' }}>{r.rating}/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════

function Profile() {
  const shelfColors = ['#2A3A20','#1A2A40','#3A1A20','#201A3A','#2A2A10','#10252A']
  const typeColors  = { book: '#C47D5A', film: '#6B8DD6', podcast: '#7A9E7E', game: '#9B6DB5' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-2xl p-6 mb-4 border border-white/5" style={{ background: '#162030' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full flex items-center justify-center font-bold text-2xl"
              style={{ width: 72, height: 72, background: ME.color + '28', color: ME.color, border: `2px solid ${ME.color}55` }}>
              {ME.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold font-display" style={{ color: '#F5F0E8' }}>{ME.name}</h2>
              <p className="text-sm mb-1" style={{ color: 'rgba(245,240,232,0.45)' }}>{ME.username}</p>
              <p className="text-xs" style={{ color: 'rgba(245,240,232,0.35)' }}>Member since {ME.memberSince}</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(245,240,232,0.6)' }}>
            <Settings size={12} /> Edit
          </button>
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.6)' }}>{ME.bio}</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Finished',  value: ME.stats.finished  },
            { label: 'Clubs',     value: ME.stats.clubs     },
            { label: 'Following', value: ME.stats.following },
            { label: 'Followers', value: ME.stats.followers },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold font-display" style={{ color: '#F5F0E8' }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: 'rgba(245,240,232,0.4)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Club badges */}
      <div className="rounded-xl p-4 border border-white/5 mb-4" style={{ background: '#162030' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#F5F0E8' }}>Clubs</h3>
        <div className="flex flex-wrap gap-2">
          {CLUBS.map(club => (
            <div key={club.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: club.accent + '18', border: `1px solid ${club.accent}35` }}>
              <TypeIcon type={club.type} size={11} />
              <span className="text-xs font-medium" style={{ color: club.accent }}>{club.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings shelf */}
      <div className="rounded-xl p-4 border border-white/5 mb-4" style={{ background: '#162030' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#F5F0E8' }}>Ratings shelf</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ANALYTICS.recentRatings.map((r, i) => (
            <div key={i} className="flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
              style={{ width: 60, background: shelfColors[i % shelfColors.length], border: `1px solid rgba(255,255,255,0.06)` }}>
              <div className="flex flex-col h-full p-2 justify-between" style={{ minHeight: 90 }}>
                <TypeIcon type={r.type} size={12} />
                <div>
                  <p className="text-[9px] font-semibold leading-tight mb-1" style={{ color: 'rgba(245,240,232,0.8)' }}>
                    {r.title.length > 18 ? r.title.slice(0, 18) + '…' : r.title}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <Star size={8} fill="#E8A020" color="#E8A020" />
                    <span className="text-[9px] font-bold" style={{ color: '#E8A020' }}>{r.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#F5F0E8' }}>Recent activity</h3>
        <div className="space-y-3">
          {PROFILE_FEED.length > 0
            ? PROFILE_FEED.map(item => <FeedCard key={item.id} item={item} />)
            : (
              <div className="rounded-xl p-8 text-center border border-white/5" style={{ background: '#162030' }}>
                <Coffee size={28} className="mx-auto mb-2" style={{ color: 'rgba(245,240,232,0.2)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'rgba(245,240,232,0.5)' }}>No activity yet</p>
                <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>Join a club to start logging your activity.</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════

const TABS = [
  { id: 'feed',    label: 'Feed',     icon: Home },
  { id: 'clubs',   label: 'Clubs',    icon: Layers },
  { id: 'recs',    label: 'Discover', icon: Compass },
  { id: 'board',   label: 'Ranks',    icon: Trophy },
  { id: 'stats',   label: 'Stats',    icon: BarChart2 },
  { id: 'profile', label: 'Profile',  icon: User },
]

function NavBar({ active, setActive }) {
  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden sm:flex items-center justify-between px-6 py-3 sticky top-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(15,25,35,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: '#E8A020', color: '#0F1923' }}>F</div>
          <span className="font-bold font-display text-base tracking-tight" style={{ color: '#F5F0E8' }}>Folio</span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = active === tab.id
            return (
              <button key={tab.id} onClick={() => setActive(tab.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(232,160,32,0.12)' : 'transparent',
                  color: isActive ? '#E8A020' : 'rgba(245,240,232,0.45)',
                }}>
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors" aria-label="Notifications">
            <Bell size={16} style={{ color: 'rgba(245,240,232,0.55)' }} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot"
              style={{ background: '#E8A020' }} />
          </button>
          <div className="cursor-pointer" style={{ borderRadius: '50%' }}>
            <Avatar initials={ME.initials} color={ME.color} size="sm" />
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 flex border-t border-white/8"
        style={{ background: 'rgba(15,25,35,0.95)', backdropFilter: 'blur(16px)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors duration-150"
              style={{ color: isActive ? '#E8A020' : 'rgba(245,240,232,0.35)' }}
              aria-label={tab.label}>
              <Icon size={18} />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

// ════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════

export default function App() {
  const [tab, setTab] = useState('feed')

  const screens = {
    feed:    <GlobalFeed />,
    clubs:   <MyClubs />,
    recs:    <Recommendations />,
    board:   <Leaderboard />,
    stats:   <Analytics />,
    profile: <Profile />,
  }

  return (
    <div className="min-h-screen" style={{ background: '#0F1923' }}>
      <NavBar active={tab} setActive={t => setTab(t)} />
      <main className="pb-20 sm:pb-8 fade-up" key={tab}>
        {screens[tab]}
      </main>
    </div>
  )
}
