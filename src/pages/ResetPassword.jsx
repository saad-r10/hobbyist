import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Check, ArrowRight, ShieldCheck } from 'lucide-react'
import { api } from '../api/client.js'
import AuthLayout from '../components/AuthLayout.jsx'

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
      <AuthLayout>
        <div className="text-center fade-up">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-5"
               style={{ background: 'var(--danger-10)', border: '1px solid var(--danger-40)' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <h2 className="font-display text-fs-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Invalid link
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-50)' }}>
            This reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            Back to sign in <ArrowRight size={15} />
          </Link>
        </div>
      </AuthLayout>
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
      <AuthLayout>
        <div className="text-center fade-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'var(--success-10)', border: '1px solid var(--success-40)' }}>
            <Check size={26} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="font-display text-fs-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Password updated!
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-50)' }}>
            You can now sign in with your new password.
          </p>
          <button onClick={() => navigate('/login', { replace: true })}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
            Sign in <ArrowRight size={15} />
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="fade-up">
        <div className="mb-7">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
               style={{ background: 'var(--accent-12)', border: '1px solid var(--accent-25)' }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="font-display text-fs-2xl font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
            Set new password
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-50)' }}>
            Choose a strong password for your account.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger-40 bg-danger-10 p-3 text-sm text-danger mb-5">
            <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-t60">New password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={8} placeholder="At least 8 characters" className="input-field pr-10" />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-t40 hover:text-t70">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-t60">Confirm password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required placeholder="Repeat your password" className="input-field pr-8" />
              {confirm && password === confirm && (
                <Check size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-3 !text-sm">
            {loading ? 'Updating…' : 'Update password'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
