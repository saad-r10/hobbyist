import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

const VALID_USER = {
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  password: 'password123',
}

async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ ...VALID_USER, ...overrides })
}

describe('POST /api/auth/register', () => {
  it('creates a new user and returns 201 with accessToken', async () => {
    const res = await registerUser()
    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user.email).toBe(VALID_USER.email)
    expect(res.body.user.username).toBe(VALID_USER.username)
  })

  it('sets httpOnly rt cookie on success', async () => {
    const res = await registerUser()
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some(c => c.startsWith('rt='))).toBe(true)
  })

  it('returns 422 for invalid email', async () => {
    const res = await registerUser({ email: 'not-an-email' })
    expect(res.status).toBe(422)
  })

  it('returns 422 for password shorter than 8 chars', async () => {
    const res = await registerUser({ password: 'short' })
    expect(res.status).toBe(422)
  })

  it('returns 422 for username with special chars', async () => {
    const res = await registerUser({ username: 'bad user!' })
    expect(res.status).toBe(422)
  })

  it('returns 409 when email is already taken', async () => {
    await registerUser()
    const res = await registerUser({ username: 'different' })
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/email/i)
  })

  it('returns 409 when username is already taken', async () => {
    await registerUser()
    const res = await registerUser({ email: 'other@example.com' })
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/username/i)
  })

  it('does not expose passwordHash in response', async () => {
    const res = await registerUser()
    expect(res.body.user.passwordHash).toBeUndefined()
  })
})

describe('POST /api/auth/login', () => {
  it('returns accessToken and user for correct credentials', async () => {
    await registerUser()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user.email).toBe(VALID_USER.email)
  })

  it('sets httpOnly rt cookie on login', async () => {
    await registerUser()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password })
    const cookies = res.headers['set-cookie']
    expect(cookies.some(c => c.startsWith('rt='))).toBe(true)
  })

  it('returns 401 for wrong password', async () => {
    await registerUser()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'wrongpassword' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })
    expect(res.status).toBe(401)
  })

  it('returns 422 for missing password field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email })
    expect(res.status).toBe(422)
  })
})

describe('POST /api/auth/refresh', () => {
  it('returns new accessToken when given a valid refresh cookie', async () => {
    const reg = await registerUser()
    const cookie = reg.headers['set-cookie'].find(c => c.startsWith('rt='))

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })

  it('rotates the refresh token (old cookie is invalidated)', async () => {
    const reg = await registerUser()
    const cookie = reg.headers['set-cookie'].find(c => c.startsWith('rt='))

    await request(app).post('/api/auth/refresh').set('Cookie', cookie)

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie)
    expect(res.status).toBe(401)
  })

  it('returns 401 when no cookie is sent', async () => {
    const res = await request(app).post('/api/auth/refresh')
    expect(res.status).toBe(401)
  })

  it('returns 401 for a tampered token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'rt=tamperedtokenvalue')
    expect(res.status).toBe(401)
  })
})
