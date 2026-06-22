# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This file governs all development on the Hobbyist repository. Every AI-assisted change must follow these procedures.

---

## Project Overview

**Hobbyist** is a hobbyist club platform where users track books, films, games, and podcasts together in small, focused clubs.

| Layer       | Tech                                    |
|-------------|----------------------------------------|
| Frontend    | React 19, Tailwind CSS v4, React Router v7 |
| Backend     | Express.js, Prisma ORM, SQLite         |
| Auth        | JWT (access + refresh tokens), bcryptjs |
| Build       | Vite 8, concurrently                   |
| Deploy      | GitHub Pages (demo), self-hosted (full) |

---

## Mandatory Workflow

### Before writing a single line of code

1. **Verify a GitHub issue exists** for the work.  
   If none exists: create one at https://github.com/saad-r10/hobbyist/issues/new  
   Never implement undocumented features.

2. **Create a branch** from `dev` (never from `main`):
   ```bash
   git checkout dev && git pull
   git checkout -b issue-{N}-{short-description}
   ```
   Examples: `issue-3-search-system`, `issue-2-profile-nav-bug`

3. **Never commit directly to `main` or `dev`.**

---

## Branch Naming Convention

```
issue-{github-issue-number}-{kebab-case-description}
```

| Good ✅                          | Bad ❌              |
|----------------------------------|---------------------|
| `issue-3-search-system`          | `feature/search`    |
| `issue-2-profile-nav-bug`        | `fix-nav`           |
| `issue-5-rate-limiting`          | `security-stuff`    |

---

## Development Commands

```bash
# Start everything (backend + frontend)
npm run dev

# Frontend only
npx vite

# Backend only (production-like, no watch)
npm run server

# Backend with auto-reload (development)
npm run server:dev

# Run frontend tests
npm test

# Run server tests
npm run test:server

# Reset and reseed the database
npm run db:reset

# Open Prisma Studio (GUI for the database)
cd server && npx prisma studio

# Build demo (for GitHub Pages)
npm run build:demo

# Deploy to GitHub Pages
npm run deploy
```

---

## Commit Guidelines

- Small, atomic commits — one logical change per commit
- Format: `type: short description` (imperative, lowercase)
- Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

```bash
# Good
git commit -m "feat: add debounced search modal with keyboard navigation"
git commit -m "fix: profile avatar not clickable in desktop nav"

# Bad
git commit -m "changes"
git commit -m "WIP"
```

---

## Pull Request Requirements

Every PR must:

1. Reference the issue: `Closes #N` in the PR body
2. Pass CI (lint + build + server health check)
3. Include a brief description of what changed and why
4. Not manually close issues — the `Closes #N` link handles this on merge

**Never merge a PR that:**
- Has failing CI
- Is missing `Closes #N`
- Was committed directly to `main` or `dev`

---

## Architecture

### Directory structure

```
hobbyist/
├── src/                    # React frontend
│   ├── api/
│   │   ├── client.js       # API client + token refresh + demo intercept
│   │   └── demo.js         # Mock handlers for GitHub Pages demo mode
│   ├── components/         # Shared UI components
│   │   ├── AuthLayout.jsx  # Shared split-panel wrapper for auth pages
│   │   ├── ImportModal.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── SearchModal.jsx
│   │   └── Sidebar.jsx     # Desktop sidebar navigation
│   ├── contexts/
│   │   ├── AuthContext.jsx  # Login state + token management
│   │   └── ThemeContext.jsx # Light/dark theme
│   ├── pages/              # Route-level pages (auth flows)
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Onboarding.jsx
│   │   └── ResetPassword.jsx
│   ├── utils/
│   │   └── csvParsers.js   # Goodreads/Letterboxd CSV import parsers
│   ├── App.jsx             # Main app + all 6 tab components
│   ├── main.jsx            # Router + providers
│   └── index.css           # Design tokens + global styles
├── server/
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Demo data seeder
│   └── src/
│       ├── lib/
│       │   └── notifications.js  # Notification creation helpers
│       ├── middleware/
│       │   ├── auth.js           # JWT verification
│       │   └── errorHandler.js
│       ├── routes/               # One file per resource
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── clubs.js
│       │   ├── posts.js
│       │   ├── chat.js
│       │   ├── feed.js
│       │   ├── discover.js
│       │   ├── leaderboard.js
│       │   ├── analytics.js
│       │   ├── import.js
│       │   ├── search.js
│       │   ├── notifications.js
│       │   ├── coverArt.js
│       │   └── achievements.js
│       ├── services/
│       │   └── coverArt.js       # Open Library / TMDB / IGDB API calls
│       ├── app.js                # Express app (exported for tests)
│       └── index.js              # Server entry point (calls app.listen)
├── .github/workflows/ci.yml
├── .claude/                # Claude operating procedures
├── .env.example
├── CLAUDE.md               # ← this file
└── WEBFLOW.md              # App flow diagrams
```

