import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, ArrowRight, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../api/client.js'
import AuthLayout from '../components/AuthLayout.jsx'

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
    } catch { setForgotSent(true) }
    finally { setForgotLoading(false) }
  }

  if (forgotMode) {
    return (
      <AuthLayout>
        <div className="fade-up">
          <div className="mb-7">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                 style={{ background: 'var(--accent-12)', border: '1px solid var(--accent-25)' }}>
              <Mail size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-display text-fs-2xl font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
              Reset password
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-50)' }}>
              We'll send a reset link to your inbox.
            </p>
          </div>

          {forgotSent ? (
            <div className="rounded-xl p-4 text-sm bg-success-10 border border-success" style={{ color: 'var(--success)' }}>
              If that email is registered, a reset link is on its way. Check your inbox (and spam folder).
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <Field label="Email address">
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  required placeholder="you@example.com" className="input-field" />
              </Field>
              <button type="submit" disabled={forgotLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {forgotLoading ? 'Sending…' : 'Send reset link'}
                {!forgotLoading && <ArrowRight size={15} />}
              </button>
            </form>
          )}

          <button
            onClick={() => { setForgotMode(false); setForgotSent(false) }}
            className="mt-5 text-sm transition-colors"
            style={{ color: 'var(--text-40)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-70)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-40)'}
          >
            ← Back to sign in
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="fade-up">
        <div className="mb-7">
          <h2 className="font-display text-fs-2xl font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
            Welcome back
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-50)' }}>
            Sign in to your Hobbyist account.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger-40 bg-danger-10 p-3 text-sm text-danger mb-5">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
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
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-t40 hover:text-t70">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          <div className="flex justify-end -mt-1">
            <button type="button" onClick={() => setForgotMode(true)}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--accent)' }}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-3 !text-sm">
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-40)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium transition-colors"
            style={{ color: 'var(--accent)' }}>
            Create one
          </Link>
        </p>

        <div className="mt-8 rounded-xl border border-t08 p-3 text-xs text-center"
             style={{ background: 'var(--surface-04)', color: 'var(--text-30)' }}>
          Demo: alex@hobbyist.app / password123
        </div>
      </div>
    </AuthLayout>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-t60">{label}</label>
      {children}
    </div>
  )
}
