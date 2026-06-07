import { useState, useRef, useEffect, useCallback } from 'react'
import {
  BookOpen, Film, Mic, Gamepad2, Home, Compass, Trophy,
  BarChart2, User, Heart, MessageCircle, Star,
  ArrowLeft, Flame, Plus, Check, Clock, Send, LogOut,
  Users, AlertCircle, Loader2, X, Settings, Search, Sun, Moon, TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import { useTheme } from './contexts/ThemeContext.jsx'
import { get, post, put } from './api/client.js'
import ImportModal from './components/ImportModal.jsx'
import SearchModal from './components/SearchModal.jsx'

// ── Utility components ──────────────────────────────────────────────────

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
          fill={i < Math.round(rating) ? '#E8A020' : 'none'}
          stroke={i < Math.round(rating) ? '#E8A020' : 'var(--text-25)'}
          strokeWidth={1.5} />
      ))}
    </div>
  )
}

function ProgressRing({ pct, size = 36, stroke = 3, color = '#E8A020' }) {
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

function ProgressBar({ pct, color = '#E8A020' }) {
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
      <AlertCircle size={24} className="text-[#E87070]/60" />
      <p className="text-t50 text-sm">{message || 'Something went wrong'}</p>
      {onRetry && <button onClick={onRetry} className="text-xs text-[#E8A020] hover:opacity-80">Try again</button>}
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Icon size={28} className="text-t15" />
      <div>
        <p className="text-t50 text-sm font-medium">{title}</p>
        {sub && <p className="text-t30 text-xs mt-1">{sub}</p>}
      </div>
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

const ACTIVITY_COLORS = { book: '#C47D5A', film: '#6B8DD6', podcast: '#4AADAB', game: '#9B6DB5' }

function FeedCard({ item }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likeCount || 0)
  const accent = ACTIVITY_COLORS[item.extra?.type] || '#E8A020'

  return (
    <div className="rounded-2xl p-4 border border-t06 fade-up" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={item.user} size={36} />
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
        <div className="rounded-xl px-3 py-2 text-sm text-t60 mb-3" style={{ background: 'var(--surface-04)', border: '1px solid var(--border-06)' }}>
          Joined <span style={{ color: accent }}>{item.clubName}</span>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-t06">
        <button onClick={() => { setLiked(l => !l); setLikeCount(c => c + (liked ? -1 : 1)) }}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: liked ? '#E87070' : 'var(--text-35)' }}>
          <Heart size={13} fill={liked ? '#E87070' : 'none'} />
          {likeCount > 0 ? likeCount : ''}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-t35 hover:text-t60 transition-colors">
          <MessageCircle size={13} />
          {item.commentCount > 0 ? item.commentCount : ''}
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded-full w-1/2 shimmer" />
          <div className="h-3 rounded-full w-3/4 shimmer" />
        </div>
      </div>
      <div className="h-3 rounded-full w-1/4 shimmer" />
    </div>
  )
}

function GlobalFeed() {
  const { data, loading, error, refetch } = useApi(() => get('/feed'))

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data?.length) return <EmptyState icon={Home} title="Nothing in your feed yet" sub="Join a club to see activity from your clubmates." />

  return (
    <div className="space-y-3">
      {data.map(item => <FeedCard key={item.id} item={item} />)}
    </div>
  )
}

// ── My Clubs ─────────────────────────────────────────────────────────────

