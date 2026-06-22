import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookOpen, Film, Mic, Gamepad2, Users, ArrowRight } from 'lucide-react'
import { api } from '../api/client.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const TYPE_META = {
  book:    { Icon: BookOpen,  label: 'Book Club',    verb: 'Reading' },
  film:    { Icon: Film,      label: 'Film Club',    verb: 'Watching' },
  podcast: { Icon: Mic,       label: 'Podcast Club', verb: 'Listening to' },
  game:    { Icon: Gamepad2,  label: 'Game Club',    verb: 'Playing' },
}

function setMetaTag(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function PublicClub() {
  const { id } = useParams()
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api(`/clubs/public/${id}`)
      .then(data => {
        if (!data) { setStatus('notfound'); return }
        setClub(data)
        setStatus('ok')
        const prevTitle = document.title
        document.title = `${data.name} — Hobbyist`
        setMetaTag('og:title', data.name)
        setMetaTag('og:description', data.description || `A ${data.type} club with ${data.memberCount} members on Hobbyist`)
        setMetaTag('og:type', 'website')
        if (data.currentItem?.coverUrl) setMetaTag('og:image', data.currentItem.coverUrl)
        return () => { document.title = prevTitle }
      })
      .catch(err => setStatus(err?.status === 404 ? 'notfound' : 'notfound'))
  }, [id])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1923' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#E8A020] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (status === 'notfound') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5" style={{ background: '#0F1923' }}>
        <span className="text-5xl">🔒</span>
        <h1 className="font-display text-2xl font-semibold" style={{ color: '#F5F0E8' }}>Club not found</h1>
        <p className="text-sm text-center max-w-xs" style={{ color: 'rgba(245,240,232,0.50)' }}>
          This club may be private or no longer exists.
        </p>
        <Link to="/app" className="btn-primary mt-2">Go to Hobbyist</Link>
      </div>
    )
  }

  const { Icon, label, verb } = TYPE_META[club.type] || TYPE_META.book

  return (
    <div className="min-h-screen" style={{ background: '#0F1923', color: '#F5F0E8' }}>
      {/* Top bar */}
      <header
        className="flex items-center gap-2.5 px-5 sm:px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#E8A020' }}
        >
          <BookOpen size={16} color="#0F1923" />
        </div>
        <span className="font-display font-semibold text-lg" style={{ color: '#F5F0E8' }}>
          Hobbyist
        </span>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link to="/app" className="btn-primary text-sm">Open app</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Join free</Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-10">
        {/* Club card */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            background: club.bgColor,
            border: `1px solid ${club.accentColor}30`,
          }}
        >
          <div className="px-7 py-8">
            <div className="flex items-start gap-5">
              {/* Emoji badge */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{
                  background: `${club.accentColor}18`,
                  border: `1px solid ${club.accentColor}35`,
                }}
              >
                {club.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2"
                  style={{ background: `${club.accentColor}18`, color: club.accentColor }}
                >
                  {label}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold leading-tight mb-2">
                  {club.name}
                </h1>
                <div
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: 'rgba(245,240,232,0.50)' }}
                >
                  <Users size={13} />
                  <span>{club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}</span>
                </div>
              </div>
            </div>

            {club.description && (
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: 'rgba(245,240,232,0.60)' }}
              >
                {club.description}
              </p>
            )}
          </div>
        </div>

        {/* Current item */}
        {club.currentItem && (
          <div
            className="rounded-xl overflow-hidden mb-8"
            style={{
              background: '#162030',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="px-5 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: club.accentColor }}
              >
                Currently {verb}
              </p>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              {club.currentItem.coverUrl ? (
                <img
                  src={club.currentItem.coverUrl}
                  alt={club.currentItem.title}
                  className="w-12 h-[4.5rem] object-cover rounded-lg flex-shrink-0"
                  style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.45)' }}
                />
              ) : (
                <div
                  className="w-12 h-[4.5rem] rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: club.currentItem.coverColor || '#1e2d40' }}
                >
                  <Icon size={18} color={club.accentColor} />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="font-display font-semibold text-base leading-snug mb-0.5"
                  style={{ color: '#F5F0E8' }}
                >
                  {club.currentItem.title}
                </p>
                {club.currentItem.subtitle && (
                  <p className="text-sm truncate" style={{ color: 'rgba(245,240,232,0.50)' }}>
                    {club.currentItem.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Join CTA */}
        <div
          className="text-center rounded-2xl px-6 py-10"
          style={{
            background: '#162030',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {user ? (
            <>
              <p className="font-display text-2xl font-semibold mb-2">You're on Hobbyist!</p>
              <p className="text-sm mb-7" style={{ color: 'rgba(245,240,232,0.50)' }}>
                Open the app to browse and join clubs.
              </p>
              <Link to="/app" className="btn-primary inline-flex items-center gap-2 px-7 py-3">
                Open Hobbyist <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-semibold mb-2">Ready to join?</p>
              <p className="text-sm mb-7" style={{ color: 'rgba(245,240,232,0.50)' }}>
                Create a free account to track your progress, discuss with members, and join clubs.
              </p>
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 px-7 py-3 text-sm"
              >
                Join Hobbyist free <ArrowRight size={15} />
              </Link>
              <p className="text-sm mt-5" style={{ color: 'rgba(245,240,232,0.35)' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="underline underline-offset-2"
                  style={{ color: 'rgba(245,240,232,0.60)' }}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
