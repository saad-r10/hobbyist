import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { api } from '../api/client.js'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <Shell>
        <div className="text-center">
          <p className="text-[#E87070] mb-4">Invalid or missing reset token.</p>
          <Link to="/login" className="btn-primary">Back to sign in</Link>
        </div>
      </Shell>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setLoading(true)
    try {
      await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Shell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(122,158,126,0.2)' }}>
            <Check size={24} style={{ color: '#7A9E7E' }} />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">Password updated!</h2>
          <p className="text-[#F5F0E8]/50 text-sm mb-6">You can now sign in with your new password.</p>
          <button onClick={() => navigate('/login', { replace: true })} className="btn-primary w-full">Sign in</button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <h2 className="font-display text-2xl font-semibold mb-1">Set new password</h2>
      <p className="text-[#F5F0E8]/50 text-sm mb-6">Choose a strong password for your account.</p>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[#E87070]/40 bg-[#E87070]/10 p-3 text-sm text-[#E87070] mb-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#F5F0E8]/60 mb-1.5">New password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} placeholder="At least 8 characters" className="input-field pr-10" />
            <button type="button" onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70 transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#F5F0E8]/60 mb-1.5">Confirm password</label>
          <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
            required placeholder="Repeat your password" className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0F1923' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A020' }}>
            <BookOpen size={16} style={{ color: '#0F1923' }} />
          </div>
          <span className="font-display text-xl font-semibold" style={{ color: '#F5F0E8' }}>Folio</span>
        </div>
        <div className="rounded-2xl p-6 border border-[#F5F0E8]/08" style={{ background: '#162030', color: '#F5F0E8' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