function ClubCard({ club, onClick }) {
  const accent = club.accentColor || '#E8A020'
  return (
    <button onClick={onClick} className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99] border border-t06"
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 border border-t08" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Create a club</h3>
          <button onClick={onClose} className="text-t40 hover:text-t70"><X size={18} /></button>
        </div>

        {error && <p className="text-xs text-[#E87070] mb-3 bg-[#E87070]/10 rounded-lg px-3 py-2">{error}</p>}

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
                  className="rounded-xl py-2 text-center text-xs border transition-all"
                  style={{
                    background: form.type === t.id ? 'var(--accent-15)' : 'var(--surface-04)',
                    borderColor: form.type === t.id ? '#E8A020' : 'var(--border-08)',
                    color: form.type === t.id ? '#E8A020' : 'var(--text-50)',
                  }}>
                  <div className="text-base mb-0.5">{t.emoji}</div>
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
            <span className="text-sm text-t60">Public club</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: form.isPublic ? '#E8A020' : 'var(--text-15)' }}>
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

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Your clubs</h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
          style={{ background: 'var(--accent-12)', color: '#E8A020' }}>
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

  async function toggleLike(postId) {
    try {
      const res = await post(`/posts/${postId}/like`, {})
      setData(prev => prev.map(p => p.id === postId
        ? { ...p, likedByMe: res.liked, likeCount: p.likeCount + (res.liked ? 1 : -1) }
        : p
      ))
    } catch { /* optimistic like already applied */ }
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

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
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
            <div key={i} className="flex gap-2.5 mb-2 pl-4 border-l-2" style={{ borderColor: `${accent}30` }}>
              <Avatar user={r.user} size={24} />
              <div>
                <span className="font-medium text-xs" style={{ color: accent }}>{r.user?.displayName}</span>
                <span className="text-xs text-t30 ml-1.5">{r.time}</span>
                <p className="text-sm text-t70 mt-0.5">{r.text}</p>
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

          <div className="flex items-center gap-4 pt-3 border-t border-t06 mt-2">
            <button onClick={() => toggleLike(p.id)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: p.likedByMe ? '#E87070' : 'var(--text-35)' }}>
              <Heart size={12} fill={p.likedByMe ? '#E87070' : 'none'} />
              {p.likeCount > 0 && p.likeCount}
            </button>
            <button onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
              className="flex items-center gap-1.5 text-xs text-t40 hover:text-t70 transition-colors">
              <MessageCircle size={12} />
              {p.replyCount > 0 ? `${p.replyCount} ${p.replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
            </button>
            {p.replyCount > 0 && (
              <button onClick={() => { setExpanded(e => ({ ...e, [p.id]: !e[p.id] })); setReplyingTo(p.id) }}
                className="text-xs text-t30 hover:text-t60 ml-auto transition-colors">
                {expanded[p.id] ? 'Hide' : 'Show replies'}
              </button>
            )}
            {!expanded[p.id] && (
              <button onClick={() => setReplyingTo(r => r === p.id ? null : p.id)}
                className="text-xs ml-auto transition-colors"
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
  const { data: messages, loading, error, setData } = useApi(() => get(`/chat/${clubId}`), [clubId])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const optimistic = { id: Date.now(), text: text.trim(), time: 'just now', user: currentUser, createdAt: new Date().toISOString() }
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

  if (loading) return <div className="flex items-center justify-center py-12"><Spinner /></div>
  if (error) return <ErrorState message={error} />

  const isMe = (msg) => msg.user?.id === currentUser?.id

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] sm:h-[520px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
        {!messages?.length && <EmptyState icon={MessageCircle} title="No messages yet" sub="Say hello to your clubmates!" />}
        {messages?.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${isMe(msg) ? 'flex-row-reverse' : ''}`}>
            {!isMe(msg) && <Avatar user={msg.user} size={28} />}
            <div className="max-w-[75%]">
              {!isMe(msg) && <p className="text-xs mb-1 ml-1" style={{ color: msg.user?.avatarColor || accent }}>{msg.user?.displayName}</p>}
              <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                style={isMe(msg)
                  ? { background: accent, color: 'var(--bg)' }
                  : { background: 'var(--surface-07)', color: 'var(--text)' }}>
                {msg.text}
              </div>
              <p className={`text-xs mt-1 text-t25 ${isMe(msg) ? 'text-right mr-1' : 'ml-1'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 mt-3 pt-3 border-t border-t06">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Message…"
          className="input-field flex-1 text-sm py-2.5" />
        <button type="submit" disabled={!text.trim() || sending}
          className="rounded-xl px-4 py-2.5 transition-opacity disabled:opacity-40"
          style={{ background: accent, color: 'var(--bg)' }}>
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
              {m.role === 'admin' && <span className="text-xs rounded-full px-2 py-0.5" style={{ background: `${accent}20`, color: accent }}>Admin</span>}
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
          <div className="h-20 flex items-center justify-center" style={{ background: item.coverColor }}>
            <TypeIcon type={item.type} size={24} />
          </div>
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

function AddItemModal({ clubId, clubType, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', coverColor: 'var(--surface)' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const COLORS = ['#2A1A0E','#0D1528','#0D2020','#1A1028','var(--surface)','#1A2850','#3A2020','#1E2A1A']

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const item = await post(`/clubs/${clubId}/items`, { ...form, type: clubType })
      onAdded(item)
      onClose()
    } catch (err) { alert(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 border border-t08" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Set current item</h3>
          <button onClick={onClose}><X size={18} className="text-t40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.title} onChange={set('title')} required placeholder="Title" className="input-field" />
          <input value={form.subtitle} onChange={set('subtitle')} placeholder="Author / Director / Studio" className="input-field" />
          <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Description (optional)" className="input-field resize-none" />
          <div>
            <p className="text-xs text-t50 mb-2">Cover color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, coverColor: c }))}
                  className="w-7 h-7 rounded-lg border-2 transition-all"
                  style={{ background: c, borderColor: form.coverColor === c ? '#E8A020' : 'transparent' }} />
              ))}
            </div>
          </div>
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
      <div className="w-full max-w-sm rounded-2xl p-5 border border-t08" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg font-semibold mb-1">Rate this item</h3>
        <p className="text-sm text-t50 mb-4 truncate">"{itemTitle}"</p>
        <div className="flex gap-2 justify-center mb-4">
          {[1,2,3,4,5].map(v => (
            <button key={v} onMouseEnter={() => setHover(v)} onMouseLeave={() => setHover(0)} onClick={() => setRating(v)}>
              <Star size={32} fill={(hover || rating) >= v ? '#E8A020' : 'none'} stroke={(hover || rating) >= v ? '#E8A020' : 'var(--text-30)'} strokeWidth={1.5} />
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

function ClubDetail({ clubId, currentUser, onBack }) {
  const { data: club, loading, error, refetch } = useApi(() => get(`/clubs/${clubId}`), [clubId])
  const [subTab, setSubTab] = useState('discussion')
  const [showAddItem, setShowAddItem] = useState(false)
  const [showRate, setShowRate] = useState(false)
  const [progress, setProgress] = useState(null)

  const accent = club?.accentColor || '#E8A020'
  const isAdmin = club?.myRole === 'admin'

  async function updateProgress(val) {
    setProgress(val)
    try { await put(`/clubs/${clubId}/progress`, { progress: val }) }
    catch { /* fire-and-forget; optimistic update already applied */ }
  }

  if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const myProgress = progress ?? club?.currentItem?.myProgress ?? 0
  const SUB_TABS = ['discussion', 'chat', 'members', 'past']

  return (
    <div className="fade-up">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-t50 hover:text-t80 mb-4 transition-colors">
        <ArrowLeft size={15} /> All clubs
      </button>

      {/* Header */}
      <div className="rounded-2xl p-4 mb-4 border border-t06" style={{ background: club?.bgColor || 'var(--surface)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-2xl mb-1">{club?.emoji}</div>
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>{club?.name}</h2>
            <p className="text-xs text-t40 mt-0.5">{club?.memberCount} members · {club?.type}</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddItem(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: `${accent}20`, color: accent }}>
              <Plus size={12} /> Set item
            </button>
          )}
        </div>

        {club?.currentItem ? (
          <div className="rounded-xl p-3 border border-t08" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: club.currentItem.coverColor }}>
                <TypeIcon type={club.type} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-t40 mb-0.5">Currently reading / watching</p>
                <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--text)' }}>{club.currentItem.title}</p>
                <p className="text-xs text-t50">{club.currentItem.subtitle}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-t40">My progress</span>
                    <span className="text-xs font-medium" style={{ color: accent }}>{myProgress}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={myProgress} onChange={e => updateProgress(Number(e.target.value))}
                    className="w-full accent-current" style={{ accentColor: accent }} />
                </div>
                <button onClick={() => setShowRate(true)}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: `${accent}20`, color: accent }}>
                  Rate this item
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-3 text-center border border-t06" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <p className="text-sm text-t40">No current item set.</p>
            {isAdmin && <button onClick={() => setShowAddItem(true)} className="text-xs mt-1" style={{ color: accent }}>Add one</button>}
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all"
            style={subTab === t ? { background: accent, color: 'var(--bg)' } : { color: 'var(--text-50)' }}>
            {t}
          </button>
        ))}
      </div>

      {subTab === 'discussion' && <DiscussionTab clubId={clubId} accent={accent} myUserId={currentUser?.id} />}
      {subTab === 'chat' && <ChatTab clubId={clubId} currentUser={currentUser} accent={accent} />}
      {subTab === 'members' && <MembersTab members={club?.members} currentItem={club?.currentItem} accent={accent} />}
      {subTab === 'past' && <PastItemsTab items={club?.pastItems} accent={accent} />}

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

function DiscoverClubCard({ club, onJoin }) {
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const accent = club.accentColor || 'var(--accent)'

  async function handleJoin() {
    setJoining(true)
    try {
      await post(`/clubs/${club.id}/join`, {})
      setJoined(true)
      onJoin?.()
    } catch { /* show nothing on join failure */ }
    finally { setJoining(false) }
  }

  return (
    <div className="rounded-2xl p-4 border border-t06 flex flex-col gap-3" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${accent}18` }}>
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
          <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
            style={{ background: 'var(--success-10)', color: 'var(--success)' }}>
            <Check size={11} className="inline mr-1" />Joined
          </span>
        ) : (
          <button onClick={handleJoin} disabled={joining}
            className="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent-12)', color: 'var(--accent)' }}>
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
          <span className="truncate">Currently: <span className="text-t60">{club.currentItem.title}</span></span>
        </div>
      )}
    </div>
  )
}

