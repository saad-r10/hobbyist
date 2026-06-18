/**
 * Cover art lookup service.
 * Fetches cover images from external APIs and caches results in-process.
 *
 * Supported:
 *   book  → Open Library (no key required)
 *   film  → TMDB (requires TMDB_API_KEY env var)
 *   game  → IGDB (requires IGDB_CLIENT_ID + IGDB_CLIENT_SECRET env vars)
 *   podcast → no free cover API; returns null
 */

const CACHE = new Map()
const TTL = 24 * 60 * 60 * 1000 // 24h

let igdbToken = null
let igdbTokenExpires = 0

// ── Open Library ───────────────────────────────────────────────────────────

async function lookupOpenLibrary(title, subtitle) {
  const params = new URLSearchParams({ title, fields: 'key,cover_i', limit: '1' })
  if (subtitle) params.set('author', subtitle)

  const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
    headers: { 'User-Agent': 'hobbyist-app/1.0 (contact: hobbyist@example.com)' },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null

  const data = await res.json()
  const coverId = data?.docs?.[0]?.cover_i
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null
}

// ── TMDB ───────────────────────────────────────────────────────────────────

async function lookupTMDB(title) {
  const key = process.env.TMDB_API_KEY
  if (!key) return null

  const params = new URLSearchParams({ query: title, api_key: key, language: 'en-US', page: '1' })
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`, {
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null

  const data = await res.json()
  const poster = data?.results?.[0]?.poster_path
  return poster ? `https://image.tmdb.org/t/p/w300${poster}` : null
}

// ── IGDB ───────────────────────────────────────────────────────────────────

async function getIGDBToken() {
  if (igdbToken && Date.now() < igdbTokenExpires) return igdbToken

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.IGDB_CLIENT_ID,
      client_secret: process.env.IGDB_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null

  const data = await res.json()
  igdbToken = data.access_token
  igdbTokenExpires = Date.now() + (data.expires_in - 60) * 1000
  return igdbToken
}

async function lookupIGDB(title) {
  if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_CLIENT_SECRET) return null

  const token = await getIGDBToken()
  if (!token) return null

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body: `search "${title.replace(/"/g, '')}"; fields name,cover.url; limit 1;`,
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null

  const data = await res.json()
  const rawUrl = data?.[0]?.cover?.url
  if (!rawUrl) return null

  // IGDB returns //images.igdb.com/…/t_thumb/hash.jpg — upgrade to t_cover_big
  return `https:${rawUrl.replace('t_thumb', 't_cover_big')}`
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function lookupCover(title, subtitle, type) {
  const key = `${type}:${title.toLowerCase()}:${(subtitle || '').toLowerCase()}`
  const cached = CACHE.get(key)
  if (cached && Date.now() < cached.expires) return cached.url

  let url = null
  try {
    if (type === 'book') url = await lookupOpenLibrary(title, subtitle)
    else if (type === 'film') url = await lookupTMDB(title)
    else if (type === 'game') url = await lookupIGDB(title)
    // podcast: no supported API
  } catch {
    // network error or timeout — fall through to null
  }

  CACHE.set(key, { url, expires: Date.now() + TTL })
  return url
}
