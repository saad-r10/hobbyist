import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Film, Mic, Gamepad2, Check, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../api/client.js'

const INTERESTS = [
  { id: 'book',    icon: BookOpen,  label: 'Books',     desc: 'Novels, non-fiction, poetry',       accent: '#C47D5A', bg: '#2A1A0E' },
  { id: 'film',    icon: Film,      label: 'Films',     desc: 'Movies, series, documentaries',     accent: '#6B8DD6', bg: '#0D1528' },
  { id: 'podcast', icon: Mic,       label: 'Podcasts',  desc: 'Long-form audio storytelling',      accent: '#4AADAB', bg: '#0D2020' },
  { id: 'game',    icon: Gamepad2,  label: 'Games',     desc: 'Video games, tabletop, indie',      accent: '#9B6DB5', bg: '#1A1028' },
]

const STEPS = ['Welcome', 'Interests', 'Bio', 'Done']

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
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1923', color: '#F5F0E8' }}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'rgba(245,240,232,0.08)' }}>
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: '#E8A020' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center fade-up">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#E8A020' }}>
                <BookOpen size={28} style={{ color: '#0F1923' }} />
              </div>
              <h1 className="font-display text-3xl font-semibold mb-3">Welcome to Folio{user ? `, ${user.displayName.split(' ')[0]}` : ''}!</h1>
              <p className="text-[#F5F0E8]/60 text-base leading-relaxed mb-8">
                Folio is where you and your friends track what you're reading, watching, playing, and listening to — together.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {[
                  { emoji: '📚', text: 'Join clubs around shared media' },
                  { emoji: '💬', text: 'Discuss with your group in real time' },
                  { emoji: '⭐', text: 'Rate and review what you finish' },
                  { emoji: '📊', text: 'See your activity and progress' },
                ].map(f => (
                  <div key={f.text} className="flex items-start gap-3 rounded-xl p-3 border border-[#F5F0E8]/08" style={{ background: '#162030' }}>
                    <span className="text-lg">{f.emoji}</span>
                    <span className="text-sm text-[#F5F0E8]/70 leading-snug">{f.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full flex items-center justify-center gap-2">
                Get started <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="fade-up">
              <h2 className="font-display text-2xl font-semibold mb-2">What do you enjoy?</h2>
              <p className="text-[#F5F0E8]/50 text-sm mb-6">Pick everything that applies — we'll tailor your discovery feed to match.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {INTERESTS.map(({ id, icon: Icon, label, desc, accent, bg }) => {
                  const active = selected.includes(id)
                  return (
                    <button key={id} onClick={() => toggleInterest(id)}
                      className="relative rounded-xl p-4 text-left border transition-all duration-200"
                      style={{
                        background: active ? bg : '#162030',
                        borderColor: active ? accent : 'rgba(245,240,232,0.08)',
                        boxShadow: active ? `0 0 0 1px ${accent}` : 'none',
                      }}>
                      {active && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: accent }}>
                          <Check size={11} style={{ color: '#0F1923' }} />
                        </div>
                      )}
                      <Icon size={20} className="mb-2" style={{ color: active ? accent : 'rgba(245,240,232,0.4)' }} />
                      <div className="font-medium text-sm" style={{ color: active ? '#F5F0E8' : 'rgba(245,240,232,0.7)' }}>{label}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>{desc}</div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">
                  {selected.length === 0 ? 'Skip' : `Continue (${selected.length} selected)`}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bio */}
          {step === 2 && (
            <div className="fade-up">
              <h2 className="font-display text-2xl font-semibold mb-2">Introduce yourself</h2>
              <p className="text-[#F5F0E8]/50 text-sm mb-6">
                A short bio that other club members will see on your profile. Totally optional.
              </p>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={300}
                rows={4}
                placeholder="E.g. Sci-fi reader, slow to finish anything, always starting something new…"
                className="w-full rounded-xl px-3.5 py-3 text-sm resize-none border border-[#F5F0E8]/12 outline-none focus:border-[#E8A020]/60 transition-colors"
                style={{ background: '#0F1923', color: '#F5F0E8' }}
              />
              <div className="text-right text-xs text-[#F5F0E8]/30 mt-1">{bio.length}/300</div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  {bio.trim() ? 'Continue' : 'Skip'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center fade-up">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(122,158,126,0.2)' }}>
                <Sparkles size={28} style={{ color: '#7A9E7E' }} />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">You're all set!</h2>
              <p className="text-[#F5F0E8]/50 text-sm mb-8">
                Your profile is ready. Explore the feed, join a club, and start tracking.
              </p>
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {selected.map(id => {
                    const { label, accent } = INTERESTS.find(i => i.id === id)
                    return (
                      <span key={id} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                        {label}
                      </span>
                    )
                  })}
                </div>
              )}
              <button onClick={finish} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? 'Setting up…' : 'Enter Folio'} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
