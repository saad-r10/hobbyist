import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#0F1923' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A020' }}>
            <BookOpen size={16} style={{ color: '#0F1923' }} />
          </div>
          <span className="font-display text-xl font-semibold" style={{ color: '#F5F0E8' }}>Folio</span>
        </div>

        <div className="rounded-2xl p-6 border border-[#F5F0E8]/08" style={{ background: '#162030', color: '#F5F0E8' }}>
          <h2 className="font-display text-2xl font-semibold mb-1">Create your account</h2>
          <p className="text-[#F5F0E8]/50 text-sm mb-6">Join clubs, track your reads and watches.</p>

          {serverError && (
            <div className="flex items-start gap-2 rounded-xl border border-[#E87070]/40 bg-[#E87070]/10 p-3 text-sm text-[#E87070] mb-4">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/30 text-sm">@</span>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-0.5 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColor : 'rgba(245,240,232,0.1)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </Field>

            <Field label="Confirm password" error={errors.confirmPassword}>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Repeat your password" autoComplete="new-password"
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-[#E87070]/60' : ''}`} />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A9E7E]" />
                )}
              </div>
            </Field>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#F5F0E8]/40">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E8A020] hover:text-[#E8A020]/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#F5F0E8]/60 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[#E87070]">{error}</p>}
    </div>
  )
}
