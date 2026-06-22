import { useState, useRef, useEffect, useCallback } from 'react'
import {
  BookOpen, Film, Mic, Gamepad2, Home, Compass, Trophy,
  BarChart2, User, MessageCircle, Star,
  ArrowLeft, Flame, Plus, Check, Clock, Send, LogOut,
  Users, AlertCircle, Loader2, X, Settings, Search, TrendingUp,
  PlayCircle, CheckCircle2, Sparkles, MessageSquare, Upload,
  ChevronLeft, ChevronRight, Download, Calendar, Smartphone,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import { useTheme } from './contexts/ThemeContext.jsx'
import { get, post, put, patch } from './api/client.js'
import ImportModal from './components/ImportModal.jsx'
import NotificationBell from './components/NotificationBell.jsx'
import SearchModal from './components/SearchModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import { useSocket } from './hooks/useSocket.js'

// ── Utility components ──────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function Avatar({ user, size = 32 }) {
  if (!user) return <div className="rounded-full bg-s10" style={{ width: size, height: size }} />
  return (
    <div className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, background: user.avatarColor || 'var(--accent)', fontSize: size * 0.35, color: '#fff' }}>
      {user.avatarInitials || (user.displayName || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

function TypeIcon({ type, size = 14 }) {
  const icons = { book: BookOpen, film: Film, podcast: Mic, game: Gamepad2 }
  const Icon = icons[type] || BookOpen
  return <Icon size={size} />
}

function Stars({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={11}
          fill={i < Math.round(rating) ? 'var(--accent)' : 'none'}
          stroke={i < Math.round(rating) ? 'var(--accent)' : 'var(--text-25)'}
          strokeWidth={1.5} />
      ))}
    </div>
  )
}

// Renders a cover image when available, falls back to a solid-color block.
function CoverBlock({ coverUrl, coverColor, type, className = '', style = {} }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = coverUrl && !imgFailed
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {showImage
        ? <img src={coverUrl} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center"
            style={{ background: coverColor || 'var(--surface)' }}>
            <TypeIcon type={type} size={Math.min(Number(style.width || 24), 24)} />
          </div>}
    </div>
  )
}

function ProgressRing({ pct, size = 36, stroke = 3, color = 'var(--accent)' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
    </svg>
  )
}

function ProgressBar({ pct, color = 'var(--accent)' }) {
  return (
    <div className="h-1.5 rounded-full w-full" style={{ background: 'var(--border-08)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-[#E8A020]" />
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, #E87070 10%, transparent)' }}>
        <AlertCircle size={20} style={{ color: '#E87070' }} />
      </div>
      <div>
        <p className="text-t70 text-sm font-semibold">Something went wrong</p>
        <p className="text-t40 text-xs mt-0.5">{message || 'An unexpected error occurred'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-xs px-4 py-1.5">Try again</button>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub, cta, onCta }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
        <Icon size={20} className="text-t30" />
      </div>
      <div>
        <p className="text-t70 text-sm font-semibold">{title}</p>
        {sub && <p className="text-t35 text-xs mt-1">{sub}</p>}
      </div>
      {cta && onCta && (
        <button onClick={onCta} className="btn-ghost text-xs px-4 py-1.5">{cta}</button>
      )}
    </div>
  )
}

function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/use-memo

  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load, setData }
}

// ── Global Feed ──────────────────────────────────────────────────────────

const ACTIVITY_COLORS = { book: 'var(--color-book)', film: 'var(--color-film)', podcast: 'var(--color-podcast)', game: 'var(--color-game)' }

const ACTIVITY_META = {
  started_item:  { icon: PlayCircle,   color: 'var(--accent)' },
  finished_item: { icon: CheckCircle2, color: 'var(--success)' },
  rated:         { icon: Star,         color: 'var(--accent)' },
  joined_club:   { icon: Users,        color: 'var(--color-film)' },
  created_club:  { icon: Sparkles,     color: 'var(--color-game)' },
  posted:        { icon: MessageSquare, color: 'var(--color-podcast)' },
  import:        { icon: Upload,       color: 'var(--color-book)' },
}

// Adds an alpha component to a color, whether it's a hex literal or a var(--token)
function withAlpha(color, pct) {
  if (color.startsWith('#')) return color + Math.round(pct * 2.55).toString(16).padStart(2, '0')
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

function activityAccent(item) {
  if (item.type === 'rated' || item.type === 'started_item' || item.type === 'finished_item') {
    return ACTIVITY_COLORS[item.extra?.type] || ACTIVITY_META[item.type]?.color || 'var(--accent)'
  }
  return ACTIVITY_META[item.type]?.color || 'var(--accent)'
}

function ActivityBadge({ type, accent, size = 22 }) {
  const Icon = ACTIVITY_META[type]?.icon || MessageSquare
  return (
    <div className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: withAlpha(accent, 15), color: accent }}>
      <Icon size={size * 0.6} strokeWidth={2.25} />
    </div>
  )
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '😮']

function InlineReactionBar({ item }) {
  const [active, setActive] = useState(null)
  const [count, setCount] = useState(item.likeCount || 0)

  function toggle(emoji) {
    if (active === emoji) {
      setActive(null)
      setCount(c => Math.max(0, c - 1))
    } else {
      setCount(c => c + (active ? 0 : 1))
      setActive(emoji)
    }
  }

  return (
    <div className="flex items-center gap-3 pt-2 mt-1 border-t border-t06">
      <div className="flex items-center gap-0.5">
        {QUICK_REACTIONS.map(emoji => (
          <button key={emoji} onClick={() => toggle(emoji)}
            aria-label={emoji}
            aria-pressed={active === emoji}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95 focus-ring"
            style={{
              background: active === emoji ? 'var(--accent-15)' : 'transparent',
              filter: active && active !== emoji ? 'grayscale(1) opacity(0.45)' : 'none',
            }}>
            {emoji}
          </button>
        ))}
        {count > 0 && <span className="text-xs text-t40 ml-0.5">{count}</span>}
      </div>
      <button aria-label={`${item.commentCount || 0} comments`} className="flex items-center gap-1.5 text-xs text-t35 hover:text-t60 transition-colors ml-auto focus-ring">
        <MessageCircle size={13} />
        {item.commentCount > 0 ? item.commentCount : ''}
      </button>
    </div>
  )
}

function EmojiPickerPopover({ onPick, onClose, above = true }) {
  const ref = useRef(null)
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref}
      className="absolute left-0 z-50 flex gap-0.5 p-1 rounded-xl shadow-xl border border-t12"
      style={{
        background: 'var(--surface)',
        ...(above ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }),
      }}>
      {QUICK_REACTIONS.map(emoji => (
        <button key={emoji} onClick={() => onPick(emoji)}
          aria-label={emoji}
          className="w-8 h-8 flex items-center justify-center text-base rounded-lg transition-transform hover:scale-125 active:scale-95 focus-ring"
          style={{ background: 'transparent' }}>
          {emoji}
        </button>
      ))}
    </div>
  )
}

function applyReactionToggle(reactions, emoji, reacted) {
  const exists = reactions.find(r => r.emoji === emoji)
  if (reacted) {
    if (exists) return reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r)
    return [...reactions, { emoji, count: 1, reactedByMe: true, users: ['You'] }]
  } else {
    return reactions
      .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, reactedByMe: false } : r)
      .filter(r => r.count > 0)
  }
}

