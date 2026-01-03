import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import TimelineView from '../components/TimelineView'

export default function PublicTimeline() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch(`/api/u/${username}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data.data?.user)
          setLogs(data.data?.logs || [])
        } else if (res.status === 404) {
          setError('User not found')
        } else if (res.status === 403) {
          setError('private')
        } else {
          setError('Failed to load timeline')
        }
      } catch {
        setError('Failed to load timeline')
      } finally {
        setLoading(false)
      }
    }
    fetchTimeline()
  }, [username])

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
          {error === 'private' ? (
            <>
              <p className="text-gray-400 mb-2">This user's timeline is private.</p>
              <p className="text-gray-500 text-sm mb-4">For now!</p>
            </>
          ) : (
            <p className="text-gray-400 mb-4">{error}</p>
          )}
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
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

      {/* Timeline */}
      <div className="flex-1">
        <TimelineView
          logs={logs}
          editable={false}
          username={username}
        />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-700">
        <Link to="/" className="hover:text-purple-400 transition-colors">
          Create your own Gaming Journal
        </Link>
      </footer>
    </div>
  )
}
