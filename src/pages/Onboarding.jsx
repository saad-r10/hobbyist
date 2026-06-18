import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Film, Mic, Gamepad2, Check, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../api/client.js'

const INTERESTS = [
  { id: 'book',    icon: BookOpen,  label: 'Books',     desc: 'Novels, non-fiction, poetry',       accent: 'var(--color-book)',    bg: 'rgba(196,125,90,0.10)',  border: 'rgba(196,125,90,0.30)' },
  { id: 'film',    icon: Film,      label: 'Films',     desc: 'Movies, series, documentaries',     accent: 'var(--color-film)',    bg: 'rgba(107,141,214,0.10)', border: 'rgba(107,141,214,0.30)' },
  { id: 'podcast', icon: Mic,       label: 'Podcasts',  desc: 'Long-form audio storytelling',      accent: 'var(--color-podcast)', bg: 'rgba(61,191,189,0.10)',  border: 'rgba(61,191,189,0.30)' },
  { id: 'game',    icon: Gamepad2,  label: 'Games',     desc: 'Video games, tabletop, indie',      accent: 'var(--color-game)',    bg: 'rgba(155,109,181,0.10)', border: 'rgba(155,109,181,0.30)' },
]

const STEPS = [
  { id: 'welcome',   label: 'Welcome' },
  { id: 'interests', label: 'Interests' },
  { id: 'bio',       label: 'Bio' },
  { id: 'done',      label: 'Done' },
]

export default function Onboarding() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleInterest(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function finish() {
    setLoading(true)
    try {
      const updated = await api('/users/me/onboarding', {
        method: 'POST',
        body: JSON.stringify({ interests: selected, bio }),
      })
      updateUser(updated)
      navigate('/app', { replace: true })
    } catch (e) {
      console.error(e)
      navigate('/app', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Step indicator header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent)' }}>
            <BookOpen size={13} color="var(--accent-text)" />
          </div>
          <span className="font-display text-base font-semibold" style={{ color: 'var(--text)' }}>
            Hobbyist
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <div key={s.id} className="flex items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
                  style={{
                    width: active ? 28 : 22,
                    height: active ? 28 : 22,
                    fontSize: active ? 11 : 10,
                    background: done ? 'var(--accent)' : active ? 'var(--accent-15)' : 'var(--surface-06)',
                    border: `1.5px solid ${done ? 'var(--accent)' : active ? 'var(--accent)' : 'var(--border-08)'}`,
                    color: done ? 'var(--accent-text)' : active ? 'var(--accent)' : 'var(--text-30)',
                  }}
                >
                  {done ? <Check size={11} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="w-5 h-px transition-all duration-500"
                    style={{ background: i < step ? 'var(--accent)' : 'var(--border-08)' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step label */}
        <span className="text-xs font-medium" style={{ color: 'var(--text-40)' }}>
          {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="fade-up">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7"
                style={{ background: 'var(--accent-15)', border: '1px solid var(--accent-25)' }}
              >
                <BookOpen size={28} style={{ color: 'var(--accent)' }} />
              </div>

              <div className="text-center mb-8">
                <h1 className="font-display font-semibold mb-3" style={{ fontSize: 'var(--fs-3xl)', color: 'var(--text)' }}>
                  Welcome{user ? `, ${user.displayName.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-55)', maxWidth: '360px', margin: '0 auto' }}>
                  Hobbyist is where you and your friends track what you're reading, watching, playing, and listening to — together.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {[
                  { emoji: '📚', title: 'Join clubs', sub: 'Around shared media' },
                  { emoji: '💬', title: 'Discuss',    sub: 'In real time with your group' },
                  { emoji: '⭐', title: 'Rate & review', sub: 'What you finish' },
                  { emoji: '📊', title: 'Track progress', sub: 'See your activity' },
                ].map(f => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl p-3.5"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-06)' }}
                  >
                    <span className="text-lg leading-none mt-0.5">{f.emoji}</span>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-80)' }}>{f.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-40)' }}>{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)}
                className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
                Get started <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="fade-up">
              <div className="mb-7">
                <h2 className="font-display font-semibold mb-2" style={{ fontSize: 'var(--fs-2xl)', color: 'var(--text)' }}>
                  What do you enjoy?
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-50)' }}>
                  Pick everything that applies — we'll tailor your discovery feed to match.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-7">
                {INTERESTS.map(({ id, icon: Icon, label, desc, accent, bg, border }) => {
                  const active = selected.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleInterest(id)}
                      className="relative rounded-xl p-4 text-left transition-all duration-200"
                      style={{
                        background: active ? bg : 'var(--surface)',
                        border: `1.5px solid ${active ? border : 'var(--border-06)'}`,
                        boxShadow: active ? `0 0 0 1px ${border}` : 'none',
                      }}
                    >
                      {active && (
                        <div
                          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: accent }}
                        >
                          <Check size={11} color="var(--bg)" />
                        </div>
                      )}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                        style={{
                          background: active ? bg : 'var(--surface-06)',
                          border: `1px solid ${active ? border : 'var(--border-06)'}`,
                        }}
                      >
                        <Icon size={18} style={{ color: active ? accent : 'var(--text-35)' }} />
                      </div>
                      <div className="font-semibold text-sm mb-0.5" style={{ color: active ? 'var(--text)' : 'var(--text-70)' }}>
                        {label}
                      </div>
                      <div className="text-xs leading-snug" style={{ color: 'var(--text-35)' }}>
                        {desc}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-ghost flex-none px-5">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {selected.length === 0 ? 'Skip' : `Continue (${selected.length})`}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bio */}
          {step === 2 && (
            <div className="fade-up">
              <div className="mb-7">
                <h2 className="font-display font-semibold mb-2" style={{ fontSize: 'var(--fs-2xl)', color: 'var(--text)' }}>
                  Introduce yourself
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-50)' }}>
                  A short bio that club members will see on your profile. Totally optional.
                </p>
              </div>

              <div className="relative mb-1.5">
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={300}
                  rows={5}
                  placeholder="E.g. Sci-fi reader, slow to finish anything, always starting something new…"
                  className="w-full rounded-xl px-3.5 py-3 text-sm resize-none outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1.5px solid var(--border-12)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-12)'}
                />
              </div>
              <div className="text-right text-xs mb-7" style={{ color: 'var(--text-30)' }}>
                {bio.length}/300
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-none px-5">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {bio.trim() ? 'Continue' : 'Skip'}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center fade-up">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--success-20)', border: '1px solid var(--success-40)' }}
              >
                <Sparkles size={28} style={{ color: 'var(--success)' }} />
              </div>

              <h2 className="font-display font-semibold mb-2" style={{ fontSize: 'var(--fs-2xl)', color: 'var(--text)' }}>
                You're all set!
              </h2>
              <p className="text-sm mb-7" style={{ color: 'var(--text-50)' }}>
                Your profile is ready. Explore the feed, join a club, and start tracking.
              </p>

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-7">
                  {selected.map(id => {
                    const interest = INTERESTS.find(i => i.id === id)
                    const Icon = interest.icon
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{
                          background: interest.bg,
                          border: `1px solid ${interest.border}`,
                          color: interest.accent,
                        }}
                      >
                        <Icon size={11} />
                        {interest.label}
                      </span>
                    )
                  })}
                </div>
              )}

              <button onClick={finish} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
                {loading ? 'Setting up…' : 'Enter Hobbyist'}
                {!loading && <ArrowRight size={15} />}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
