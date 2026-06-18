import { BookOpen, Film, Mic, Gamepad2 } from 'lucide-react'

const MEDIA_TILES = [
  { icon: BookOpen, label: 'Books',    bg: '#C47D5A20', color: '#C47D5A' },
  { icon: Film,     label: 'Films',    bg: '#6B8DD620', color: '#6B8DD6' },
  { icon: Mic,      label: 'Podcasts', bg: '#3DBFBD20', color: '#3DBFBD' },
  { icon: Gamepad2, label: 'Games',    bg: '#9B6DB520', color: '#9B6DB5' },
]

const FEATURES = [
  'Join clubs around the things you love',
  'Discuss in real time with your group',
  'Rate, review, and track your progress',
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Brand panel — desktop only */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden flex-shrink-0"
        style={{
          background: 'linear-gradient(160deg, #1c0d02 0%, #111b28 55%, #0b1620 100%)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 80% 20%, rgba(232,160,32,0.18) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 90%, rgba(61,191,189,0.10) 0%, transparent 60%)',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#E8A020' }}
          >
            <BookOpen size={20} color="#0F1923" />
          </div>
          <span className="font-display text-2xl font-semibold" style={{ color: '#F5F0E8' }}>
            Hobbyist
          </span>
        </div>

        {/* Center copy */}
        <div className="relative">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#E8A020' }}>
            Your club for everything
          </p>
          <h1
            className="font-display font-semibold leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', color: '#F5F0E8' }}
          >
            Track what you love,<br />together.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(245,240,232,0.55)' }}>
            Hobbyist brings your group together around the books, films, games, and podcasts you're all into — with shared ratings, discussions, and activity feeds.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 mb-10">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(245,240,232,0.70)' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#E8A020' }}
                />
                {f}
              </li>
            ))}
          </ul>

          {/* Media tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            {MEDIA_TILES.map(({ icon: Icon, label, bg, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{ background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.08)' }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon size={14} color={color} />
                </span>
                <span className="text-sm font-medium" style={{ color: 'rgba(245,240,232,0.75)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs" style={{ color: 'rgba(245,240,232,0.25)' }}>
          © 2025 Hobbyist
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 min-h-screen">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <BookOpen size={16} color="var(--accent-text)" />
          </div>
          <span className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>
            Hobbyist
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
