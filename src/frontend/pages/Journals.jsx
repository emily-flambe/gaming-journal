import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Journals() {
  const { user, logout } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent') // recent, alphabetical, rating, entries
  const [filterHasEntries, setFilterHasEntries] = useState(false)

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

  const filteredLogs = logs.filter(log => !filterHasEntries || (log.journal_count > 0))

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.game_name.localeCompare(b.game_name)
      case 'rating':
        return (b.rating ?? -1) - (a.rating ?? -1)
      case 'entries':
        return (b.journal_count || 0) - (a.journal_count || 0)
      case 'recent':
      default: {
        const dateA = a.end_date || a.start_date || ''
        const dateB = b.end_date || b.start_date || ''
        return dateB.localeCompare(dateA)
      }
    }
  })

  const getColor = (rating) => {
    if (rating === undefined || rating === null) return 'bg-gray-600'
    if (rating >= 9) return 'bg-emerald-600'
    if (rating >= 7) return 'bg-blue-600'
    if (rating >= 5) return 'bg-amber-600'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading journals...</div>
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
              <Link to="/timeline" className="text-gray-400 hover:text-white transition-colors">Timeline</Link>
              <span className="text-white font-medium border-b-2 border-purple-400 pb-0.5">Journals</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
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

      {/* Main content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {/* Filters and sorting */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={filterHasEntries}
                onChange={(e) => setFilterHasEntries(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600"
              />
              Only with entries
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="alphabetical">A-Z</option>
              <option value="rating">Rating</option>
              <option value="entries">Entry Count</option>
            </select>
          </div>
        </div>

        {/* Games list */}
        {sortedLogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {filterHasEntries ? 'No games with journal entries yet.' : 'No games logged yet.'}
            </p>
            <Link to="/timeline" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
              Go to timeline to add games
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map(log => (
              <Link
                key={log.id}
                to={`/journal/${log.id}`}
                className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {log.cover_url && (
                    <img
                      src={log.cover_url}
                      alt={log.game_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white truncate">{log.game_name}</h3>
                      {log.rating !== null && log.rating !== undefined && (
                        <span className={`px-2 py-0.5 rounded text-sm font-bold ${getColor(log.rating)} flex-shrink-0`}>
                          {log.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      {log.start_date && <span>Started: {log.start_date}</span>}
                      {log.end_date && <span>Finished: {log.end_date}</span>}
                    </div>
                    <div className="mt-2 text-sm">
                      {log.journal_count > 0 ? (
                        <span className="text-purple-400">
                          {log.journal_count} journal {log.journal_count === 1 ? 'entry' : 'entries'}
                        </span>
                      ) : (
                        <span className="text-gray-500">No journal entries yet</span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