function ReactionBar({ reactions = [], onReact, compact = false }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="flex items-center gap-1 flex-wrap relative">
      {reactions.map(r => (
        <button key={r.emoji} onClick={() => onReact(r.emoji)}
          aria-label={`${r.emoji} — ${r.count} ${r.count === 1 ? 'reaction' : 'reactions'}${r.reactedByMe ? ', reacted' : ''}`}
          aria-pressed={r.reactedByMe}
          className="flex items-center gap-0.5 rounded-full text-xs transition-all hover:scale-110 active:scale-95 focus-ring"
          style={{
            padding: compact ? '1px 6px' : '2px 8px',
            background: r.reactedByMe ? 'var(--accent-15)' : 'var(--surface2)',
            border: `1px solid ${r.reactedByMe ? 'var(--accent)' : 'transparent'}`,
            opacity: r.reactedByMe ? 1 : 0.75,
          }}>
          <span aria-hidden="true">{r.emoji}</span>
          <span className="ml-0.5 text-t60">{r.count}</span>
        </button>
      ))}
      <div className="relative">
        <button onClick={() => setPickerOpen(p => !p)}
          aria-label="Add reaction"
          aria-expanded={pickerOpen}
          aria-haspopup="true"
          className="flex items-center justify-center rounded-full text-t30 hover:text-t60 transition-all focus-ring"
          style={{
            width: compact ? 20 : 24,
            height: compact ? 20 : 24,
            background: pickerOpen ? 'var(--surface2)' : 'transparent',
            fontSize: compact ? 11 : 13,
          }}>
          +
        </button>
        {pickerOpen && (
          <EmojiPickerPopover
            onPick={(emoji) => { onReact(emoji); setPickerOpen(false) }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

function FeedCard({ item }) {
  const accent = activityAccent(item)

  return (
    <div className="rounded-2xl p-4 border border-t06 stagger-item card-hover" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="relative shrink-0">
          <Avatar user={item.user} size={36} />
          <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
            style={{ width: 16, height: 16, background: accent, color: '#fff', border: '2px solid var(--surface)' }}>
            {(() => { const Icon = ACTIVITY_META[item.type]?.icon || MessageSquare; return <Icon size={9} strokeWidth={2.5} /> })()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{item.user?.displayName}</span>
          <span className="text-t40 text-sm"> {item.label} </span>
          {item.title && <span className="text-sm font-medium" style={{ color: accent }}>"{item.title}"</span>}
          {item.clubName && !item.title && <span className="text-sm font-medium" style={{ color: accent }}>{item.clubName}</span>}
        </div>
        <span className="text-t30 text-xs shrink-0">{item.time}</span>
      </div>

      {item.rating && (
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={item.rating} />
          <span className="text-xs text-t50">{item.rating.toFixed(1)}</span>
        </div>
      )}

      {item.type === 'joined_club' && item.clubName && (
        <div className="rounded-xl px-3 py-2 text-sm text-t60 mb-3" style={{ background: withAlpha(accent, 8), border: `1px solid ${withAlpha(accent, 18)}` }}>
          Joined <span style={{ color: accent }}>{item.clubName}</span>
        </div>
      )}

      <InlineReactionBar item={item} />
    </div>
  )
}

function GroupedActivityRow({ item }) {
  const accent = activityAccent(item)
  return (
    <div className="flex items-center gap-2.5 py-2">
      <ActivityBadge type={item.type} accent={accent} size={22} />
      <div className="flex-1 min-w-0 text-sm">
        <span className="text-t40">{item.label} </span>
        {item.title && <span className="font-medium" style={{ color: accent }}>"{item.title}"</span>}
        {item.clubName && !item.title && <span className="font-medium" style={{ color: accent }}>{item.clubName}</span>}
        {item.rating && <Stars rating={item.rating} />}
      </div>
      <span className="text-t30 text-xs shrink-0">{item.time}</span>
    </div>
  )
}

function FeedGroup({ group }) {
  if (group.items.length === 1) return <FeedCard item={group.items[0]} />

  const aggregate = {
    likeCount: group.items.reduce((sum, i) => sum + (i.likeCount || 0), 0),
    commentCount: group.items.reduce((sum, i) => sum + (i.commentCount || 0), 0),
  }

  return (
    <div className="rounded-2xl p-4 border border-t06 stagger-item card-hover" style={{ background: 'var(--surface)' }}>
      <div className="flex items-center gap-3 mb-1">
        <Avatar user={group.user} size={36} />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{group.user?.displayName}</span>
          <span className="text-t40 text-sm"> · {group.items.length} updates</span>
        </div>
      </div>
      <div className="pl-[46px]">
        {group.items.map((item, i) => (
          <div key={item.id} className={i > 0 ? 'border-t border-t06' : ''}>
            <GroupedActivityRow item={item} />
          </div>
        ))}
      </div>
      <InlineReactionBar item={aggregate} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 skeleton-circle" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/2 skeleton-text" />
          <div className="h-3 w-3/4 skeleton-text" />
        </div>
        <div className="h-3 w-10 skeleton-text" />
      </div>
      <div className="flex items-center gap-1 pt-2 mt-1 border-t border-t06">
        {[...Array(4)].map((_, i) => <div key={i} className="w-7 h-7 skeleton-circle" />)}
      </div>
    </div>
  )
}

// Groups consecutive activities from the same user into a single feed item
function groupFeedItems(data) {
  const groups = []
  for (const item of data) {
    const last = groups[groups.length - 1]
    if (last && last.user?.id === item.user?.id) {
      last.items.push(item)
    } else {
      groups.push({ user: item.user, items: [item] })
    }
  }
  return groups
}

function GlobalFeed() {
  const { data, loading, error, refetch, setData } = useApi(() => get('/feed'))

  useSocket({
    'feed:activity': useCallback((activity) => {
      setData(prev => {
        if (!prev) return [activity]
        if (prev.some(a => a.id === activity.id)) return prev
        return [activity, ...prev]
      })
    }, [setData]),
  })

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data?.length) return <EmptyState icon={Home} title="Nothing in your feed yet" sub="Join a club to see activity from your clubmates." />

  const groups = groupFeedItems(data)

  return (
    <div className="space-y-3">
      {groups.map(group => <FeedGroup key={group.items[0].id} group={group} />)}
    </div>
  )
}

// ── My Clubs ─────────────────────────────────────────────────────────────

function ClubCard({ club, onClick }) {
  const accent = club.accentColor || 'var(--accent)'
  return (
    <button onClick={onClick} className="w-full rounded-2xl p-4 text-left stagger-item transition-all hover:scale-[1.01] active:scale-[0.99] border border-t06"
      style={{ background: 'var(--surface)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg mb-0.5">{club.emoji}</div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{club.name}</div>
          <div className="text-xs text-t40 mt-0.5 flex items-center gap-1">
            <TypeIcon type={club.type} size={11} />
            <span>{club.memberCount} members</span>
          </div>
        </div>
        <ProgressRing pct={club.currentItem?.myProgress ?? 0} color={accent} />
      </div>
      {club.currentItem && (
        <div className="rounded-xl px-3 py-2 border border-t06" style={{ background: 'var(--surface-03)' }}>
          <p className="text-xs text-t40 mb-0.5">Currently</p>
          <p className="text-sm font-medium text-t90 truncate">{club.currentItem.title}</p>
          <p className="text-xs text-t40 truncate">{club.currentItem.subtitle}</p>
        </div>
      )}
    </button>
  )
}

function CreateClubModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'book', description: '', isPublic: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  const TYPES = [
    { id: 'book', label: 'Book', emoji: '📚' },
    { id: 'film', label: 'Film', emoji: '🎬' },
    { id: 'podcast', label: 'Podcast', emoji: '🎙️' },
    { id: 'game', label: 'Game', emoji: '🎮' },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const club = await post('/clubs', form)
      onCreated(club)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create club')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="modal-panel w-full max-w-md p-5" role="dialog" aria-modal="true" aria-labelledby="create-club-title" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="create-club-title" className="font-display text-lg font-semibold">Create a club</h3>
          <button onClick={onClose} aria-label="Close" className="modal-close"><X size={18} /></button>
        </div>

        {error && <p role="alert" className="toast toast-error mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-t60 mb-1.5">Club name</label>
            <input value={form.name} onChange={set('name')} required maxLength={80} placeholder="The Midnight Readers"
              className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-t60 mb-1.5">Media type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  aria-pressed={form.type === t.id}
                  className="rounded-xl py-2 text-center text-xs border transition-all focus-ring"
                  style={{
                    background: form.type === t.id ? 'var(--accent-15)' : 'var(--surface-04)',
                    borderColor: form.type === t.id ? 'var(--accent)' : 'var(--border-08)',
                    color: form.type === t.id ? 'var(--accent)' : 'var(--text-50)',
                  }}>
                  <div className="text-base mb-0.5" aria-hidden="true">{t.emoji}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-t60 mb-1.5">Description (optional)</label>
            <textarea value={form.description} onChange={set('description')} rows={2} maxLength={500}
              placeholder="What's this club about?" className="input-field resize-none" />
          </div>
          <div className="flex items-center justify-between">
            <span id="public-club-label" className="text-sm text-t60">Public club</span>
            <button type="button" role="switch" aria-checked={form.isPublic} aria-labelledby="public-club-label"
              onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
              className="w-11 h-6 rounded-full transition-colors relative focus-ring"
              style={{ background: form.isPublic ? 'var(--accent)' : 'var(--text-15)' }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.isPublic ? '1.375rem' : '0.25rem' }} />
            </button>
          </div>
          <button type="submit" disabled={loading || !form.name.trim()} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create club'}
          </button>
        </form>
      </div>
    </div>
  )
}

function MyClubs({ onSelectClub }) {
  const { data: clubs, loading, error, refetch, setData } = useApi(() => get('/clubs'))
  const [showCreate, setShowCreate] = useState(false)

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton-block" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-fs-xl font-semibold">Your clubs</h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
          style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
          <Plus size={13} /> New club
        </button>
      </div>

      {!clubs?.length
        ? <EmptyState icon={Users} title="No clubs yet" sub="Create one or browse the Discover tab." />
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clubs.map(c => <ClubCard key={c.id} club={c} onClick={() => onSelectClub(c.id)} />)}
          </div>
      }

      {showCreate && (
        <CreateClubModal
          onClose={() => setShowCreate(false)}
          onCreated={newClub => setData(prev => [newClub, ...(prev || [])])}
        />
      )}
    </>
  )
}

// ── Club Detail ──────────────────────────────────────────────────────────

function DiscussionTab({ clubId, accent }) {
  const { data: posts, loading, error, refetch, setData } = useApi(() => get(`/posts/club/${clubId}`), [clubId])
  const [expanded, setExpanded] = useState({})
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyText, setReplyText] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)

  async function submitPost(e) {
    e.preventDefault()
    if (!newTitle.trim() || !newBody.trim()) return
    setPosting(true)
    try {
      const created = await post(`/posts/club/${clubId}`, { title: newTitle, body: newBody })
      setData(prev => [created, ...(prev || [])])
      setNewTitle(''); setNewBody(''); setShowNewPost(false)
    } catch (err) { alert(err.message) }
    finally { setPosting(false) }
  }

  async function toggleReaction(postId, targetType, targetId, emoji) {
    const url = targetType === 'post'
      ? `/posts/${targetId}/react`
      : `/posts/${postId}/replies/${targetId}/react`
    try {
      const res = await post(url, { emoji })
      setData(prev => prev.map(p => {
        if (targetType === 'post' && p.id === targetId) {
          return { ...p, reactions: applyReactionToggle(p.reactions, emoji, res.reacted) }
        }
        if (targetType === 'reply' && p.id === postId) {
          return { ...p, replies: p.replies.map(r =>
            r.id === targetId ? { ...r, reactions: applyReactionToggle(r.reactions, emoji, res.reacted) } : r
          )}
        }
        return p
      }))
    } catch { /* ignore */ }
  }

  async function submitReply(postId) {
    const text = replyText[postId]?.trim()
    if (!text) return
    try {
      const reply = await post(`/posts/${postId}/replies`, { text })
      setData(prev => prev.map(p => p.id === postId
        ? { ...p, replies: [...p.replies, reply], replyCount: p.replyCount + 1 }
        : p
      ))
      setReplyText(r => ({ ...r, [postId]: '' }))
      setReplyingTo(null)
    } catch (err) { alert(err.message) }
  }

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton-block" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-3">
      <button onClick={() => setShowNewPost(s => !s)}
        className="w-full rounded-2xl px-4 py-3 text-left text-sm text-t40 border border-t08 transition-colors hover:border-t15"
        style={{ background: 'var(--bg)' }}>
        Start a discussion…
      </button>

      {showNewPost && (
        <form onSubmit={submitPost} className="rounded-2xl p-4 border border-t12 space-y-3" style={{ background: 'var(--surface)' }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required maxLength={200}
            placeholder="Discussion title" className="input-field" />
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)} required rows={3} maxLength={5000}
            placeholder="What's on your mind?" className="input-field resize-none" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowNewPost(false)} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
            <button type="submit" disabled={posting} className="btn-primary text-sm px-4 py-1.5">{posting ? 'Posting…' : 'Post'}</button>
          </div>
        </form>
      )}

      {!posts?.length && !showNewPost && <EmptyState icon={MessageCircle} title="No discussions yet" sub="Start the first one." />}

      {posts?.map(p => (
        <div key={p.id} className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <div className="flex items-start gap-3 mb-3">
            <Avatar user={p.user} size={32} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{p.user?.displayName}</span>
                <span className="text-xs text-t30 shrink-0">{p.time}</span>
              </div>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text)' }}>{p.title}</p>
            </div>
          </div>
          <p className="text-sm text-t70 leading-relaxed mb-3">{p.body}</p>

          {expanded[p.id] && p.replies.map((r, i) => (
            <div key={i} className="flex gap-2.5 mb-2 pl-4 border-l-2" style={{ borderColor: withAlpha(accent, 19) }}>
              <Avatar user={r.user} size={24} />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-xs" style={{ color: accent }}>{r.user?.displayName}</span>
                <span className="text-xs text-t30 ml-1.5">{r.time}</span>
                <p className="text-sm text-t70 mt-0.5">{r.text}</p>
                {r.reactions !== undefined && (
                  <div className="mt-1.5">
                    <ReactionBar
                      reactions={r.reactions || []}
                      onReact={(emoji) => toggleReaction(p.id, 'reply', r.id, emoji)}
                      compact
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {replyingTo === p.id && (
            <div className="flex gap-2 mt-2">
              <input value={replyText[p.id] || ''} onChange={e => setReplyText(r => ({ ...r, [p.id]: e.target.value }))}
                placeholder="Write a reply…" className="input-field flex-1 text-sm py-2"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitReply(p.id)} />
              <button onClick={() => submitReply(p.id)} className="btn-primary px-3 py-2"><Send size={14} /></button>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-t06 mt-2">
            <ReactionBar
              reactions={p.reactions || []}
              onReact={(emoji) => toggleReaction(p.id, 'post', p.id, emoji)}
            />
            <button onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
              className="flex items-center gap-1.5 text-xs text-t40 hover:text-t70 transition-colors ml-auto">
              <MessageCircle size={12} />
              {p.replyCount > 0 ? `${p.replyCount} ${p.replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
            </button>
            {p.replyCount > 0 && (
              <button onClick={() => { setExpanded(e => ({ ...e, [p.id]: !e[p.id] })); setReplyingTo(p.id) }}
                className="text-xs text-t30 hover:text-t60 transition-colors">
                {expanded[p.id] ? 'Hide' : 'Show'}
              </button>
            )}
            {!expanded[p.id] && (
              <button onClick={() => setReplyingTo(r => r === p.id ? null : p.id)}
                className="text-xs transition-colors"
                style={{ color: replyingTo === p.id ? accent : 'var(--text-30)' }}>
                Reply
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatTab({ clubId, currentUser, accent }) {
  const { data: messages, loading, error, setData, refetch } = useApi(() => get(`/chat/${clubId}`), [clubId])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [hoveredMsg, setHoveredMsg] = useState(null)
  const bottomRef = useRef(null)

  useSocket({
    'chat:message': useCallback((msg) => {
      setData(prev => {
        if (!prev) return [msg]
        // Ignore if already present (dedup with optimistic or prior socket delivery)
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }, [setData]),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const optimistic = { id: Date.now(), text: text.trim(), time: 'just now', user: currentUser, createdAt: new Date().toISOString(), reactions: [] }
    setData(prev => [...(prev || []), optimistic])
    setText('')
    try {
      const saved = await post(`/chat/${clubId}`, { text: optimistic.text })
      setData(prev => prev.map(m => m.id === optimistic.id ? saved : m))
    } catch (err) {
      setData(prev => prev.filter(m => m.id !== optimistic.id))
      setText(optimistic.text)
      alert(err.message)
    } finally { setSending(false) }
  }

  async function toggleChatReaction(msgId, emoji) {
    try {
      const res = await post(`/chat/messages/${msgId}/react`, { emoji })
      setData(prev => prev.map(m => m.id === msgId
        ? { ...m, reactions: applyReactionToggle(m.reactions || [], emoji, res.reacted) }
        : m
      ))
    } catch { /* ignore */ }
  }

  if (loading) return (
    <div className="space-y-3 py-2">
      {[{w:'60%',r:true},{w:'45%',r:false},{w:'70%',r:true},{w:'55%',r:false},{w:'40%',r:true}].map((s,i) => (
        <div key={i} className={`flex items-end gap-2 ${s.r ? 'flex-row-reverse' : ''}`}>
          <div className="w-7 h-7 skeleton-circle shrink-0" />
          <div className="h-9 skeleton-block" style={{ width: s.w, borderRadius: 16 }} />
        </div>
      ))}
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const isMe = (msg) => msg.user?.id === currentUser?.id

  // Group consecutive messages from the same sender
  const msgGroups = []
  messages?.forEach(msg => {
    const last = msgGroups[msgGroups.length - 1]
    if (last && last[0].user?.id === msg.user?.id) last.push(msg)
    else msgGroups.push([msg])
  })

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] sm:h-[520px]">
      <div className="flex-1 overflow-y-auto no-scrollbar py-1" style={{ paddingRight: 2 }}>
        {!messages?.length && <EmptyState icon={MessageCircle} title="No messages yet" sub="Say hello to your clubmates!" />}
        <div className="space-y-2.5">
          {msgGroups.map((group, gi) => {
            const mine = isMe(group[0])
            return (
              <div key={gi} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 shrink-0 self-end mb-1">
                  {!mine && <Avatar user={group[0].user} size={28} />}
                </div>
                <div className={`flex flex-col gap-0.5 max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
                  {!mine && (
                    <p className="text-xs mb-0.5 ml-1 font-medium"
                      style={{ color: group[0].user?.avatarColor || accent }}>
                      {group[0].user?.displayName}
                    </p>
                  )}
                  {group.map((msg, mi) => {
                    const first = mi === 0
                    const last = mi === group.length - 1
                    const r = 18
                    const s = 5
                    const borderRadius = mine
                      ? `${r}px ${first ? r : s}px ${last ? r : s}px ${r}px`
                      : `${first ? r : s}px ${r}px ${r}px ${last ? r : s}px`
                    return (
                      <div key={msg.id}
                        onMouseEnter={() => setHoveredMsg(msg.id)}
                        onMouseLeave={() => setHoveredMsg(null)}>
                        <div className="flex items-center gap-1.5" style={{ flexDirection: mine ? 'row-reverse' : 'row' }}>
                          <div
                            className="px-3.5 py-2 text-sm leading-relaxed"
                            style={{
                              background: mine ? accent : 'var(--surface2)',
                              color: mine ? 'var(--accent-text)' : 'var(--text)',
                              borderRadius,
                              border: mine ? 'none' : '1px solid var(--border-06)',
                            }}>
                            {msg.text}
                          </div>
                          {hoveredMsg === msg.id && (
                            <div className="relative shrink-0">
                              <EmojiPickerPopover
                                onPick={(emoji) => toggleChatReaction(msg.id, emoji)}
                                onClose={() => setHoveredMsg(null)}
                                above
                              />
                            </div>
                          )}
                        </div>
                        {msg.reactions?.length > 0 && (
                          <div className={`mt-1 ${mine ? 'mr-1' : 'ml-1'}`}>
                            <ReactionBar
                              reactions={msg.reactions}
                              onReact={(emoji) => toggleChatReaction(msg.id, emoji)}
                              compact
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <p className={`text-[10px] mt-0.5 text-t25 ${mine ? 'mr-1' : 'ml-1'}`}>
                    {group[group.length - 1].time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 mt-3 pt-3 border-t border-t06">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Message…"
          className="input-field flex-1 text-sm py-2.5" />
        <button type="submit" disabled={!text.trim() || sending}
          className="rounded-xl px-4 py-2.5 transition-opacity disabled:opacity-40"
          style={{ background: accent, color: 'var(--accent-text)' }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}

function MembersTab({ members, currentItem, accent }) {
  if (!members?.length) return <EmptyState icon={Users} title="No members" />
  return (
    <div className="space-y-3">
      {members.map((m, i) => (
        <div key={i} className="flex items-center gap-3">
          <Avatar user={m.user} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{m.user?.displayName}</span>
              {m.role === 'admin' && <span className="badge badge-accent">Admin</span>}
            </div>
            {currentItem && (
              <>
                <div className="mt-1.5"><ProgressBar pct={m.progress} color={accent} /></div>
                <p className="text-xs text-t30 mt-1">{m.progress}% through {currentItem.title}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function PastItemsTab({ items }) {
  if (!items?.length) return <EmptyState icon={Clock} title="No past items yet" sub="Finish your current item to add it here." />
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(item => (
        <div key={item.id} className="rounded-xl overflow-hidden border border-t06">
          <CoverBlock coverUrl={item.coverUrl} coverColor={item.coverColor} type={item.type}
            className="h-20" />
          <div className="p-2.5" style={{ background: 'var(--surface)' }}>
            <p className="text-xs font-medium text-t90 truncate">{item.title}</p>
            <p className="text-xs text-t40 truncate">{item.subtitle}</p>
            {item.avgRating != null && (
              <div className="flex items-center gap-1 mt-1.5">
                <Stars rating={item.avgRating} />
                <span className="text-xs text-t40">{item.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventEditor({ clubId, initial, accent, onSaved, onCancel }) {
  const [dueDate, setDueDate] = useState(initial.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '')
  const [eventLabel, setEventLabel] = useState(initial.eventLabel || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await patch(`/clubs/${clubId}/items/current`, {
        dueDate: dueDate || null,
        eventLabel: eventLabel || null,
      })
      onSaved()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="mt-2 p-2 rounded-lg border border-t08" style={{ background: 'var(--surface2)' }}>
      <div className="flex gap-2 mb-2">
        <input value={eventLabel} onChange={e => setEventLabel(e.target.value)}
          placeholder="Label (e.g. Finish by)" className="input-field flex-1 text-xs py-1" maxLength={100} />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
          className="input-field text-xs py-1 w-32" />
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="flex-1 text-xs py-1 rounded-lg font-medium"
          style={{ background: accent, color: 'var(--bg)' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {initial.dueDate && (
          <button onClick={async () => {
            setSaving(true)
            try { await patch(`/clubs/${clubId}/items/current`, { dueDate: null, eventLabel: null }); onSaved() }
            catch (err) { alert(err.message) }
            finally { setSaving(false) }
          }} className="text-xs py-1 px-2 rounded-lg text-t40 hover:text-t70">Clear</button>
        )}
        <button onClick={onCancel} className="text-xs py-1 px-2 rounded-lg text-t40 hover:text-t70">Cancel</button>
      </div>
    </div>
  )
}

function AddItemModal({ clubId, clubType, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', dueDate: '', eventLabel: '' })
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState(null)
  const [coverLoading, setCoverLoading] = useState(false)
  const coverTimerRef = useRef(null)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    clearTimeout(coverTimerRef.current)
    if (!form.title || clubType === 'podcast') { setCoverUrl(null); return }
    setCoverLoading(true)
    coverTimerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ title: form.title, subtitle: form.subtitle, type: clubType })
        const res = await get(`/cover-art?${params}`)
        setCoverUrl(res.coverUrl || null)
      } catch { setCoverUrl(null) }
      finally { setCoverLoading(false) }
    }, 600)
    return () => clearTimeout(coverTimerRef.current)
  }, [form.title, form.subtitle, clubType])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, type: clubType, coverUrl }
      if (!payload.dueDate) delete payload.dueDate
      if (!payload.eventLabel) delete payload.eventLabel
      const item = await post(`/clubs/${clubId}/items`, payload)
      onAdded(item)
      onClose()
    } catch (err) { alert(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 border border-t08" role="dialog" aria-modal="true" aria-labelledby="add-item-title" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="add-item-title" className="font-display text-lg font-semibold">Set current item</h3>
          <button onClick={onClose} aria-label="Close" className="modal-close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 border border-t08 flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
              {coverLoading
                ? <Spinner size={16} />
                : coverUrl
                  ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                  : <TypeIcon type={clubType} size={20} />}
            </div>
            <div className="flex-1 space-y-3">
              <input value={form.title} onChange={set('title')} required placeholder="Title" className="input-field" />
              <input value={form.subtitle} onChange={set('subtitle')} placeholder="Author / Director / Studio" className="input-field" />
            </div>
          </div>
          <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Description (optional)" className="input-field resize-none" />
          <div className="border-t border-t08 pt-3">
            <p className="text-xs text-t40 mb-2 flex items-center gap-1"><Calendar size={11} /> Target date (optional)</p>
            <div className="flex gap-2">
              <input value={form.eventLabel} onChange={set('eventLabel')} placeholder="e.g. Finish by, Watch party" className="input-field flex-1 text-sm" maxLength={100} />
              <input type="date" value={form.dueDate} onChange={set('dueDate')} className="input-field w-36 text-sm" min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Description (optional)" className="input-field resize-none" />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Setting…' : 'Set as current'}</button>
        </form>
      </div>
    </div>
  )
}

function RateModal({ clubId, itemTitle, onClose, onRated }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit() {
    if (!rating) return
    setLoading(true)
    try {
      await post(`/clubs/${clubId}/rate`, { rating, review })
      onRated()
      onClose()
    } catch (err) { alert(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5 border border-t08" role="dialog" aria-modal="true" aria-label="Rate this item" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg font-semibold mb-1">Rate this item</h3>
        <p className="text-sm text-t50 mb-4 truncate">"{itemTitle}"</p>
        <div className="flex gap-2 justify-center mb-4" role="group" aria-label="Rating">
          {[1,2,3,4,5].map(v => (
            <button key={v} aria-label={`${v} star${v > 1 ? 's' : ''}`} aria-pressed={rating === v}
              onMouseEnter={() => setHover(v)} onMouseLeave={() => setHover(0)} onClick={() => setRating(v)}
              className="focus-ring rounded">
              <Star size={32} fill={(hover || rating) >= v ? 'var(--accent)' : 'none'} stroke={(hover || rating) >= v ? 'var(--accent)' : 'var(--text-30)'} strokeWidth={1.5} />
            </button>
          ))}
        </div>
        <textarea value={review} onChange={e => setReview(e.target.value)} rows={3} maxLength={1000}
          placeholder="Write a review (optional)" className="input-field resize-none mb-3" />
        <button onClick={submit} disabled={!rating || loading} className="btn-primary w-full">
          {loading ? 'Saving…' : 'Save rating'}
        </button>
      </div>
    </div>
  )
}

function ClubDetail({ clubId, currentUser, onBack, pendingSubTab }) {
  const { data: club, loading, error, refetch } = useApi(() => get(`/clubs/${clubId}`), [clubId])
  const [subTab, setSubTab] = useState('discussion')
  const [showAddItem, setShowAddItem] = useState(false)
  const [showRate, setShowRate] = useState(false)
  const [progress, setProgress] = useState(null)
  const [showEventEditor, setShowEventEditor] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pendingSubTab) setSubTab(pendingSubTab.subTab)
  }, [pendingSubTab])

  const accent = club?.accentColor || 'var(--accent)'
  const isAdmin = club?.myRole === 'admin'

  async function updateProgress(val) {
    setProgress(val)
    try { await put(`/clubs/${clubId}/progress`, { progress: val }) }
    catch { /* fire-and-forget; optimistic update already applied */ }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-28 skeleton-block" />
      <div className="h-16 skeleton-block" />
      <div className="h-28 skeleton-block" />
      <div className="flex gap-2">{[...Array(4)].map((_,i) => <div key={i} className="flex-1 h-9 skeleton-block" />)}</div>
      <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-20 skeleton-block" />)}</div>
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const myProgress = progress ?? club?.currentItem?.myProgress ?? 0
  const SUB_TABS = [
    { id: 'discussion', label: 'Discussion', Icon: MessageCircle },
    { id: 'chat',       label: 'Chat',       Icon: MessageSquare },
    { id: 'members',    label: 'Members',    Icon: Users },
    { id: 'past',       label: 'Past',       Icon: Clock },
  ]

  return (
    <div className="fade-up">
      {/* Back + club identity row */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-t50 hover:text-t80 transition-colors">
          <ArrowLeft size={15} /> All clubs
        </button>
        {isAdmin && (
          <button onClick={() => setShowAddItem(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
            <Plus size={12} /> Set item
          </button>
        )}
      </div>

      {/* Club identity card */}
      <div className="rounded-2xl p-4 mb-3 border border-t06" style={{ background: club?.bgColor || 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'var(--surface2)' }}>
            {club?.emoji}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-fs-xl font-bold leading-tight truncate" style={{ color: 'var(--text)' }}>
              {club?.name}
            </h2>
            <p className="text-xs text-t40 mt-0.5 capitalize">{club?.memberCount} members · {club?.type}s</p>
          </div>
        </div>
      </div>

      {/* Current item hero */}
      {club?.currentItem ? (
        <div className="rounded-2xl overflow-hidden mb-4 border border-t06" style={{ background: 'var(--surface)' }}>
          {/* Gradient banner */}
          <div className="h-20 relative" style={{ background: 'var(--gradient-warm)', opacity: 0.85 }} />

          <div className="px-4 pb-4" style={{ marginTop: -32 }}>
            <div className="flex items-end gap-4">
              {/* Cover block — overlaps the banner */}
              <div className="w-14 h-20 rounded-xl flex items-center justify-center shrink-0 border border-t08"
                style={{ background: club.currentItem.coverColor || 'var(--surface2)', boxShadow: 'var(--shadow-md)' }}>
                <TypeIcon type={club.type} size={20} />
              </div>
              <div className="flex-1 min-w-0 pt-9">
                <p className="text-[10px] font-medium uppercase tracking-wide text-t40 mb-0.5">Now {club.type === 'book' ? 'reading' : club.type === 'film' ? 'watching' : club.type === 'game' ? 'playing' : 'listening'}</p>
                <p className="font-display font-semibold text-fs-md leading-tight truncate" style={{ color: 'var(--text)' }}>{club.currentItem.title}</p>
                <p className="text-xs text-t50 truncate">{club.currentItem.subtitle}</p>
              </div>
            </div>

            {/* Due date countdown */}
            {club.currentItem.dueDate && (() => {
              const days = daysUntil(club.currentItem.dueDate)
              const label = club.currentItem.eventLabel || 'Due'
              const urgent = days !== null && days <= 3
              const overdue = days !== null && days < 0
              return (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: overdue ? '#ef444420' : urgent ? '#f9731620' : 'var(--accent-12)',
                    color: overdue ? '#ef4444' : urgent ? '#f97316' : 'var(--accent)' }}>
                  <Calendar size={10} />
                  {overdue
                    ? `${label} — ${Math.abs(days)}d overdue`
                    : days === 0
                      ? `${label} — today!`
                      : `${label} — ${days}d left`}
                </div>
              )
            })()}
            {isAdmin && !showEventEditor && (
              <button onClick={() => setShowEventEditor(true)}
                className="mt-1 block text-xs text-t30 hover:text-t60 transition-colors">
                {club.currentItem.dueDate ? 'Edit target date' : '+ Set target date'}
              </button>
            )}
            {isAdmin && showEventEditor && (
              <EventEditor
                clubId={clubId}
                initial={{ dueDate: club.currentItem.dueDate, eventLabel: club.currentItem.eventLabel }}
                accent="var(--accent)"
                onSaved={() => { setShowEventEditor(false); refetch() }}
                onCancel={() => setShowEventEditor(false)}
              />
            )}

            {/* Member avatar stack */}
            {club.members?.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-2">
                  {club.members.slice(0, 5).map((m, i) => (
                    <div key={i} style={{ zIndex: 5 - i }}>
                      <Avatar user={m.user} size={22} />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-t40">{club.memberCount} reading along</span>
              </div>
            )}

            {/* Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-t40">My progress</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{myProgress}%</span>
              </div>
              <input type="range" min={0} max={100} value={myProgress} onChange={e => updateProgress(Number(e.target.value))}
                className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>

            <button onClick={() => setShowRate(true)}
              className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
              Rate this item
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-4 text-center border border-t06" style={{ background: 'var(--surface)' }}>
          <p className="text-sm text-t40">No current item set.</p>
          {isAdmin && (
            <button onClick={() => setShowAddItem(true)} className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
              Add one
            </button>
          )}
        </div>
      )}

      {/* Sub-tabs */}
      <div role="tablist" className="flex gap-1 mb-4 p-1 rounded-xl border border-t06" style={{ background: 'var(--surface)' }}>
        {SUB_TABS.map(({ id, label, Icon }) => (
          <button key={id} role="tab" aria-selected={subTab === id} onClick={() => setSubTab(id)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition-all focus-ring"
            style={subTab === id
              ? { background: 'var(--accent)', color: 'var(--accent-text)' }
              : { color: 'var(--text-50)' }}>
            <Icon size={11} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {subTab === 'discussion' && <DiscussionTab clubId={clubId} accent="var(--accent)" myUserId={currentUser?.id} />}
      {subTab === 'chat' && <ChatTab clubId={clubId} currentUser={currentUser} accent="var(--accent)" />}
      {subTab === 'members' && <MembersTab members={club?.members} currentItem={club?.currentItem} accent="var(--accent)" />}
      {subTab === 'past' && <PastItemsTab items={club?.pastItems} accent="var(--accent)" />}

      {showAddItem && (
        <AddItemModal clubId={clubId} clubType={club?.type} onClose={() => setShowAddItem(false)} onAdded={() => { setShowAddItem(false); refetch() }} />
      )}
      {showRate && club?.currentItem && (
        <RateModal clubId={clubId} itemTitle={club.currentItem.title} onClose={() => setShowRate(false)} onRated={refetch} />
      )}
    </div>
  )
}

// ── Discover ──────────────────────────────────────────────────────────────

const TYPE_COLOR = { book: 'var(--color-book)', film: 'var(--color-film)', podcast: 'var(--color-podcast)', game: 'var(--color-game)' }

function FeaturedCarousel({ clubs, onJoin }) {
  const [idx, setIdx] = useState(0)
  const [joined, setJoined] = useState({})
  const [joining, setJoining] = useState(null)
  const touchX = useRef(null)
  const featured = clubs?.slice(0, 4) || []
  if (!featured.length) return null

  const accent = (featured[idx]?.accentColor) || TYPE_COLOR[featured[idx]?.type] || 'var(--accent)'

  async function handleJoin(club) {
    if (joined[club.id]) return
    setJoining(club.id)
    try { await post(`/clubs/${club.id}/join`, {}); setJoined(j => ({ ...j, [club.id]: true })); onJoin?.() }
    catch { /* join failure is silent */ } finally { setJoining(null) }
  }

  const prev = () => setIdx(i => (i - 1 + featured.length) % featured.length)
  const next = () => setIdx(i => (i + 1) % featured.length)
  const onTouchStart = e => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = e => {
    if (touchX.current == null) return
    const dx = touchX.current - e.changedTouches[0].clientX
    if (dx > 50) next(); else if (dx < -50) prev()
    touchX.current = null
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl select-none">
        <div
          className="flex"
          style={{ transform: `translateX(-${idx * 100}%)`, transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {featured.map(c => {
            const a = c.accentColor || TYPE_COLOR[c.type] || 'var(--accent)'
            const isJoined = joined[c.id]
            const isJoining = joining === c.id
            return (
              <div key={c.id} className="min-w-full rounded-2xl overflow-hidden border border-t06"
                style={{ background: 'var(--surface2)' }}>
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${a}, ${a}40)` }} />
                <div className="p-5" style={{ background: `linear-gradient(135deg, ${a}20 0%, ${a}06 100%)` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                      style={{ background: `${a}18`, border: `1px solid ${a}28` }}>
                      {c.emoji}
                    </div>
                    {isJoined ? (
                      <span className="badge badge-success"><Check size={11} />Joined</span>
                    ) : (
                      <button onClick={() => handleJoin(c)} disabled={isJoining}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                        style={{ background: a, color: '#fff' }}>
                        {isJoining ? '…' : 'Join'}
                      </button>
                    )}
                  </div>
                  <h2 className="font-display text-xl font-bold text-themed mb-2 leading-tight">{c.name}</h2>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${a}18`, color: a }}>
                      <TypeIcon type={c.type} size={11} />
                      <span className="capitalize">{c.type}</span>
                    </span>
                    <span className="text-xs text-t40">{c.memberCount} members</span>
                  </div>
                  {c.description && (
                    <p className="text-sm text-t60 leading-relaxed line-clamp-2 mb-4">{c.description}</p>
                  )}
                  {c.currentItem && (
                    <div className="flex items-center gap-2 pt-3 border-t border-t06">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: `${a}18` }}>
                        <TypeIcon type={c.type} size={10} />
                      </div>
                      <p className="text-xs text-t50 truncate">
                        Now: <span className="text-t70 font-medium">{c.currentItem.title}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {featured.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hidden sm:flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity focus-ring"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-08)' }}>
              <ChevronLeft size={16} className="text-themed" aria-hidden="true" />
            </button>
            <button onClick={next} aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hidden sm:flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity focus-ring"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-08)' }}>
              <ChevronRight size={16} className="text-themed" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {featured.length > 1 && (
        <div className="flex justify-center gap-1.5" role="group" aria-label="Carousel slides">
          {featured.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === idx ? 'true' : undefined}
              className="rounded-full transition-all duration-300 focus-ring"
              style={{ width: i === idx ? 20 : 6, height: 6, background: i === idx ? accent : 'var(--border-12)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

function DiscoverClubCard({ club, onJoin }) {
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const accent = club.accentColor || TYPE_COLOR[club.type] || 'var(--accent)'

  async function handleJoin() {
    setJoining(true)
    try { await post(`/clubs/${club.id}/join`, {}); setJoined(true); onJoin?.() }
    catch { /* join failure is silent */ } finally { setJoining(false) }
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-t06 flex flex-col stagger-item card-hover" style={{ background: 'var(--surface)' }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}40)` }} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${accent}15` }}>
              {club.emoji}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-themed truncate">{club.name}</p>
              <p className="text-xs text-t40 flex items-center gap-1 mt-0.5">
                <TypeIcon type={club.type} size={11} />
                <span>{club.memberCount} members</span>
              </p>
            </div>
          </div>
          {joined ? (
            <span className="badge badge-success shrink-0"><Check size={11} />Joined</span>
          ) : (
            <button onClick={handleJoin} disabled={joining}
              className="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-opacity disabled:opacity-50"
              style={{ background: `${accent}15`, color: accent }}>
              {joining ? '…' : 'Join'}
            </button>
          )}
        </div>
        {club.description && (
          <p className="text-xs text-t50 leading-relaxed line-clamp-2">{club.description}</p>
        )}
        {club.currentItem && (
          <div className="text-xs text-t40 flex items-center gap-1.5 pt-1 border-t border-t06">
            <TypeIcon type={club.type} size={11} />
            <span className="truncate">Now: <span className="text-t60">{club.currentItem.title}</span></span>
          </div>
        )}
      </div>
    </div>
  )
}

function DiscoverSection({ label, icon, clubs, onJoin }) {
  if (!clubs?.length) return null
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-themed">{label}</h3>
        <span className="text-xs text-t30 ml-auto">{clubs.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {clubs.map(c => <DiscoverClubCard key={c.id} club={c} onJoin={onJoin} />)}
      </div>
    </div>
  )
}

function Discover({ onSelectClub: _onSelectClub }) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const { data, loading, error, refetch } = useApi(() => get('/discover'))
  const timerRef = useRef(null)

  function handleSearch(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)
    if (!q.trim()) { setSearchResults(null); return }
    setSearching(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await get(`/search?q=${encodeURIComponent(q)}`)
        setSearchResults(res)
      } catch { setSearchResults({ users: [], clubs: [], items: [] }) }
      finally { setSearching(false) }
    }, 300)
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-12 skeleton-block" />
      {[0,1,2].map(i => <div key={i} className="h-36 skeleton-block" />)}
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const hasSearch = query.trim().length > 0
  const totalSearchResults = searchResults
    ? searchResults.clubs.length + searchResults.users.length + searchResults.items.length
    : 0

  return (
    <div className="space-y-5">
      {/* Integrated search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-t40 pointer-events-none" />
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search clubs, people, or items…"
          className="input-field pl-10 pr-10"
          style={{ background: 'var(--surface)' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setSearchResults(null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-t30 hover:text-t60 transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Search results */}
      {hasSearch && (
        <div className="space-y-4">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
          )}
          {!searching && searchResults && !totalSearchResults && (
            <EmptyState icon={Search} title={`No results for "${query}"`} sub="Try different words or check spelling." />
          )}
          {!searching && searchResults?.clubs?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-t30 mb-2">Clubs</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.clubs.map(c => <DiscoverClubCard key={c.id} club={c} onJoin={refetch} />)}
              </div>
            </div>
          )}
          {!searching && searchResults?.users?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-t30 mb-2">People</p>
              <div className="space-y-2">
                {searchResults.users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl p-3 border border-t06" style={{ background: 'var(--surface)' }}>
                    <Avatar user={u} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-themed truncate">{u.displayName}</p>
                      <p className="text-xs text-t40 truncate">@{u.username}{u.bio ? ` · ${u.bio.slice(0, 50)}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!searching && searchResults?.items?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-t30 mb-2">Items</p>
              <div className="space-y-2">
                {searchResults.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 border border-t06" style={{ background: 'var(--surface)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${item.clubColor || 'var(--accent)'}20` }}>
                      <TypeIcon type={item.type} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-themed truncate">{item.title}</p>
                      <p className="text-xs text-t40 truncate">{item.subtitle} · {item.clubName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discovery sections — only show when not searching */}
      {!hasSearch && (
        <>
          {/* Featured carousel for trending clubs */}
          {data?.trending?.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
                  <TrendingUp size={13} />
                </div>
                <h3 className="text-sm font-semibold text-themed">Trending</h3>
              </div>
              <FeaturedCarousel clubs={data.trending} onJoin={refetch} />
              {/* Remaining trending clubs not in carousel */}
              {data.trending.length > 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.trending.slice(4).map(c => <DiscoverClubCard key={c.id} club={c} onJoin={refetch} />)}
                </div>
              )}
            </>
          ) : (
            <EmptyState icon={Compass} title="No clubs to discover yet" sub="Be the first — create a public club!" />
          )}

          <DiscoverSection
            label="For You"
            icon={<Star size={13} />}
            clubs={data?.forYou}
            onJoin={refetch}
          />
          <DiscoverSection
            label="New Clubs"
            icon={<Plus size={13} />}
            clubs={data?.newClubs}
            onJoin={refetch}
          />

          {data?.people?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
                  <Users size={13} />
                </div>
                <h3 className="text-sm font-semibold text-themed">People in your clubs</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.people.map(u => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl p-3 border border-t06" style={{ background: 'var(--surface)' }}>
                    <Avatar user={u} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-themed truncate">{u.displayName}</p>
                      <p className="text-xs text-t40 truncate">@{u.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!data?.trending?.length && !data?.forYou?.length && !data?.newClubs?.length && data?.trending !== undefined && (
            <EmptyState icon={Compass} title="All caught up!" sub="You've joined all available clubs. Try creating one." />
          )}
        </>
      )}
    </div>
  )
}

// ── Leaderboard ───────────────────────────────────────────────────────────

function Leaderboard() {
  const [period, setPeriod] = useState('month')
  const { data, loading, error, refetch } = useApi(() => get(`/leaderboard?period=${period}`), [period])

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton-block" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const { entries = [], myRank, myScore } = data || {}
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const PERIODS = ['week', 'month', 'all']
  const maxScore = entries[0]?.score || 1

  // silver → bronze → gold so gold "crowns" last
  const podiumDelays = [0, 300, 150]

  return (
    <div>
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit mx-auto" style={{ background: 'var(--surface)' }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all active:scale-[0.97]"
            style={period === p ? { background: 'var(--accent)', color: 'var(--accent-text)' } : { color: 'var(--text-50)' }}>
            {p === 'all' ? 'All time' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {!entries.length && (
        <EmptyState icon={Trophy} title="No entries yet"
          sub="Rate items you've finished to earn points and appear here." />
      )}

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            const heights = [80, 104, 64]
            const medals = ['🥈', '🥇', '🥉']
            const isGold = i === 1
            return (
              <div key={entry.id} className="flex flex-col items-center gap-2"
                style={{ animation: `podiumRise 0.55s var(--ease-spring) ${podiumDelays[i]}ms both` }}>
                <Avatar user={entry} size={isGold ? 52 : 42} />
                <p className="text-xs font-semibold text-center text-t90 truncate max-w-[72px]">{entry.displayName.split(' ')[0]}</p>
                <div className="w-20 rounded-t-xl flex flex-col items-center justify-center relative"
                  style={{
                    height: heights[i],
                    background: isGold ? 'var(--accent-15)' : 'var(--surface-06)',
                    border: `1px solid ${isGold ? 'var(--accent-25)' : 'var(--border-08)'}`,
                    boxShadow: isGold ? '0 0 24px var(--accent-12)' : 'none',
                  }}>
                  <span className="text-xl absolute -top-3.5">{medals[i]}</span>
                  <span className="text-sm font-bold mt-4" style={{ color: isGold ? 'var(--accent)' : 'var(--text-70)' }}>{entry.score}</span>
                  <span className="text-[10px] text-t30">pts</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Ranked table */}
      <div className="space-y-2">
        {rest.map((entry, idx) => {
          const pct = Math.max(4, Math.round((entry.score / maxScore) * 100))
          return (
            <div key={entry.id} className="relative overflow-hidden rounded-xl border border-t06 card-hover"
              style={{ background: 'var(--surface)', animation: `fadeUp var(--duration-base) var(--ease-out) ${idx * 35}ms both` }}>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span className="text-sm font-semibold w-6 text-center text-t40">#{entry.rank}</span>
                <Avatar user={entry} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-t90 truncate">{entry.displayName}</p>
                  <p className="text-xs text-t40">{entry.finished} items</p>
                </div>
                {entry.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[#E87070]"
                    style={{ animation: 'flameFlicker 1.2s ease-in-out infinite' }}>
                    <Flame size={12} fill="#E87070" /> {entry.streak}
                  </div>
                )}
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{entry.score}</span>
              </div>
              {/* Score bar */}
              <div className="h-[3px]" style={{ background: 'var(--border-06)' }}>
                <div className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: 'var(--accent)',
                    opacity: 0.45,
                    transformOrigin: 'left',
                    animation: `scoreBarFill 0.55s var(--ease-out) ${idx * 35 + 180}ms both`,
                  }} />
              </div>
            </div>
          )
        })}
      </div>

      {myRank > 10 && (
        <div className="mt-4 rounded-xl px-4 py-3 text-center border border-[#E8A020]/20" style={{ background: 'var(--accent-06)' }}>
          <p className="text-sm text-t60">You're ranked <span style={{ color: 'var(--accent)' }}>#{myRank}</span> with {myScore} points</p>
          <p className="text-xs text-t30 mt-0.5">Keep engaging to climb the board!</p>
        </div>
      )}
    </div>
  )
}

// ── Analytics ─────────────────────────────────────────────────────────────

const LEVEL_COLORS = ['var(--border-06)', 'var(--accent2-12)', 'rgba(61,191,189,0.35)', 'rgba(61,191,189,0.65)', 'var(--accent2)']

const TYPE_RAW_COLORS = { book: '#C47D5A', film: '#6B8DD6', podcast: '#3DBFBD', game: '#9B6DB5' }

function downloadWrapUp(wrapup) {
  const W = 600, H = 380
  const canvas = document.createElement('canvas')
  canvas.width = W * 2
  canvas.height = H * 2
  const ctx = canvas.getContext('2d')
  ctx.scale(2, 2)

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0F1923')
  bg.addColorStop(1, '#162030')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Top accent bar
  const strip = ctx.createLinearGradient(0, 0, W, 0)
  strip.addColorStop(0, '#E8A020')
  strip.addColorStop(1, '#D4651A')
  ctx.fillStyle = strip
  ctx.fillRect(0, 0, W, 5)

  // Title
  ctx.fillStyle = '#F5F0E8'
  ctx.font = 'bold 26px Georgia, serif'
  ctx.fillText(`Your ${wrapup.year} in Review`, 40, 54)
  ctx.fillStyle = 'rgba(245,240,232,0.45)'
  ctx.font = '13px sans-serif'
  ctx.fillText('Hobbyist · Year Wrap-Up', 40, 74)

  // Stat cards
  const stats = [
    { val: String(wrapup.thisYear), label: 'Finished this year', color: '#E8A020' },
    { val: String(wrapup.longestStreak), label: 'Day streak', color: '#3DBFBD' },
    { val: wrapup.topRated ? wrapup.topRated.title.slice(0, 18) : '—', label: 'Top rated', color: TYPE_RAW_COLORS[wrapup.topRated?.type] || '#C47D5A' },
    { val: wrapup.topTypeThisYear ? wrapup.topTypeThisYear.charAt(0).toUpperCase() + wrapup.topTypeThisYear.slice(1) + 's' : '—', label: 'Favourite type', color: TYPE_RAW_COLORS[wrapup.topTypeThisYear] || '#6B8DD6' },
  ]

  stats.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2)
    const x = 40 + col * 280, y = 102 + row * 120

    ctx.fillStyle = 'rgba(245,240,232,0.05)'
    ctx.beginPath()
    ctx.roundRect(x, y, 255, 100, 10)
    ctx.fill()

    ctx.fillStyle = s.color
    const fontSize = s.val.length > 10 ? 18 : 28
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillText(s.val, x + 16, y + 44)

    ctx.fillStyle = 'rgba(245,240,232,0.45)'
    ctx.font = '12px sans-serif'
    ctx.fillText(s.label, x + 16, y + 66)
  })

  // Footer
  ctx.fillStyle = 'rgba(245,240,232,0.2)'
  ctx.font = '11px sans-serif'
  ctx.fillText('hobbyist.app', W - 100, H - 18)

  const a = document.createElement('a')
  a.download = `hobbyist-${wrapup.year}-wrap.png`
  canvas.toBlob(blob => {
    a.href = URL.createObjectURL(blob)
    a.click()
    URL.revokeObjectURL(a.href)
  })
}

function Analytics() {
  const { data, loading, error, refetch } = useApi(() => get('/analytics'))

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton-block" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const { summary, monthly, types, heatmap, recentRatings, yearlyWrapup } = data || {}

  const maxMonthly = Math.max(...(monthly || []).map(m => m.total), 1)
  const TYPE_COLORS = { book: 'var(--color-book)', film: 'var(--color-film)', podcast: 'var(--color-podcast)', game: 'var(--color-game)' }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Finished', val: summary?.finished ?? 0, color: 'var(--accent)' },
          { label: 'Avg rating', val: summary?.avgRating ? `${summary.avgRating}★` : '—', color: 'var(--accent2)' },
          { label: 'Clubs', val: summary?.clubs ?? 0, color: 'var(--color-film)' },
          { label: 'This year', val: summary?.thisYear ?? 0, color: 'var(--color-book)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-t06 stagger-item card-hover" style={{ background: 'var(--surface)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-t40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly stacked bar chart */}
      {monthly?.length > 0 && (
        <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-t80">Activity (last 6 months)</h3>
            <div className="flex items-center gap-3">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-t35 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-28">
            {monthly.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse overflow-hidden rounded-t-sm"
                  style={{ height: `${(m.total / maxMonthly) * 100}%`, minHeight: m.total > 0 ? 4 : 0 }}>
                  {['game', 'podcast', 'film', 'book'].map(type => (
                    m[type] > 0 ? <div key={type} style={{ flex: m[type], background: TYPE_COLORS[type] }} /> : null
                  ))}
                </div>
                <span className="text-xs text-t30">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type donut */}
      {types?.some(t => t.count > 0) && (
        <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-t80 mb-4">By media type</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full shrink-0" style={{
              background: `conic-gradient(${types.map((t, i, arr) => {
                const start = arr.slice(0, i).reduce((s, x) => s + x.pct, 0)
                return `${TYPE_COLORS[t.type] || 'var(--accent)'} ${start}% ${start + t.pct}%`
              }).join(', ')})`
            }}>
              <div className="w-full h-full rounded-full" style={{ margin: '14px', width: 'calc(100% - 28px)', height: 'calc(100% - 28px)', background: 'var(--surface)' }} />
            </div>
            <div className="space-y-2 flex-1">
              {types.filter(t => t.count > 0).map(t => (
                <div key={t.type} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[t.type] }} />
                  <span className="text-xs text-t60 capitalize flex-1">{t.type}s</span>
                  <span className="text-xs font-medium text-t80">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      {heatmap?.length > 0 && (
        <div className="rounded-2xl p-4 border border-t06 overflow-x-auto" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-t80">Activity heatmap</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-t30 mr-1">Less</span>
              {LEVEL_COLORS.map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />)}
              <span className="text-xs text-t30 ml-1">More</span>
            </div>
          </div>
          <div className="flex gap-1 no-scrollbar">
            {heatmap.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div key={di} title={`${day.date}: ${day.count} activities`}
                    className="w-2.5 h-2.5 rounded-sm transition-all"
                    style={{ background: LEVEL_COLORS[Math.min(day.count, 4)] }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year in Review */}
      {yearlyWrapup && (
        <div className="rounded-2xl overflow-hidden border border-t06">
          <div className="px-4 pt-4 pb-3" style={{ background: 'var(--gradient-warm)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--accent-text)' }}>{yearlyWrapup.year} · Year in Review</p>
                <h3 className="font-display text-lg font-bold mt-0.5" style={{ color: 'var(--accent-text)' }}>Your Reading Year</h3>
              </div>
              <button
                onClick={() => downloadWrapUp(yearlyWrapup)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(15,25,35,0.25)', color: 'var(--accent-text)' }}>
                <Download size={12} />
                Save
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y" style={{ background: 'var(--surface)', borderColor: 'var(--border-08)' }}>
            {[
              { val: yearlyWrapup.thisYear, label: 'Finished', color: 'var(--accent)' },
              { val: yearlyWrapup.longestStreak, label: 'Day streak', color: 'var(--accent2)' },
              { val: yearlyWrapup.topTypeThisYear ? yearlyWrapup.topTypeThisYear.charAt(0).toUpperCase() + yearlyWrapup.topTypeThisYear.slice(1) + 's' : '—', label: 'Fave type', color: TYPE_COLORS[yearlyWrapup.topTypeThisYear] || 'var(--accent)' },
              { val: yearlyWrapup.topRated?.title || '—', label: 'Top rated', color: TYPE_COLORS[yearlyWrapup.topRated?.type] || 'var(--color-book)', truncate: true },
            ].map(s => (
              <div key={s.label} className="p-4" style={{ borderColor: 'var(--border-08)' }}>
                <p className={`text-xl font-bold ${s.truncate ? 'truncate' : ''}`} style={{ color: s.color }}>{s.val}</p>
                <p className="text-xs text-t40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {yearlyWrapup.topRated && (
            <div className="px-4 py-3 flex items-center gap-3 border-t border-t08" style={{ background: 'var(--surface)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: withAlpha(TYPE_RAW_COLORS[yearlyWrapup.topRated.type] || '#E8A020', 25) }}>
                <TypeIcon type={yearlyWrapup.topRated.type} size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-t50">Your top rated of {yearlyWrapup.year}</p>
                <p className="text-sm font-semibold text-t90 truncate">{yearlyWrapup.topRated.title}</p>
              </div>
              <Stars rating={yearlyWrapup.topRated.rating} />
            </div>
          )}
        </div>
      )}

      {/* Recent ratings */}
      {recentRatings?.length > 0 && (
        <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-t80 mb-3">Recent ratings</h3>
          <div className="space-y-3">
            {recentRatings.map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: withAlpha(TYPE_RAW_COLORS[r.type] || '#E8A020', 19) }}>
                  <TypeIcon type={r.type} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-t90 truncate">{r.title}</p>
                  <p className="text-xs text-t40 truncate">{r.subtitle}</p>
                </div>
                <Stars rating={r.rating} />
              </div>
            ))}
          </div>
        </div>
      )}

      {(!recentRatings?.length && !summary?.finished) && (
        <EmptyState icon={BarChart2} title="No data yet" sub="Rate items you've finished to build your stats." />
      )}
    </div>
  )
}

// ── Achievement Toast ──────────────────────────────────────────────────────

function AchievementToast({ achievement, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--accent)',
        boxShadow: 'var(--elevation-3)',
        animation: 'fadeUp var(--duration-base) var(--ease-out) forwards',
        minWidth: '220px',
      }}>
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{achievement.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Achievement Unlocked!</p>
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{achievement.name}</p>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss" className="modal-close shrink-0" style={{ color: 'var(--text-30)' }}>
        <X size={14} />
      </button>
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────────────

const SOURCE_META = {
  letterboxd: { label: 'Letterboxd', color: '#00AC34',           Icon: Film },
  goodreads:  { label: 'Goodreads',  color: '#C16B27',           Icon: BookOpen },
  manual:     { label: 'Manual',     color: 'var(--accent)',      Icon: Upload },
  club:       { label: 'Clubs',      color: 'var(--color-film)',  Icon: Users },
}

function Profile({ onLogout }) {
  const { user, updateUser } = useAuth()
  const { data: me, loading, error, refetch: refetchMe } = useApi(() => get('/users/me'))
  const { data: analytics, refetch: refetchAnalytics } = useApi(() => get('/analytics'))
  const { data: achievementsData } = useApi(() => get('/achievements'))
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [toastQueue, setToastQueue] = useState([])
  const [activeToast, setActiveToast] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (me) setForm({ displayName: me.displayName, bio: me.bio || '' })
  }, [me])

  useEffect(() => {
    if (!achievementsData) return
    const newOnes = achievementsData.achievements.filter(a => a.isNew)
    if (newOnes.length > 0) {
      setToastQueue(newOnes)
      post('/achievements/seen')
    }
  }, [achievementsData])

  useEffect(() => {
    if (activeToast || toastQueue.length === 0) return
    const [next, ...rest] = toastQueue
    setActiveToast(next)
    setToastQueue(rest)
  }, [toastQueue, activeToast])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await put('/users/me', form)
      updateUser(updated)
      setEditing(false)
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border border-t06" style={{ background: 'var(--surface)' }}>
        <div className="h-24 skeleton-block" style={{ borderRadius: 0 }} />
        <div className="px-4 pb-4 pt-10 space-y-2">
          <div className="h-5 w-40 skeleton-block" />
          <div className="h-3.5 w-56 skeleton-block" />
        </div>
      </div>
      <div className="h-28 skeleton-block" />
      <div className="h-20 skeleton-block" />
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetchMe} />

  const profile = me || user
  const INTEREST_MAP = { book: { label: 'Books' }, film: { label: 'Films' }, podcast: { label: 'Podcasts' }, game: { label: 'Games' } }
  const importSources = analytics?.importSources || {}

  return (
    <div className="space-y-4">
      {/* Banner + identity card */}
      <div className="rounded-2xl overflow-hidden border border-t06" style={{ background: 'var(--surface)' }}>
        {/* Gradient banner */}
        <div className="relative h-24" style={{ background: 'var(--gradient-warm)' }}>
          <button onClick={() => setEditing(e => !e)}
            className="absolute top-3 right-3 rounded-xl p-2 transition-colors"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}>
            <Settings size={14} style={{ color: 'rgba(255,255,255,0.85)' }} />
          </button>
        </div>

        {/* Avatar overlapping banner */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between" style={{ marginTop: '-28px', marginBottom: '12px' }}>
            <div className="rounded-full p-1" style={{ background: 'var(--surface)', boxShadow: 'var(--elevation-2)' }}>
              <Avatar user={profile} size={56} />
            </div>
          </div>

          <h2 className="font-display text-fs-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>{profile?.displayName}</h2>
          <p className="text-sm text-t40 mb-1">@{profile?.username}</p>
          {profile?.bio && <p className="text-sm text-t60 leading-relaxed">{profile.bio}</p>}

          {/* Interests inline */}
          {profile?.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.interests.map(id => {
                const info = INTEREST_MAP[id] || { label: id }
                return <span key={id} className="badge badge-accent">{info.label}</span>
              })}
            </div>
          )}

          {editing && (
            <form onSubmit={saveProfile} className="space-y-3 pt-4 border-t border-t08 mt-4">
              <div>
                <label className="block text-xs text-t50 mb-1">Display name</label>
                <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs text-t50 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} maxLength={300} className="input-field text-sm resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1 text-sm py-1.5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm py-1.5">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 border-t border-t08">
          {[
            { val: analytics?.summary?.finished ?? me?.stats?.finished ?? 0, label: 'Finished' },
            { val: me?.stats?.clubs ?? 0, label: 'Clubs' },
            { val: analytics?.summary?.avgRating ? `${analytics.summary.avgRating}★` : '—', label: 'Avg rating' },
          ].map((s, i) => (
            <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-t08' : ''}`}>
              <p className="text-fs-xl font-bold font-display" style={{ color: 'var(--accent)' }}>{s.val}</p>
              <p className="text-fs-xs text-t40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {achievementsData?.achievements?.length > 0 && (
        <div className="rounded-2xl border border-t06 overflow-hidden" style={{ background: 'var(--surface)' }}>
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-fs-sm font-semibold text-t80">Achievements</h3>
            <p className="text-fs-xs text-t40 mt-0.5">
              {achievementsData.achievements.filter(a => a.earned).length} / {achievementsData.achievements.length} earned
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4">
            {achievementsData.achievements.map(a => (
              <div key={a.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all"
                style={{
                  background: a.earned ? 'var(--accent-12)' : 'var(--surface2)',
                  borderColor: a.earned ? 'var(--accent-20)' : 'transparent',
                  opacity: a.earned ? 1 : 0.45,
                }}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{a.emoji}</span>
                <div className="min-w-0">
                  <p className="text-fs-xs font-semibold truncate" style={{ color: a.earned ? 'var(--text)' : 'var(--text-50)' }}>{a.name}</p>
                  <p className="text-[10px] leading-tight mt-0.5 truncate" style={{ color: 'var(--text-40)' }}>{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Import history */}
      <div className="rounded-2xl border border-t06 overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h3 className="text-fs-sm font-semibold text-t80">Import history</h3>
            {analytics?.summary?.imported > 0 && (
              <p className="text-fs-xs text-t40 mt-0.5">
                {analytics.summary.imported} items from external platforms
              </p>
            )}
          </div>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
            <Plus size={12} /> Import
          </button>
        </div>

        {Object.keys(importSources).length > 0 ? (
          <div className="divide-y divide-t06">
            {Object.entries(importSources).map(([source, count]) => {
              const meta = SOURCE_META[source] || { label: source, color: 'var(--accent)', Icon: Upload }
              const SrcIcon = meta.Icon
              return (
                <div key={source} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-1.5" style={{ background: meta.color + '20' }}>
                      <SrcIcon size={13} style={{ color: meta.color }} />
                    </div>
                    <span className="text-fs-sm font-medium text-t80">{meta.label}</span>
                  </div>
                  <span className="text-fs-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: meta.color + '18', color: meta.color }}>
                    {count} items
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-fs-sm text-t30 text-center px-4 py-5">
            No imports yet. Bring in your Letterboxd or Goodreads history.
          </p>
        )}
      </div>

      {/* Recent ratings */}
      {analytics?.recentRatings?.length > 0 && (
        <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-t80 mb-3">Recently rated</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {analytics.recentRatings.filter(r => r.rating != null).map(r => {
              const color = { book: 'var(--color-book)', film: 'var(--color-film)', podcast: 'var(--color-podcast)', game: 'var(--color-game)' }[r.type] || 'var(--accent)'
              const sourceMeta = SOURCE_META[r.source]
              return (
                <div key={r.id} className="shrink-0 w-28 rounded-xl overflow-hidden border border-t06">
                  <div className="h-20 flex items-center justify-center relative" style={{ background: withAlpha(color, 19) }}>
                    <TypeIcon type={r.type} size={20} />
                    {sourceMeta && r.source !== 'club' && (
                      <div className="absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ background: sourceMeta.color + '30', color: sourceMeta.color }}>
                        {sourceMeta.label}
                      </div>
                    )}
                  </div>
                  <div className="p-2" style={{ background: 'var(--bg)' }}>
                    <p className="text-xs font-medium truncate text-t90">{r.title}</p>
                    <Stars rating={r.rating} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sign out */}
      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm text-[#E87070]/70 hover:text-[#E87070] border border-[#E87070]/20 hover:border-[#E87070]/40 transition-all"
        style={{ background: 'rgba(232,112,112,0.05)' }}>
        <LogOut size={15} /> Sign out
      </button>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => { refetchAnalytics() }}
        />
      )}

      {/* Achievement unlock toast */}
      {activeToast && (
        <div className="fixed bottom-24 lg:bottom-8 right-4 z-50">
          <AchievementToast achievement={activeToast} onDismiss={() => setActiveToast(null)} />
        </div>
      )}
    </div>
  )
}

// ── Nav + App Shell ───────────────────────────────────────────────────────

const TABS = [
  { id: 'feed',      label: 'Feed',     Icon: Home },
  { id: 'clubs',     label: 'Clubs',    Icon: BookOpen },
  { id: 'discover',  label: 'Discover', Icon: Compass },
  { id: 'ranks',     label: 'Ranks',    Icon: Trophy },
  { id: 'stats',     label: 'Stats',    Icon: BarChart2 },
  { id: 'profile',   label: 'Profile',  Icon: User },
]

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (!IS_DEMO || dismissed) return null
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs font-medium"
      style={{ background: 'var(--accent)', color: 'var(--accent-text)', zIndex: 50, position: 'relative' }}>
      <span>
        <strong>Demo mode</strong> — data persists within this browser tab and resets when you close it.
        {' '}<a href="https://github.com/saad-r10/hobbyist#getting-started" target="_blank" rel="noopener noreferrer"
          className="underline opacity-80 hover:opacity-100">Run locally</a> for the full app.
      </span>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss demo banner" className="modal-close ml-4 opacity-70 hover:opacity-100 shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const dismissed = useRef(false)

  useEffect(() => {
    try { dismissed.current = localStorage.getItem('hobbyist-pwa-dismissed') === 'true' } catch { /* ignore */ }
    const handler = (e) => {
      if (dismissed.current) return
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.finally(() => setDeferredPrompt(null))
  }

  function dismiss() {
    try { localStorage.setItem('hobbyist-pwa-dismissed', 'true') } catch { /* ignore */ }
    dismissed.current = true
    setDeferredPrompt(null)
  }

  return { canInstall: !!deferredPrompt, install, dismiss }
}

function InstallBanner({ canInstall, onInstall, onDismiss }) {
  if (!canInstall) return null
  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-6 lg:bottom-6 lg:w-80 z-50
      flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
      style={{ background: 'var(--surface)', borderColor: 'var(--accent)', color: 'var(--text)' }}>
      <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--accent)' }}>
        <Smartphone size={18} color="#0F1923" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Install Hobbyist</p>
        <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--text-dim)' }}>Add to your home screen</p>
      </div>
      <button onClick={onInstall}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ background: 'var(--accent)', color: '#0F1923' }}>
        Install
      </button>
      <button onClick={onDismiss} aria-label="Dismiss" className="modal-close shrink-0 opacity-50 hover:opacity-100"
        style={{ color: 'var(--text)' }}>
        <X size={16} />
      </button>
    </div>
  )
}

export default function App() {
  const { user, logout } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState('feed')
  const [selectedClub, setSelectedClub] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [pendingSubTab, setPendingSubTab] = useState(null)
  const { canInstall, install, dismiss: dismissInstall } = useInstallPrompt()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('hobbyist-sidebar-collapsed') === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('hobbyist-sidebar-collapsed', String(sidebarCollapsed)) } catch { /* ignore */ }
  }, [sidebarCollapsed])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleTabChange(id) {
    setTab(id)
    if (id !== 'clubs') setSelectedClub(null)
  }

  function handleNotificationNavigate(target) {
    if (!target) return
    setTab(target.tab)
    setSelectedClub(target.clubId)
    setPendingSubTab({ subTab: target.subTab, nonce: Date.now() })
  }

  const TAB_TITLES = { feed: 'Feed', clubs: 'My Clubs', discover: 'Discover', ranks: 'Leaderboard', stats: 'Analytics', profile: 'Profile' }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <DemoBanner />
      <div className="lg:flex">
        <Sidebar
          tabs={TABS}
          activeTab={tab}
          onTabChange={handleTabChange}
          onOpenSearch={() => setShowSearch(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          user={user}
          onNotificationNavigate={handleNotificationNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(c => !c)}
        />

        {/* Mobile/tablet bottom nav */}
        <nav aria-label="Main navigation" className="mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-t06"
          style={{ background: 'var(--nav-bg-mobile)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="mobile-nav-indicator" style={{ width: `${100 / TABS.length}%`, transform: `translateX(${TABS.findIndex(t => t.id === tab) * 100}%)` }} />
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => handleTabChange(id)}
              aria-current={tab === id ? 'page' : undefined}
              className="mobile-nav-link flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[44px] relative z-10"
              style={{ color: tab === id ? 'var(--accent)' : 'var(--text-35)' }}>
              <span className="mobile-nav-icon-wrap flex flex-col items-center gap-0.5">
                <Icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-medium">{label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0" key={tab}>
          <div className="pt-4 pb-24 lg:pb-8 px-4 max-w-2xl mx-auto">
            <div className="page-transition">
              {tab !== 'clubs' || !selectedClub ? (
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-display text-fs-3xl font-bold">{TAB_TITLES[tab]}</h1>
                  <div className="lg:hidden">
                    <NotificationBell onNavigate={handleNotificationNavigate} />
                  </div>
                </div>
              ) : null}

              {tab === 'feed' && <GlobalFeed />}
              {tab === 'clubs' && !selectedClub && <MyClubs onSelectClub={setSelectedClub} />}
              {tab === 'clubs' && selectedClub && (
                <ClubDetail clubId={selectedClub} currentUser={user} onBack={() => setSelectedClub(null)} pendingSubTab={pendingSubTab} />
              )}
              {tab === 'discover' && <Discover onSelectClub={(id) => { handleTabChange('clubs'); setSelectedClub(id) }} />}
              {tab === 'ranks' && <Leaderboard />}
              {tab === 'stats' && <Analytics />}
              {tab === 'profile' && <Profile onLogout={handleLogout} />}
            </div>
          </div>
        </main>
      </div>

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onNavigateClub={(id) => { setShowSearch(false); handleTabChange('clubs'); setSelectedClub(id) }}
          onNavigateProfile={() => { setShowSearch(false); handleTabChange('profile') }}
        />
      )}

      <InstallBanner canInstall={canInstall} onInstall={install} onDismiss={dismissInstall} />
    </div>
  )
}
