import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Timeline from './pages/Timeline'
import Settings from './pages/Settings'
import PublicTimeline from './pages/PublicTimeline'
import ImpersonationBanner from './components/ImpersonationBanner'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.data)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  async function stopImpersonating() {
    try {
      const res = await fetch('/api/admin/stop-impersonation', {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Stop impersonation failed:', err)
    }
  }

  const isAdmin = Boolean(user?.is_admin)
  const isImpersonating = Boolean(user?.is_impersonating)

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkAuth, isAdmin, isImpersonating, stopImpersonating }}>
      {children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ImpersonationBanner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/timeline" element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/u/:username" element={<PublicTimeline />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