### Key design decisions

- **Single `App.jsx`** — all 6 tab components in one file for simplicity. Extract only when it exceeds maintainability.
- **Demo mode** (`VITE_DEMO_MODE=true`) — bakes mock data into the bundle for static hosting (GitHub Pages). All API calls are intercepted in `src/api/client.js` and routed to handlers in `src/api/demo.js` instead of hitting the server.
- **Auth token storage** — the access token lives in a module-level variable in `src/api/client.js` (cleared on page reload). The refresh token is stored in an httpOnly cookie and used by `POST /api/auth/refresh` to issue a new access token. All `api()` calls automatically retry once after a 401.
- **SQLite** — simple, zero-config for local dev. Migrate to PostgreSQL when deploying to a persistent host.
- **No chart libraries** — all data visualizations built with CSS/SVG to keep bundle size down.
- **Production single-process deploy** — in `NODE_ENV=production`, the Express server serves the compiled frontend from `dist/` directly, so only one process needs to run. The `CLIENT_ORIGIN` env var controls the CORS allow-list.

---

## Design System

### Tokens (CSS custom properties)

| Token              | Dark value     | Light value    | Usage                            |
|--------------------|----------------|----------------|----------------------------------|
| `--bg`             | `#0F1923`      | `#F0E6D3`      | Page background                  |
| `--surface`        | `#162030`      | `#EDE0C4`      | Card / panel surfaces            |
| `--surface2`       | `#1e2d40`      | `#E5D4B0`      | Hover states, inputs             |
| `--text`           | `#F5F0E8`      | `#2C1810`      | Primary text                     |
| `--text-dim`       | 50% opacity    | 55% opacity    | Secondary text                   |
| `--accent`         | `#E8A020`      | `#B87412`      | Amber — primary action           |
| `--accent2`        | `#3DBFBD`      | `#1A8E8C`      | Teal — secondary/cool accent     |
| `--border`         | 8% white       | 12% black      | Dividers, card borders           |
| `--color-book`     | `#C47D5A`      | `#A85A35`      | Books media-type color           |
| `--color-film`     | `#6B8DD6`      | `#4A6BBF`      | Films media-type color           |
| `--color-podcast`  | `#3DBFBD`      | `#1A8E8C`      | Podcasts (= `--accent2`)         |
| `--color-game`     | `#9B6DB5`      | `#7A4A95`      | Games media-type color           |
| `--gradient-warm`  | gold → amber   | gold → amber   | Hero sections, warm CTAs         |
| `--gradient-cool`  | teal → blue    | teal → blue    | Charts, cool CTAs                |

**Never use hardcoded colors in new components.** Use CSS custom properties or `var(--token)`.

### Typography

- **Headings**: `font-display` class → Playfair Display (serif)
- **Body / UI**: DM Sans (sans-serif, the default)

### Component conventions

```jsx
// Cards — always use var(--surface) not hardcoded hex
<div style={{ background: 'var(--surface)', color: 'var(--text)' }}>

// Buttons — use .btn-primary or .btn-ghost classes
<button className="btn-primary">Save</button>
<button className="btn-ghost">Cancel</button>

// Inputs — always use .input-field class
<input className="input-field" />
```

---

## Security Rules

1. **Never store or log plaintext passwords.**
2. **JWT secrets must come from environment variables.** The fallback `hobbyist-dev-secret-change-in-prod` is for local dev only.
3. **All auth endpoints are rate-limited** (20 req / 15 min per IP).
4. **Input validation** is required on all POST/PUT routes via `express-validator`.
5. **Never expose internal error details** to API responses in production.

