import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, BookOpen, Film, Mic, Gamepad2, Users } from 'lucide-react'
import { get } from '../api/client.js'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const DEMO_RESULTS = {
  users: [
    { id: 2, displayName: 'Maya Patel',   username: 'mayap',    avatarColor: '#7A9E7E', avatarInitials: 'MP', bio: 'Design + sci-fi + too much coffee.' },
    { id: 3, displayName: 'Jordan Kim',   username: 'jordank',  avatarColor: '#6B8DD6', avatarInitials: 'JK', bio: 'Cinema lover, aspiring critic.' },
    { id: 4, displayName: 'Sam Rivera',   username: 'samr',     avatarColor: '#C47D5A', avatarInitials: 'SR', bio: 'Game dev by day, bookworm by night.' },
  ],
  clubs: [
    { id: 1, name: 'The Midnight Readers', type: 'book',    emoji: '📚', accentColor: '#C47D5A', memberCount: 6, description: 'A cozy literary club.' },
    { id: 2, name: 'Frame by Frame',       type: 'film',    emoji: '🎬', accentColor: '#6B8DD6', memberCount: 4, description: 'A film club dedicated to close reading.' },
    { id: 3, name: 'Deep Dive Pods',       type: 'podcast', emoji: '🎙️', accentColor: '#4AADAB', memberCount: 4, description: 'One podcast series per month.' },
    { id: 4, name: 'Pixel & Play',         type: 'game',    emoji: '🎮', accentColor: '#9B6DB5', memberCount: 4, description: 'Playing through classics and indie gems.' },
  ],
  items: [
    { id: 1, title: 'Tomorrow, and Tomorrow, and Tomorrow', subtitle: 'Gabrielle Zevin', type: 'book', clubName: 'The Midnight Readers', clubColor: '#C47D5A' },
    { id: 5, title: 'Anatomy of a Fall', subtitle: 'Justine Triet', type: 'film', clubName: 'Frame by Frame', clubColor: '#6B8DD6' },
    { id: 8, title: 'S-Town', subtitle: 'Brian Reed', type: 'podcast', clubName: 'Deep Dive Pods', clubColor: '#4AADAB' },
    { id: 10, title: 'Hades II', subtitle: 'Supergiant Games', type: 'game', clubName: 'Pixel & Play', clubColor: '#9B6DB5' },
  ],
}

function filterDemo(q) {
  const lq = q.toLowerCase()
  return {
    users: DEMO_RESULTS.users.filter(u => u.displayName.toLowerCase().includes(lq) || u.username.toLowerCase().includes(lq) || u.bio?.toLowerCase().includes(lq)),
    clubs: DEMO_RESULTS.clubs.filter(c => c.name.toLowerCase().includes(lq) || c.description?.toLowerCase().includes(lq) || c.type.includes(lq)),
    items: DEMO_RESULTS.items.filter(i => i.title.toLowerCase().includes(lq) || i.subtitle?.toLowerCase().includes(lq)),
  }
}

function TypeIcon({ type, size = 13 }) {
  const icons = { book: BookOpen, film: Film, podcast: Mic, game: Gamepad2 }
  const Icon = icons[type] || BookOpen
  return <Icon size={size} />
}

function Avatar({ user, size = 28 }) {
  return (
    <div className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, background: user.avatarColor || '#E8A020', fontSize: size * 0.35, color: '#0F1923' }}>
      {user.avatarInitials}
    </div>
  )
}

export default function SearchModal({ onClose, onNavigateClub, onNavigateProfile }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    try {
      const data = IS_DEMO
        ? await new Promise(r => setTimeout(() => r(filterDemo(q)), 200))
        : await get(`/search?q=${encodeURIComponent(q)}`)
      setResults(data)
    } catch { setResults({ users: [], clubs: [], items: [] }) }
    finally { setLoading(false) }
  }, [])

  function handleInput(e) {
    const q = e.target.value
    setQuery(q)
    setCursor(-1)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(q), 300)
  }

  const totalCount = results ? results.users.length + results.clubs.length + results.items.length : 0
  const hasResults = totalCount > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#F5F0E8]/10"
        style={{ background: '#162030' }}
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F0E8]/08">
          <Search size={18} className="text-[#F5F0E8]/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            placeholder="Search clubs, people, items…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#F5F0E8]/30"
            style={{ color: '#F5F0E8' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus() }}
              className="text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: '60vh' }}>
          {!query && (
            <div className="py-10 text-center">
              <Search size={24} className="mx-auto mb-2 text-[#F5F0E8]/15" />
              <p className="text-sm text-[#F5F0E8]/30">Search for clubs, people, or items</p>
            </div>
          )}

          {query && loading && (
            <div className="py-10 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-[#E8A020] border-t-transparent animate-spin" />
            </div>
          )}

          {query && !loading && results && !hasResults && (
            <div className="py-10 text-center">
              <p className="text-sm text-[#F5F0E8]/40">No results for <span className="text-[#F5F0E8]/70">"{query}"</span></p>
              <p className="text-xs text-[#F5F0E8]/25 mt-1">Try different words or check spelling</p>
            </div>
          )}

          {results?.clubs?.length > 0 && (
            <Section label="Clubs">
              {results.clubs.map(club => (
                <button key={club.id} onClick={() => onNavigateClub(club.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/04 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ background: `${club.accentColor}20` }}>
                    {club.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F0E8]/90 truncate">{club.name}</p>
                    <p className="text-xs text-[#F5F0E8]/40 truncate">{club.memberCount} members · {club.type}</p>
                  </div>
                </button>
              ))}
            </Section>
          )}

          {results?.users?.length > 0 && (
            <Section label="People">
              {results.users.map(user => (
                <button key={user.id} onClick={onNavigateProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/04 transition-colors">
                  <Avatar user={user} size={30} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F0E8]/90 truncate">{user.displayName}</p>
                    <p className="text-xs text-[#F5F0E8]/40 truncate">@{user.username}{user.bio ? ` · ${user.bio.slice(0, 40)}` : ''}</p>
                  </div>
                </button>
              ))}
            </Section>
          )}

          {results?.items?.length > 0 && (
            <Section label="Items">
              {results.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${item.clubColor || '#E8A020'}20` }}>
                    <TypeIcon type={item.type} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F0E8]/90 truncate">{item.title}</p>
                    <p className="text-xs text-[#F5F0E8]/40 truncate">{item.subtitle} · {item.clubName}</p>
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#F5F0E8]/06 flex gap-4">
          <span className="text-xs text-[#F5F0E8]/20">Press <kbd className="px-1 rounded text-[10px] bg-white/08">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#F5F0E8]/30">{label}</p>
      {children}
    </div>
  )
}
