# Hobbyist

[![CI](https://github.com/saad-r10/hobbyist/actions/workflows/ci.yml/badge.svg)](https://github.com/saad-r10/hobbyist/actions/workflows/ci.yml)

A fully functional hobbyist club platform — where people host and join clubs around shared media. Think Goodreads meets Letterboxd meets Discord, purpose-built for small group clubs.

## Features

**Authentication & Accounts**
- Register with email + username
- Secure login with JWT (access + refresh tokens via httpOnly cookie)
- Password reset via email token
- 4-step onboarding flow with media interest selection

**6 fully interactive tabs:**
- **Feed** — Global activity stream from clubmates (real DB data)
- **Clubs** — Dashboard of your clubs; click through to full Club Detail with 4 sub-tabs:
  - *Discussion* — Threaded posts with live replies and like toggle
  - *Chat* — Real-time-style messaging with optimistic updates
  - *Members* — Progress bars per member on the current item
  - *Past Items* — Grid of finished items with averaged ratings
- **Discover** — Personalised recommendations based on your interests
- **Ranks** — Leaderboard with podium visual, streaks, and your rank nudge
- **Stats** — Personal analytics: bar chart, donut chart, 52×7 heatmap, recent ratings
- **Profile** — Edit your bio/name, view your ratings shelf and interests

**Club management:**
- Create public or private clubs (book / film / podcast / game)
- Admins set the current item; any member can update their progress (0–100%)
- Rate any item (1–5 stars with optional review)
- Discussion posts + replies, chat messages — all persisted to the database

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Lucide React, React Router v7 |
| Backend | Express.js, Prisma ORM |
| Database | SQLite (via `server/prisma/dev.db`) |
| Auth | JWT (access + refresh), bcryptjs |
| Build | Vite 8 |

## Getting started

```bash
git clone https://github.com/saad-r10/hobbyist.git
cd hobbyist

# Install frontend deps
npm install

# Install backend deps and set up database
cd server
npm install
npx prisma db push
node prisma/seed.js
cd ..

# Run both servers concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Demo credentials:** `alex@hobbyist.app` / `password123`  
All 8 seeded users use the same password.

## Project structure

```
├── src/                   # React frontend
│   ├── api/client.js      # API client with token refresh
│   ├── contexts/          # AuthContext
│   ├── pages/             # Login, Register, Onboarding, ResetPassword
│   └── App.jsx            # All tab components (Feed, Clubs, Discover, Ranks, Stats, Profile)
└── server/
    ├── prisma/
    │   ├── schema.prisma  # Database schema
    │   └── seed.js        # Demo data seeder
    └── src/
        ├── routes/        # auth, clubs, posts, chat, feed, discover, leaderboard, analytics
        └── middleware/    # JWT auth, error handler
```

## Design tokens

| Token | Value |
|---|---|
| Background | `#0F1923` deep navy |
| Surface | `#162030` |
| Primary accent | `#E8A020` amber/saffron |
| Secondary accent | `#7A9E7E` sage green |
| Text | `#F5F0E8` warm off-white |

Typography: Playfair Display (headings) · DM Sans (UI)

## Next steps

- WebSocket / SSE for real-time chat (currently polling on navigation)
- Email delivery for password reset (currently logged to console)
- Image uploads for avatars and cover art
- Club invites and join requests for private clubs
- Push notifications for club activity