---

## Environment Variables

Copy `server/.env.example` → `server/.env` before first run.

Required server variables:

| Variable         | Description                            | Default (dev only)               |
|------------------|----------------------------------------|----------------------------------|
| `PORT`           | Express server port                    | `3001`                           |
| `NODE_ENV`       | `development` or `production`          | `development`                    |
| `JWT_SECRET`     | Random 32+ char string for JWT signing | `hobbyist-dev-secret-...`        |
| `DATABASE_URL`   | Prisma connection string               | `file:./prisma/dev.db`           |
| `CLIENT_ORIGIN`  | Allowed CORS origin in production      | `https://saad-r10.github.io`     |

---

## Open Issues (as of 2026-06-14)

| # | Title | Priority |
|---|-------|----------|
| [#8](https://github.com/saad-r10/hobbyist/issues/8) | Infrastructure: GitHub Actions CI | Medium — likely stale/duplicate of closed #18/#19, verify and close if so |
| [#9](https://github.com/saad-r10/hobbyist/issues/9) | Notification system | Low |

#1-7, #11-15, #18 are closed/shipped.

## UI Revamp & Feature Roadmap (added 2026-06-14)

A staged plan to bring the UI to a more polished, "next level" visual standard (inspired by onlook.com) and round out the feature set. Work roughly in phase order — later phases depend on the design-system primitives from Phase A.

**Phase A — Design System 2.0** (foundation)
- [#24](https://github.com/saad-r10/hobbyist/issues/24) Expand typography scale + fluid heading sizes
- [#25](https://github.com/saad-r10/hobbyist/issues/25) Motion and elevation token system
- [#31](https://github.com/saad-r10/hobbyist/issues/31) Secondary accent color + gradient tokens
- [#26](https://github.com/saad-r10/hobbyist/issues/26) Rebuild core component primitives

**Phase B — Navigation & Layout**
- [#27](https://github.com/saad-r10/hobbyist/issues/27) Desktop sidebar navigation
- [#28](https://github.com/saad-r10/hobbyist/issues/28) Mobile bottom nav polish
- [#29](https://github.com/saad-r10/hobbyist/issues/29) Route-level page transitions

**Phase C — Per-tab redesigns**
- [#30](https://github.com/saad-r10/hobbyist/issues/30) Feed redesign + inline reactions
- [#32](https://github.com/saad-r10/hobbyist/issues/32) Club Detail hero + chat bubble refresh
- [#33](https://github.com/saad-r10/hobbyist/issues/33) Discover featured carousel
- [#34](https://github.com/saad-r10/hobbyist/issues/34) Leaderboard animated podium
- [#35](https://github.com/saad-r10/hobbyist/issues/35) Analytics charts + yearly wrap-up
- [#36](https://github.com/saad-r10/hobbyist/issues/36) Profile banner + import history

**Phase D — Auth & Onboarding**
- [#37](https://github.com/saad-r10/hobbyist/issues/37) Redesign Login/Register/Onboarding/ResetPassword

**Phase E — New features**
- [#38](https://github.com/saad-r10/hobbyist/issues/38) Real cover art (Open Library, TMDB, IGDB)
- [#39](https://github.com/saad-r10/hobbyist/issues/39) Emoji reactions on posts/messages
- [#40](https://github.com/saad-r10/hobbyist/issues/40) Real-time chat/feed via WebSockets
- [#41](https://github.com/saad-r10/hobbyist/issues/41) Club events/reading schedules
- [#42](https://github.com/saad-r10/hobbyist/issues/42) Achievements/badges system
- [#43](https://github.com/saad-r10/hobbyist/issues/43) Public club pages for discovery
- [#44](https://github.com/saad-r10/hobbyist/issues/44) PWA support

**Phase F — Polish pass**
- [#45](https://github.com/saad-r10/hobbyist/issues/45) Micro-interaction sweep
- [#46](https://github.com/saad-r10/hobbyist/issues/46) Empty/loading/error state audit
- [#47](https://github.com/saad-r10/hobbyist/issues/47) Accessibility audit
