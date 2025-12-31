import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'

export default function Settings() {
  const { user, checkAuth } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const user = data.data
        setProfile(user)
        setUsername(user.username || '')
        setDisplayName(user.display_name || '')
        setIsPublic(user.is_public || false)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          display_name: displayName,
          is_public: isPublic,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved!' })
        setProfile(prev => ({ ...prev, is_public: isPublic, username, display_name: displayName }))
        checkAuth()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error?.message || 'Failed to save settings' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-400">Settings</h1>
          <Link
            to="/timeline"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Timeline
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-500 text-xs mt-1">
              Your public URL will be: /u/{username || 'your-username'}
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublic ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <label className="text-sm text-gray-300">
              Make my timeline public
            </label>
          </div>

          {profile?.is_public && username && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                Your timeline is visible at:{' '}
                <a
                  href={`/u/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  {window.location.origin}/u/{username}
                </a>
              </p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

      </div>
    </div>
  )
}
