import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

async function registerAndLogin() {
  const tag = Math.random().toString(36).slice(2, 8)
  const user = {
    email: `user_${tag}@example.com`,
    username: `user_${tag}`,
    displayName: 'Test User',
    password: 'password123',
  }
  const res = await request(app).post('/api/auth/register').send(user)
  const accessToken = res.body.accessToken
  const cookie = res.headers['set-cookie'].find(c => c.startsWith('rt='))
  return { accessToken, cookie, user: res.body.user }
}

describe('GET /api/clubs', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/clubs')
    expect(res.status).toBe(401)
  })

  it('returns empty array for new user with no clubs', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await request(app)
      .get('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/clubs', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/clubs')
      .send({ name: 'My Club', type: 'book' })
    expect(res.status).toBe(401)
  })

  it('creates a club and returns 201', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Readers United', type: 'book', description: 'A book club' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Readers United')
    expect(res.body.type).toBe('book')
  })

  it('creator is added as admin member', async () => {
    const { accessToken } = await registerAndLogin()
    const create = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Film Buffs', type: 'film' })

    const club = await request(app)
      .get(`/api/clubs/${create.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
    expect(club.body.myRole).toBe('admin')
  })

  it('new club appears in GET /api/clubs', async () => {
    const { accessToken } = await registerAndLogin()
    await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Podcast Pals', type: 'podcast' })

    const list = await request(app)
      .get('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
    expect(list.body).toHaveLength(1)
    expect(list.body[0].name).toBe('Podcast Pals')
  })

  it('returns 422 for invalid club type', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Bad Type Club', type: 'yoga' })
    expect(res.status).toBe(422)
  })

  it('returns 422 for missing name', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'book' })
    expect(res.status).toBe(422)
  })

  it('allows creating a private club', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Secret Club', type: 'game', isPublic: false })
    expect(res.status).toBe(201)
    expect(res.body.isPublic).toBe(false)
  })
})
