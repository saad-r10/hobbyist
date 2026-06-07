import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../api/client.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const me = await login(form.email, form.password)
      navigate(me.onboardingDone ? from : '/onboarding', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: forgotEmail }) })
      setForgotSent(true)
    } catch { setForgotSent(true) } // Always show success to prevent enumeration
    finally { setForgotLoading(false) }
  }

  if (forgotMode) {
    return (
      <AuthShell>
        <h2 className="font-display text-2xl font-semibold mb-1">Reset your password</h2>
        <p className="text-t50 text-sm mb-6">We'll send a reset link to your inbox.</p>
        {forgotSent ? (
          <div className="rounded-xl border border-success bg-success-10 p-4 text-sm text-success">
            If that email is registered, a reset link is on its way. Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <Field label="Email address">
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                required placeholder="you@example.com" className="input-field" />
            </Field>
            <button type="submit" disabled={forgotLoading} className="btn-primary w-full">
              {forgotLoading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <button onClick={() => { setForgotMode(false); setForgotSent(false) }} className="mt-4 text-sm text-t40 hover:text-t70 transition-colors">
          ← Back to sign in
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h2 className="font-display text-2xl font-semibold mb-1">Welcome back</h2>
      <p className="text-t50 text-sm mb-6">Sign in to your Hobbyist account.</p>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger-40 bg-danger-10 p-3 text-sm text-danger mb-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email address">
          <input type="email" value={form.email} onChange={set('email')} required
            placeholder="you@example.com" autoComplete="email" className="input-field" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
              required placeholder="••••••••" autoComplete="current-password" className="input-field pr-10" />
            <button type="button" onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-t40 hover:text-t70 transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-accent hover:text-[#E8A020] transition-colors">
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-t40">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#E8A020] hover:text-accent transition-colors font-medium">
          Create one
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-t08 bg-[#F5F0E8]/03 p-3 text-xs text-t30 text-center">
        Demo: alex@hobbyist.app / password123
      </div>
    </AuthShell>
  )
}

function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A020' }}>
            <BookOpen size={16} style={{ color: 'var(--bg)' }} />
          </div>
          <span className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>Hobbyist</span>
        </div>
        <div className="rounded-2xl p-6 border border-t08" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-t60 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
