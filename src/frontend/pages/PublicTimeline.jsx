import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function PublicTimeline() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    fetchTimeline()
  }, [username])

  async function fetchTimeline() {
    try {
      const res = await fetch(`/api/u/${username}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.data?.user)
        setLogs(data.data?.logs || [])
      } else if (res.status === 404) {
        setError('User not found')
      } else {
        setError('Failed to load timeline')
      }
    } catch (err) {
      setError('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  // Group logs by year
  const logsByYear = logs.reduce((acc, log) => {
    const date = log.end_date || log.start_date
    if (!date) return acc
    const year = date.split('-')[0]
    if (!acc[year]) acc[year] = []
    acc[year].push(log)
    return acc
  }, {})

  const years = Object.keys(logsByYear).sort((a, b) => b - a)

  const getPosition = (rating) => {
    if (!rating) return 50
    const min = 1
    const max = 10
    const normalized = (rating - min) / (max - min)
    return 5 + normalized * 90
  }

  const getColor = (rating) => {
    if (!rating) return 'bg-gray-500'
    if (rating >= 9) return 'bg-emerald-500'
    if (rating >= 7) return 'bg-blue-500'
    if (rating >= 5) return 'bg-amber-500'
    return 'bg-red-400'
  }

  const getBorderColor = (rating) => {
    if (!rating) return 'border-gray-400'
    if (rating >= 9) return 'border-emerald-400'
    if (rating >= 7) return 'border-blue-400'
    if (rating >= 5) return 'border-amber-400'
    return 'border-red-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error}</p>
          <Link
            to="/"
            className="text-purple-400 hover:underline"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center">
          <h1 className="text-2xl font-bold text-white">
            {profile?.display_name || username}'s Gaming Timeline
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {logs.length} {logs.length === 1 ? 'game' : 'games'} logged
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Legend */}
        <div className="flex justify-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Disliked (1-4)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Mixed (5-6)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Liked (7-8)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Loved (9-10)</div>
        </div>

        <p className="text-center text-gray-400 mb-6 text-sm">
          ← Liked Less | Liked More →
        </p>

        {/* Timeline */}
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No games logged yet.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 -translate-x-1/2"></div>

            {years.map(year => (
              <div key={year} className="mb-8">
                <div className="sticky top-0 z-10 bg-gray-900/95 py-2 border-b border-gray-700 mb-4">
                  <h2 className="text-xl font-bold text-center text-purple-400">{year}</h2>
                </div>

                <div className="flex flex-col gap-1">
                  {logsByYear[year].map((log) => {
                    const left = getPosition(log.rating)
                    const isSelected = selectedLog?.id === log.id

                    return (
                      <div key={log.id} className="relative h-7">
                        <button
                          onClick={() => setSelectedLog(isSelected ? null : log)}
                          className={`absolute px-2 py-1 rounded text-xs font-medium transition-all border-2 ${getColor(log.rating)} ${getBorderColor(log.rating)}
                            ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 z-20' : ''}
                            hover:brightness-110 text-white shadow-lg whitespace-nowrap`}
                          style={{
                            left: `${left}%`,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          {log.game_name.length > 25 ? log.game_name.substring(0, 23) + '...' : log.game_name}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Game Detail */}
        {selectedLog && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-600 p-4 shadow-2xl max-h-64 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{selectedLog.game_name}</h3>
                  <p className="text-gray-400 text-sm">
                    {selectedLog.start_date && `Started: ${selectedLog.start_date}`}
                    {selectedLog.start_date && selectedLog.end_date && ' • '}
                    {selectedLog.end_date && `Finished: ${selectedLog.end_date}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedLog.rating && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getColor(selectedLog.rating)}`}>
                      {selectedLog.rating}/10
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {selectedLog.notes || "No notes for this game."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <Link to="/" className="hover:text-purple-400 transition-colors">
          Create your own Gaming Journal
        </Link>
      </footer>
    </div>
  )
}
