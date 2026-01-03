import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Timeline from './pages/Timeline'
import Journals from './pages/Journals'
import Settings from './pages/Settings'
import PublicTimeline from './pages/PublicTimeline'
import JournalPage from './pages/JournalPage'
import PublicJournalPage from './pages/PublicJournalPage'
import ImpersonationBanner from './components/ImpersonationBanner'

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
          <Route path="/journals" element={
            <ProtectedRoute>
              <Journals />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/journal/:logId" element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          } />
          <Route path="/u/:username" element={<PublicTimeline />} />
          <Route path="/u/:username/journal/:logId" element={<PublicJournalPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
