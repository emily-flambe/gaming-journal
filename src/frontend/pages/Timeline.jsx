import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AddGameModal from '../components/AddGameModal'
import TimelineView from '../components/TimelineView'

export default function Timeline() {
  const { user, logout } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

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
