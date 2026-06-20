import { DEMO_HANDLERS, matchDemoHandler } from './demo.js'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

let _accessToken = null
let _refreshPromise = null

export function setAccessToken(t) { _accessToken = t }
export function getAccessToken() { return _accessToken }

// Demo mode: intercept all API calls and return mock data
async function demoApi(path, options = {}) {
  const method = options.method || 'GET'
  let body = null
  try { body = options.body ? JSON.parse(options.body) : null } catch { /* non-JSON body */ }

  const key = method === 'GET' || method === 'DELETE' ? path : `${method} ${path}`

  // Check static handlers first
  if (DEMO_HANDLERS[key]) return DEMO_HANDLERS[key](path, body)
  if (DEMO_HANDLERS[path]) return DEMO_HANDLERS[path](path, body)

  // Check dynamic handlers (path params)
  const dynamic = matchDemoHandler(method, path, body)
  if (dynamic) return dynamic()

  console.warn('[demo] unhandled:', method, path)
  return null
}

async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    .then(async r => {
      if (!r.ok) throw new Error('Session expired')
      const data = await r.json()
      _accessToken = data.accessToken
      return _accessToken
    })
    .finally(() => { _refreshPromise = null })
  return _refreshPromise
}

export async function api(path, options = {}) {
  if (IS_DEMO) return demoApi(path, options)

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  const res = await fetch(`/api${path}`, { credentials: 'include', ...options, headers })

  if (res.status === 401 && _accessToken) {
    try {
      await refreshAccessToken()
      headers['Authorization'] = `Bearer ${_accessToken}`
      const retry = await fetch(`/api${path}`, { credentials: 'include', ...options, headers })
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ error: 'Request failed' }))
        throw Object.assign(new Error(err.error || 'Request failed'), { status: retry.status, data: err })
      }
      return retry.json()
    } catch {
      _accessToken = null
      throw Object.assign(new Error('Session expired'), { status: 401 })
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status, data: err })
  }

  return res.status === 204 ? null : res.json()
}

export const get = (path) => api(path)
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) })
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) })
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) })
export const del = (path) => api(path, { method: 'DELETE' })
