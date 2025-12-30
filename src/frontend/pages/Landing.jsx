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
              <Link
                to="/login"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Get Started
              </Link>
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
