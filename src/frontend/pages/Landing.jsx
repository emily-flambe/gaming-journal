import { Link } from 'react-router-dom'
import { useAuth } from '../App'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Gaming Journal
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Track your gaming history. Write notes while playing. Share your timeline.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            {user ? (
              <Link
                to="/timeline"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Timeline
              </Link>
            ) : (
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </a>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Games</h3>
              <p className="text-gray-400 text-sm">
                Log games you play with ratings, start/end dates, and notes. Search from thousands of games.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-white mb-2">Journal While Playing</h3>
              <p className="text-gray-400 text-sm">
                Write entries as you play to capture your thoughts, progress, and memorable moments.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Your Timeline</h3>
              <p className="text-gray-400 text-sm">
                Make your timeline public and share it with friends at your own unique URL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
