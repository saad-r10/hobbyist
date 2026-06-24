import { describe, it, expect } from 'vitest'
import express from 'express'
import rateLimit from 'express-rate-limit'
import request from 'supertest'

function makeTestApp(max) {
  const app = express()
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res, _next, options) => {
      res
        .status(options.statusCode)
        .set('Retry-After', Math.ceil(options.windowMs / 1000))
        .json({ error: 'Too many requests. Please slow down and try again later.' })
    },
  })
  app.use(limiter)
  app.get('/test', (_req, res) => res.json({ ok: true }))
  return app
}

describe('rate limiter', () => {
  it('allows requests under the limit', async () => {
    const app = makeTestApp(3)
    const res = await request(app).get('/test')
    expect(res.status).toBe(200)
  })

  it('returns 429 after exceeding the limit', async () => {
    const app = makeTestApp(2)
    await request(app).get('/test')
    await request(app).get('/test')
    const res = await request(app).get('/test')
    expect(res.status).toBe(429)
  })

  it('includes Retry-After header on 429', async () => {
    const app = makeTestApp(1)
    await request(app).get('/test')
    const res = await request(app).get('/test')
    expect(res.status).toBe(429)
    expect(res.headers['retry-after']).toBeDefined()
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0)
  })

  it('returns JSON error body on 429', async () => {
    const app = makeTestApp(1)
    await request(app).get('/test')
    const res = await request(app).get('/test')
    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/too many requests/i)
  })

  it('sets RateLimit-Remaining header', async () => {
    const app = makeTestApp(5)
    const res = await request(app).get('/test')
    expect(res.status).toBe(200)
    // draft-6 standard headers
    const remaining = res.headers['ratelimit-remaining'] ?? res.headers['x-ratelimit-remaining']
    expect(remaining).toBeDefined()
  })
})
