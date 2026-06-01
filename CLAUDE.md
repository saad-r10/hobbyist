# CLAUDE.md — Hobbyist Development Guide

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

# Backend only
npm run server

# Reset and reseed the database
npm run db:reset

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
clubhouse/
├── src/                    # React frontend
│   ├── api/
│   │   ├── client.js       # API client + token refresh
│   │   └── demo.js         # Mock data for GitHub Pages demo
│   ├── components/         # Shared UI components
│   │   ├── ImportModal.jsx
│   │   └── SearchModal.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx  # Login state + token management
│   │   └── ThemeContext.jsx # Light/dark theme
│   ├── pages/              # Route-level pages (auth flows)
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Onboarding.jsx
│   │   └── ResetPassword.jsx
│   ├── App.jsx             # Main app + all 6 tabs
│   ├── main.jsx            # Router + providers
│   └── index.css           # Design tokens + global styles
├── server/
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Demo data seeder
│   └── src/
│       ├── middleware/
│       │   ├── auth.js     # JWT verification
│       │   └── errorHandler.js
│       ├── routes/         # One file per resource
│       │   ├── auth.js
│       │   ├── clubs.js
│       │   ├── posts.js
│       │   ├── chat.js
│       │   ├── feed.js
│       │   ├── discover.js
│       │   ├── leaderboard.js
│       │   ├── analytics.js
│       │   ├── import.js
│       │   └── search.js
│       └── index.js        # Express app entry point
├── .github/workflows/ci.yml
├── .claude/                # Claude operating procedures
├── .env.example
├── CLAUDE.md               # ← this file
└── WEBFLOW.md              # App flow diagrams
```

### Key design decisions

- **Single `App.jsx`** — all 6 tab components in one file for simplicity. Extract only when it exceeds maintainability.
- **Demo mode** (`VITE_DEMO_MODE=true`) — bakes mock data into the bundle for static hosting (GitHub Pages). All API calls intercepted in `src/api/client.js`.
- **SQLite** — simple, zero-config for local dev. Migrate to PostgreSQL when deploying to a persistent host.
- **No chart libraries** — all data visualizations built with CSS/SVG to keep bundle size down.

---

## Design System

### Tokens (CSS custom properties)

| Token         | Dark value     | Light value    | Usage                  |
|---------------|----------------|----------------|------------------------|
| `--bg`        | `#0F1923`      | `#F0E6D3`      | Page background        |
| `--surface`   | `#162030`      | `#EDE0C4`      | Card / panel surfaces  |
| `--surface2`  | `#1e2d40`      | `#E5D4B0`      | Hover states, inputs   |
| `--text`      | `#F5F0E8`      | `#2C1810`      | Primary text           |
| `--text-dim`  | 50% opacity    | 55% opacity    | Secondary text         |
| `--accent`    | `#E8A020`      | `#B87412`      | Amber — primary action |
| `--border`    | 8% white       | 12% black      | Dividers, card borders |

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

| Variable       | Description                            | Default (dev only)               |
|----------------|----------------------------------------|----------------------------------|
| `PORT`         | Express server port                    | `3001`                           |
| `NODE_ENV`     | `development` or `production`          | `development`                    |
| `JWT_SECRET`   | Random 32+ char string for JWT signing | `hobbyist-dev-secret-...`        |
| `DATABASE_URL` | Prisma connection string               | `file:./prisma/dev.db`           |

---

## Open Issues (as of 2026-06-01)

| # | Title | Priority |
|---|-------|----------|
| [#1](https://github.com/saad-r10/hobbyist/issues/1) | Rebranding: Folio → Hobbyist | High |
| [#2](https://github.com/saad-r10/hobbyist/issues/2) | Bug: profile avatar not clickable | High |
| [#3](https://github.com/saad-r10/hobbyist/issues/3) | Global search system | High |
| [#4](https://github.com/saad-r10/hobbyist/issues/4) | Light/dark theme system | Medium |
| [#5](https://github.com/saad-r10/hobbyist/issues/5) | Rate limiting & security hardening | High |
| [#6](https://github.com/saad-r10/hobbyist/issues/6) | .env.example & environment docs | High |
| [#7](https://github.com/saad-r10/hobbyist/issues/7) | Testing infrastructure | Medium |
| [#8](https://github.com/saad-r10/hobbyist/issues/8) | GitHub Actions CI | Medium |
| [#9](https://github.com/saad-r10/hobbyist/issues/9) | Notification system | Low |
