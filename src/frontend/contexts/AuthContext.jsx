import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
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
