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

function auth(req, token) {
  return req.set('Authorization', `Bearer ${token}`)
}

async function createClub(token, overrides = {}) {
  const res = await auth(request(app).post('/api/clubs'), token)
    .send({ name: 'Readers United', type: 'book', ...overrides })
  return res.body
}

describe('GET /api/notifications', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/notifications')
    expect(res.status).toBe(401)
  })

  it('returns empty list and zero unread count for a new user', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await auth(request(app).get('/api/notifications'), accessToken)
    expect(res.status).toBe(200)
    expect(res.body.notifications).toEqual([])
    expect(res.body.unreadCount).toBe(0)
  })
})

describe('club join notifications', () => {
  it('notifies the admin when someone joins their club', async () => {
    const admin = await registerAndLogin()
    const club = await createClub(admin.accessToken)

    const joiner = await registerAndLogin()
    await auth(request(app).post(`/api/clubs/${club.id}/join`), joiner.accessToken)

    const res = await auth(request(app).get('/api/notifications'), admin.accessToken)
    expect(res.body.unreadCount).toBe(1)
    expect(res.body.notifications[0].type).toBe('club_join')
    expect(res.body.notifications[0].actor.id).toBe(joiner.user.id)
    expect(res.body.notifications[0].target).toEqual({ tab: 'clubs', clubId: club.id, subTab: 'members' })
  })
})

describe('post notifications', () => {
  it('notifies other club members when a post is created, but not the poster', async () => {
    const admin = await registerAndLogin()
    const club = await createClub(admin.accessToken)

    const member = await registerAndLogin()
    await auth(request(app).post(`/api/clubs/${club.id}/join`), member.accessToken)

    await auth(request(app).post(`/api/posts/club/${club.id}`), member.accessToken)
      .send({ title: 'Chapter 1 thoughts', body: 'What did everyone think?' })

    const memberInbox = await auth(request(app).get('/api/notifications'), member.accessToken)
    expect(memberInbox.body.notifications.find(n => n.type === 'post')).toBeUndefined()

    const adminInbox = await auth(request(app).get('/api/notifications'), admin.accessToken)
    const postNotif = adminInbox.body.notifications.find(n => n.type === 'post')
    expect(postNotif).toBeDefined()
    expect(postNotif.target.subTab).toBe('discussion')
  })
})

describe('reply and like notifications', () => {
  async function setupPost() {
    const owner = await registerAndLogin()
    const club = await createClub(owner.accessToken)

    const other = await registerAndLogin()
    await auth(request(app).post(`/api/clubs/${club.id}/join`), other.accessToken)

    const postRes = await auth(request(app).post(`/api/posts/club/${club.id}`), owner.accessToken)
      .send({ title: 'My post', body: 'Body text' })

    return { owner, other, club, postId: postRes.body.id }
  }

  it('notifies the post owner on a reply, but not on a self-reply', async () => {
    const { owner, other, postId } = await setupPost()

    await auth(request(app).post(`/api/posts/${postId}/replies`), other.accessToken)
      .send({ text: 'Great post!' })

    const ownerInbox = await auth(request(app).get('/api/notifications'), owner.accessToken)
    expect(ownerInbox.body.notifications.some(n => n.type === 'reply')).toBe(true)

    await auth(request(app).post(`/api/posts/${postId}/replies`), owner.accessToken)
      .send({ text: 'Thanks!' })

    const ownerInboxAfterSelfReply = await auth(request(app).get('/api/notifications'), owner.accessToken)
    expect(ownerInboxAfterSelfReply.body.notifications.filter(n => n.type === 'reply')).toHaveLength(1)
  })

  it('notifies the post owner on like, not on unlike or self-like', async () => {
    const { owner, other, postId } = await setupPost()

    await auth(request(app).post(`/api/posts/${postId}/like`), other.accessToken)
    let ownerInbox = await auth(request(app).get('/api/notifications'), owner.accessToken)
    expect(ownerInbox.body.notifications.filter(n => n.type === 'like')).toHaveLength(1)

    // Unlike, then like again — should not create a second notification entry beyond this point's check
    await auth(request(app).post(`/api/posts/${postId}/like`), other.accessToken)

    await auth(request(app).post(`/api/posts/${postId}/like`), owner.accessToken)
    ownerInbox = await auth(request(app).get('/api/notifications'), owner.accessToken)
    expect(ownerInbox.body.notifications.filter(n => n.type === 'like')).toHaveLength(1)
  })
})

describe('chat notifications batching', () => {
  it('batches repeated unread chat messages into a single growing notification', async () => {
    const member = await registerAndLogin()
    const club = await createClub(member.accessToken)

    const other = await registerAndLogin()
    await auth(request(app).post(`/api/clubs/${club.id}/join`), other.accessToken)

    await auth(request(app).post(`/api/chat/${club.id}`), other.accessToken).send({ text: 'Hello!' })
    await auth(request(app).post(`/api/chat/${club.id}`), other.accessToken).send({ text: 'Anyone around?' })

    const inbox = await auth(request(app).get('/api/notifications'), member.accessToken)
    const chatNotifs = inbox.body.notifications.filter(n => n.type === 'chat')
    expect(chatNotifs).toHaveLength(1)
    expect(chatNotifs[0].count).toBe(2)
    expect(chatNotifs[0].message).toContain('2 new messages')
  })
})

describe('mark as read', () => {
  it('marks a notification as read and is scoped to the owning user', async () => {
    const admin = await registerAndLogin()
    const club = await createClub(admin.accessToken)

    const joiner = await registerAndLogin()
    await auth(request(app).post(`/api/clubs/${club.id}/join`), joiner.accessToken)

    const inbox = await auth(request(app).get('/api/notifications'), admin.accessToken)
    const notifId = inbox.body.notifications[0].id

    // Another user cannot mark someone else's notification as read
    const wrongUser = await registerAndLogin()
    const forbidden = await auth(request(app).post(`/api/notifications/${notifId}/read`), wrongUser.accessToken)
    expect(forbidden.status).toBe(404)

    const ok = await auth(request(app).post(`/api/notifications/${notifId}/read`), admin.accessToken)
    expect(ok.status).toBe(200)

    const after = await auth(request(app).get('/api/notifications'), admin.accessToken)
    expect(after.body.unreadCount).toBe(0)
  })

  it('read-all clears unread count', async () => {
    const admin = await registerAndLogin()
    const club = await createClub(admin.accessToken)

    const joiner = await registerAndLogin()
    await auth(request(app).post(`/api/clubs/${club.id}/join`), joiner.accessToken)

    const res = await auth(request(app).post('/api/notifications/read-all'), admin.accessToken)
    expect(res.status).toBe(200)

    const after = await auth(request(app).get('/api/notifications'), admin.accessToken)
    expect(after.body.unreadCount).toBe(0)
  })
})
