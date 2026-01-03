import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AddGameModal from '../components/AddGameModal'
import TimelineView from '../components/TimelineView'

export default function Timeline() {
  const { user, logout, checkAuth } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const res = await fetch('/api/logs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }

  async function togglePublic() {
    if (togglingPublic) return
    setTogglingPublic(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_public: !user.is_public })
      })
      if (res.ok) {
        await checkAuth()
      }
    } finally {
      setTogglingPublic(false)
    }
  }

  function getPublicUrl() {
    return `${window.location.origin}/u/${user.username}`
  }

  function copyPublicUrl() {
    navigator.clipboard.writeText(getPublicUrl())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading your games...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-purple-400">Gaming Journal</h1>
            <nav className="flex items-center gap-4">
              <span className="text-white font-medium border-b-2 border-purple-400 pb-0.5">Timeline</span>
              <Link to="/journals" className="text-gray-400 hover:text-white transition-colors">Journals</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              + Add Game
            </button>
            <span className="text-gray-400 text-base">
              {user?.display_name || user?.username}
            </span>
            <Link
              to="/settings"
              className="text-gray-400 hover:text-white transition-colors text-base"
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors text-base"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Timeline header and Public/Private toggle */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-6">
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-4">Timeline</h2>
        <div className="flex justify-center">
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 inline-block">
            {user?.is_public ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-emerald-400 font-medium">Public</span>
                  </div>
                  <button
                    onClick={togglePublic}
                    disabled={togglingPublic}
                    className="px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                  >
                    Make Private
                  </button>
                  <button
                    onClick={copyPublicUrl}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Copy Link
                  </button>
                  <a
                    href={getPublicUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    View Public Page
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Anyone with the link can view your timeline: <a href={getPublicUrl()} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">{getPublicUrl()}</a>
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm text-gray-400">This timeline is private. Only you can see it.</span>
                </div>
                <button
                  onClick={togglePublic}
                  disabled={togglingPublic}
                  className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {togglingPublic ? 'Sharing...' : 'Share Publicly'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1">
        <TimelineView
          logs={logs}
          editable={true}
          onLogsChange={setLogs}
          onLogUpdate={fetchLogs}
        />
      </div>

      {showAddModal && (
        <AddGameModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            fetchLogs()
          }}
        />
      )}
    </div>
  )
}
