import { useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages = {
    oauth_failed: 'Sign in failed. Please try again.',
    invalid_state: 'Invalid session. Please try again.',
    email_not_verified: 'Please verify your email first.',
    missing_params: 'Something went wrong. Please try again.',
  }

  useEffect(() => {
    if (user && !loading) {
      navigate('/timeline')
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-white hover:text-purple-300 transition-colors">
            Gaming Journal
          </Link>
          <p className="text-gray-400 mt-2">Sign in to track your gaming history</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Sign In</h2>

          {error && errorMessages[error] && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm text-center">
              {errorMessages[error]}
            </div>
          )}

          <div className="space-y-4">
            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span role="button">Sign in with Google</span>
            </a>

          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          <Link to="/" className="hover:text-purple-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
