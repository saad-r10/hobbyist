# Folio

A hobbyist club platform prototype — where people host and join clubs around shared media. Think Goodreads meets Letterboxd meets Discord, purpose-built for small group clubs.

Built as a single-page React app with no backend. All data is hardcoded mock data.

## Features

**6 fully interactive tabs:**

- **Feed** — Global activity stream showing what everyone across your clubs is reading, watching, playing, and discussing. Skeleton loader on first render.
- **Clubs** — Dashboard of your active clubs with progress rings, unread badges, and next meetup dates. Click any club to open a full detail view with four sub-tabs:
  - *Discussion* — Threaded posts with expandable replies
  - *Chat* — iMessage-style chat thread (your messages on the right)
  - *Members* — Progress bars per member with last-active timestamps
  - *Past Items* — Grid of previously finished items with ratings
- **Discover** — Personalised recommendations with a featured hero card and three horizontal scroll rows filtered by club membership
- **Ranks** — Leaderboard with a podium visual for the top 3, full ranked table with streak flames, and a "you're X spots away" nudge for the current user
- **Stats** — Personal analytics dashboard: summary cards, stacked monthly bar chart, CSS conic-gradient donut chart, GitHub-style 52×7 activity heatmap, genre bars, and a recent ratings list
- **Profile** — Alex Chen's profile with bio, stat strip, club badges, a horizontal ratings shelf, and a filtered activity feed

## Stack

- [React](https://react.dev/) — functional components + hooks
- [Tailwind CSS v4](https://tailwindcss.com/) — utility styling via `@tailwindcss/vite`
- [Lucide React](https://lucide.dev/) — icons
- [Vite](https://vite.dev/) — build tool
- Google Fonts — Playfair Display (headings) + DM Sans (UI)
- No chart library — all data visualisations are built with divs and SVG

## Getting started

```bash
git clone https://github.com/saad-r10/clubhouse.git
cd clubhouse
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Design

| Token | Value |
|---|---|
| Background | `#0F1923` deep navy |
| Surface | `#162030` |
| Primary accent | `#E8A020` amber/saffron |
| Secondary accent | `#7A9E7E` sage green |
| Text | `#F5F0E8` warm off-white |

All charts, progress rings, and the activity heatmap are CSS/SVG — no external visualisation libraries.
