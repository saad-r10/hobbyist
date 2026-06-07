import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setAccessToken } from '../api/client.js'
import { getDemoUser, setDemoUser } from '../api/demo.js'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = not authed
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      // Demo mode: restore from session-backed demo state (not hardcoded Alex Chen)
      setAccessToken('demo-token')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({ ...getDemoUser() })
      setLoading(false)
      return
    }
    // Real mode: restore session via refresh token cookie
    api('/auth/refresh', { method: 'POST' })
      .then(data => {
        setAccessToken(data.accessToken)
        return api('/users/me')
      })
      .then(me => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setAccessToken(data.accessToken)
    const me = await api('/users/me')
    if (IS_DEMO) setDemoUser(me)
    setUser(me)
    return me
  }, [])

  const register = useCallback(async ({ email, username, displayName, password }) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, displayName, password }),
    })
    setAccessToken(data.accessToken)
    const me = await api('/users/me')
    if (IS_DEMO) setDemoUser(me)
    setUser(me)
    return me
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    setAccessToken(null)
    if (IS_DEMO) {
      // Reset demo session
      try { sessionStorage.removeItem('hobbyist-demo-v2') } catch { /* storage unavailable */ }
    }
    setUser(null)
  }, [])

  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const updated = { ...prev, ...patch }
      if (IS_DEMO) setDemoUser(updated)
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