function DiscoverSection({ label, icon, clubs, onJoin, emptyText }) {
  if (!clubs?.length) return (
    <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-t40">{icon}</span>
        <h3 className="text-sm font-semibold text-themed">{label}</h3>
      </div>
      <p className="text-xs text-t30">{emptyText || 'Nothing here yet.'}</p>
    </div>
  )
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-t40">{icon}</span>
        <h3 className="text-sm font-semibold text-themed">{label}</h3>
        <span className="text-xs text-t30 ml-auto">{clubs.length} clubs</span>
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
      <div className="h-12 rounded-xl shimmer" />
      {[0,1,2].map(i => <div key={i} className="h-36 rounded-2xl shimmer" />)}
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
          <DiscoverSection
            label="Trending"
            icon={<TrendingUp size={14} />}
            clubs={data?.trending}
            onJoin={refetch}
            emptyText="No public clubs to join yet. Create one!"
          />
          {data?.forYou?.length > 0 && (
            <DiscoverSection
              label="For You"
              icon={<Star size={14} />}
              clubs={data.forYou}
              onJoin={refetch}
              emptyText="Update your interests to get personalised suggestions."
            />
          )}
          {data?.newClubs?.length > 0 && (
            <DiscoverSection
              label="New Clubs"
              icon={<Plus size={14} />}
              clubs={data.newClubs}
              onJoin={refetch}
              emptyText="No new clubs recently."
            />
          )}
          {data?.people?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-t40" />
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
          {!data?.trending?.length && !data?.forYou?.length && !data?.newClubs?.length && (
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

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl shimmer" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const { entries = [], myRank, myScore } = data || {}
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const PERIODS = ['week', 'month', 'all']

  return (
    <div>
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit mx-auto" style={{ background: 'var(--surface)' }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all"
            style={period === p ? { background: '#E8A020', color: 'var(--bg)' } : { color: 'var(--text-50)' }}>
            {p === 'all' ? 'All time' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            const heights = [80, 100, 68]
            const medals = ['🥈', '🥇', '🥉']
            return (
              <div key={entry.id} className="flex flex-col items-center gap-2">
                <Avatar user={entry} size={44} />
                <p className="text-xs font-medium text-center" style={{ color: 'var(--text)' }}>{entry.displayName.split(' ')[0]}</p>
                <div className="w-20 rounded-t-xl flex items-center justify-center relative transition-all duration-500"
                  style={{ height: heights[i], background: `rgba(232,160,32,${i === 1 ? 0.2 : 0.08})`, border: `1px solid rgba(232,160,32,${i === 1 ? 0.3 : 0.12})` }}>
                  <span className="text-2xl absolute -top-4">{medals[i]}</span>
                  <span className="text-xs text-t60 mt-4">{entry.score}pts</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rest of table */}
      <div className="space-y-2">
        {rest.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-t06" style={{ background: 'var(--surface)' }}>
            <span className="text-sm font-semibold w-6 text-center text-t40">#{entry.rank}</span>
            <Avatar user={entry} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-t90 truncate">{entry.displayName}</p>
              <p className="text-xs text-t40">{entry.finished} items</p>
            </div>
            {entry.streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-[#E87070]">
                <Flame size={12} fill="#E87070" /> {entry.streak}
              </div>
            )}
            <span className="text-sm font-semibold" style={{ color: '#E8A020' }}>{entry.score}</span>
          </div>
        ))}
      </div>

      {myRank > 10 && (
        <div className="mt-4 rounded-xl px-4 py-3 text-center border border-[#E8A020]/20" style={{ background: 'var(--accent-06)' }}>
          <p className="text-sm text-t60">You're ranked <span style={{ color: '#E8A020' }}>#{myRank}</span> with {myScore} points</p>
          <p className="text-xs text-t30 mt-0.5">Keep engaging to climb the board!</p>
        </div>
      )}
    </div>
  )
}

// ── Analytics ─────────────────────────────────────────────────────────────

const LEVEL_COLORS = ['var(--border-06)', 'rgba(122,158,126,0.3)', 'rgba(122,158,126,0.55)', 'rgba(122,158,126,0.8)', '#7A9E7E']

function Analytics() {
  const { data, loading, error, refetch } = useApi(() => get('/analytics'))

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const { summary, monthly, types, heatmap, recentRatings } = data || {}

  const maxMonthly = Math.max(...(monthly || []).map(m => m.total), 1)
  const TYPE_COLORS = { book: '#C47D5A', film: '#6B8DD6', podcast: '#4AADAB', game: '#9B6DB5' }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Finished', val: summary?.finished ?? 0, color: '#E8A020' },
          { label: 'Avg rating', val: summary?.avgRating ? `${summary.avgRating}★` : '—', color: '#7A9E7E' },
          { label: 'Clubs', val: summary?.clubs ?? 0, color: '#6B8DD6' },
          { label: 'This year', val: summary?.thisYear ?? 0, color: '#C47D5A' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-t40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      {monthly?.length > 0 && (
        <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-t80 mb-4">Activity (last 6 months)</h3>
          <div className="flex items-end gap-2 h-28">
            {monthly.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{ height: `${(m.total / maxMonthly) * 100}%`, background: '#E8A020', minHeight: m.total > 0 ? 4 : 0, opacity: 0.8 }} />
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
                return `${TYPE_COLORS[t.type] || '#E8A020'} ${start}% ${start + t.pct}%`
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
          <h3 className="text-sm font-semibold text-t80 mb-3">Activity heatmap</h3>
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

      {/* Recent ratings */}
      {recentRatings?.length > 0 && (
        <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
          <h3 className="text-sm font-semibold text-t80 mb-3">Recent ratings</h3>
          <div className="space-y-3">
            {recentRatings.map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: TYPE_COLORS[r.type] + '30' }}>
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

// ── Profile ───────────────────────────────────────────────────────────────

const SOURCE_META = {
  letterboxd: { label: 'Letterboxd', color: '#00AC34' },
  goodreads:  { label: 'Goodreads',  color: '#553B08' },
  manual:     { label: 'Manual',     color: '#E8A020' },
  club:       { label: 'Clubs',      color: '#6B8DD6' },
}

function Profile({ onLogout }) {
  const { user, updateUser } = useAuth()
  const { data: me, loading, error } = useApi(() => get('/users/me'))
  const { data: analytics, refetch: refetchAnalytics } = useApi(() => get('/analytics'))
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (me) setForm({ displayName: me.displayName, bio: me.bio || '' })
  }, [me])

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

  if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>
  if (error) return <ErrorState message={error} />

  const profile = me || user
  const INTEREST_MAP = { book: { label: 'Books', color: '#C47D5A' }, film: { label: 'Films', color: '#6B8DD6' }, podcast: { label: 'Podcasts', color: '#4AADAB' }, game: { label: 'Games', color: '#9B6DB5' } }
  const importSources = analytics?.importSources || {}

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-5 border border-t06" style={{ background: 'var(--surface)' }}>
        <div className="flex items-start gap-4 mb-4">
          <Avatar user={profile} size={56} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>{profile?.displayName}</h2>
            <p className="text-sm text-t40">@{profile?.username}</p>
            {profile?.bio && <p className="text-sm text-t60 mt-1.5 leading-relaxed">{profile.bio}</p>}
          </div>
          <button onClick={() => setEditing(e => !e)}
            className="rounded-xl p-2 transition-colors"
            style={{ background: 'var(--border-06)' }}>
            <Settings size={15} className="text-t50" />
          </button>
        </div>

        {editing && (
          <form onSubmit={saveProfile} className="space-y-3 pt-3 border-t border-t08 mt-3">
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

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-0 pt-4 border-t border-t08 mt-4">
          {[
            { val: analytics?.summary?.finished ?? me?.stats?.finished ?? 0, label: 'Total' },
            { val: me?.stats?.clubs ?? 0, label: 'Clubs' },
            { val: analytics?.summary?.avgRating ? `${analytics.summary.avgRating}★` : '—', label: 'Avg rating' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold" style={{ color: '#E8A020' }}>{s.val}</p>
              <p className="text-xs text-t40">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      {profile?.interests?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.interests.map(id => {
            const info = INTEREST_MAP[id] || { label: id, color: '#E8A020' }
            return (
              <span key={id} className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40` }}>
                {info.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Import history */}
      <div className="rounded-2xl p-4 border border-t06" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-t80">Import history</h3>
            {analytics?.summary?.imported > 0 && (
              <p className="text-xs text-t40 mt-0.5">
                {analytics.summary.imported} items imported from external platforms
              </p>
            )}
          </div>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--accent-12)', color: '#E8A020' }}>
            <Plus size={12} /> Import
          </button>
        </div>

        {Object.keys(importSources).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(importSources).map(([source, count]) => {
              const meta = SOURCE_META[source] || { label: source, color: '#E8A020' }
              return (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                    <span className="text-sm text-t70">{meta.label}</span>
                  </div>
                  <span className="text-sm font-medium text-t60">{count} items</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-t30 text-center py-2">
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
              const color = { book: '#C47D5A', film: '#6B8DD6', podcast: '#4AADAB', game: '#9B6DB5' }[r.type] || '#E8A020'
              const sourceMeta = SOURCE_META[r.source]
              return (
                <div key={r.id} className="shrink-0 w-28 rounded-xl overflow-hidden border border-t06">
                  <div className="h-20 flex items-center justify-center relative" style={{ background: color + '30' }}>
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
      <button onClick={() => setDismissed(true)} className="ml-4 opacity-70 hover:opacity-100 shrink-0">
        <X size={14} />
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

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleTabChange(id) {
    setTab(id)
    if (id !== 'clubs') setSelectedClub(null)
  }

  const TAB_TITLES = { feed: 'Feed', clubs: 'My Clubs', discover: 'Discover', ranks: 'Leaderboard', stats: 'Analytics', profile: 'Profile' }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <DemoBanner />
      {/* Desktop top nav */}
      <nav className="hidden sm:flex sticky top-0 left-0 right-0 z-40 items-center justify-between px-6 h-14 border-b border-t06" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#E8A020' }}>
            <BookOpen size={14} style={{ color: 'var(--bg)' }} />
          </div>
          <span className="font-display text-base font-semibold">Hobbyist</span>
        </div>
        <div className="flex items-center gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => handleTabChange(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={tab === id ? { background: 'var(--accent-12)', color: '#E8A020' } : { color: 'var(--text-50)' }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(true)}
            className="rounded-lg p-1.5 transition-colors"
            style={{ background: 'var(--border)', color: 'var(--text-dim)' }} title="Search (/)">
            <Search size={16} />
          </button>
          <button onClick={toggleTheme}
            className="rounded-lg p-1.5 transition-colors"
            style={{ background: 'var(--border)', color: 'var(--text-dim)' }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => handleTabChange('profile')}
            className="rounded-full ring-2 ring-transparent hover:ring-[#E8A020]/40 transition-all"
            title="Your profile">
            <Avatar user={user} size={30} />
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-t06" style={{ background: 'var(--nav-bg-mobile)', backdropFilter: 'blur(12px)' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors"
            style={{ color: tab === id ? '#E8A020' : 'var(--text-35)' }}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="pt-4 sm:pt-4 pb-24 sm:pb-8 px-4 max-w-2xl mx-auto" key={tab}>
        <div className="fade-up">
          {tab !== 'clubs' || !selectedClub ? (
            <h1 className="font-display text-xl font-semibold mb-4">{TAB_TITLES[tab]}</h1>
          ) : null}

          {tab === 'feed' && <GlobalFeed />}
          {tab === 'clubs' && !selectedClub && <MyClubs onSelectClub={setSelectedClub} />}
          {tab === 'clubs' && selectedClub && (
            <ClubDetail clubId={selectedClub} currentUser={user} onBack={() => setSelectedClub(null)} />
          )}
          {tab === 'discover' && <Discover onSelectClub={(id) => { handleTabChange('clubs'); setSelectedClub(id) }} />}
          {tab === 'ranks' && <Leaderboard />}
          {tab === 'stats' && <Analytics />}
          {tab === 'profile' && <Profile onLogout={handleLogout} />}
        </div>
      </main>

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onNavigateClub={(id) => { setShowSearch(false); handleTabChange('clubs'); setSelectedClub(id) }}
          onNavigateProfile={() => { setShowSearch(false); handleTabChange('profile') }}
        />
      )}
    </div>
  )
}
