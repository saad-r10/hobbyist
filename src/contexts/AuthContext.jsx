import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setAccessToken } from '../api/client.js'
import { ME as DEMO_ME } from '../api/demo.js'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = not authed
  const [loading, setLoading] = useState(true)

  // On mount, restore session (demo: auto-login as Alex Chen)
  useEffect(() => {
    if (IS_DEMO) {
      setAccessToken('demo-token')
      setUser({ ...DEMO_ME })
      setLoading(false)
      return
    }
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
    setUser(me)
    return me
  }, [])

  const register = useCallback(async ({ email, username, displayName, password }) => {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, username, displayName, password }) })
    setAccessToken(data.accessToken)
    const me = await api('/users/me')
    setUser(me)
    return me
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    setAccessToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch) => {
    setUser(prev => ({ ...prev, ...patch }))
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
