import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Onboarding from './pages/Onboarding.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import PublicClub from './pages/PublicClub.jsx'

// GitHub Pages can't handle BrowserRouter paths — use HashRouter for demo build
const Router = import.meta.env.VITE_DEMO_MODE === 'true' ? HashRouter : BrowserRouter

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1923' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#E8A020] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

function RequireOnboarding({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user && !user.onboardingDone) return <Navigate to="/onboarding" replace />
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.onboardingDone ? '/app' : '/onboarding'} replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/clubs/:id" element={<PublicClub />} />
          <Route path="/onboarding" element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          } />
          <Route path="/app" element={
            <RequireAuth>
              <RequireOnboarding>
                <App />
              </RequireOnboarding>
            </RequireAuth>
          } />
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  </StrictMode>
)
