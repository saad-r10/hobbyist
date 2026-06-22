import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const pwStrength = (pw) => {
    if (pw.length === 0) return null
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = pwStrength(form.password)
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][Math.min(strength - 1, 3)] || ''
  const strengthColor = ['#E87070', '#D4A853', '#7A9E7E', '#4AADAB'][Math.min(strength - 1, 3)] || '#E87070'

  function validate() {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.username) e.username = 'Username is required'
    else if (!/^[a-zA-Z0-9_]{2,30}$/.test(form.username)) e.username = 'Letters, numbers, underscores only (2-30 chars)'
    if (!form.displayName.trim()) e.displayName = 'Name is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register({ email: form.email, username: form.username, displayName: form.displayName, password: form.password })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="fade-up">
        <div className="mb-7">
          <h2 className="font-display text-fs-2xl font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
            Create your account
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-50)' }}>
            Join clubs, track your reads and watches.
          </p>
        </div>

        {serverError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger-40 bg-danger-10 p-3 text-sm text-danger mb-5">
            <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Display name" error={errors.displayName}>
            <input type="text" value={form.displayName} onChange={set('displayName')}
              placeholder="Alex Chen" autoComplete="name"
              className={`input-field ${errors.displayName ? 'border-[#E87070]/60' : ''}`} />
          </Field>

          <Field label="Username" error={errors.username}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-t30">@</span>
              <input type="text" value={form.username} onChange={set('username')}
                placeholder="alexchen" autoComplete="username"
                className={`input-field pl-7 ${errors.username ? 'border-[#E87070]/60' : ''}`} />
            </div>
          </Field>

          <Field label="Email address" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="you@example.com" autoComplete="email"
              className={`input-field ${errors.email ? 'border-[#E87070]/60' : ''}`} />
          </Field>

          <Field label="Password" error={errors.password}>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                placeholder="At least 8 characters" autoComplete="new-password"
                className={`input-field pr-10 ${errors.password ? 'border-[#E87070]/60' : ''}`} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-t40 hover:text-t70 focus-ring rounded">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= strength ? strengthColor : 'var(--border-08)' }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </Field>

          <Field label="Confirm password" error={errors.confirmPassword}>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="Repeat your password" autoComplete="new-password"
                className={`input-field pr-10 ${errors.confirmPassword ? 'border-[#E87070]/60' : ''}`} />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <Check size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />
              )}
            </div>
          </Field>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-3 !text-sm mt-2">
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-40)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-t60">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
