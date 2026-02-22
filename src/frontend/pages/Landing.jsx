import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const features = [
  {
    num: '01',
    title: 'Track your games',
    desc: 'Log what you play with ratings, start and end dates, and notes. Search from thousands of titles.',
  },
  {
    num: '02',
    title: 'Journal while you play',
    desc: 'Write entries as you go — first impressions, turning points, final thoughts. Build a record of your experience.',
  },
  {
    num: '03',
    title: 'Share your timeline',
    desc: 'Make your gaming history public at your own URL. Let friends see what you\'ve been playing.',
  },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-land-bg font-body text-land-text">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-6">
        <span className="font-display text-sm font-medium tracking-wide text-land-muted">
          Gaming Journal
        </span>
        {user ? (
          <Link
            to="/timeline"
            className="text-sm text-land-accent hover:text-land-accent-hover transition-colors"
          >
            Go to Timeline &rarr;
          </Link>
        ) : (
          <a
            href="/api/auth/google"
            className="text-sm text-land-muted hover:text-land-text transition-colors"
          >
            Sign in
          </a>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pt-24 md:pt-36 pb-20">
        <h1
          className="font-display text-5xl md:text-7xl font-600 leading-[1.1] tracking-tight mb-8 animate-fade-up"
        >
          Your gaming story,{' '}
          <span className="text-land-accent">written down.</span>
        </h1>

        <p
          className="text-lg md:text-xl text-land-muted leading-relaxed max-w-lg mb-12 animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          A personal timeline for the games you play. Track, journal, and share — all in one place.
        </p>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {user ? (
            <Link
              to="/timeline"
              className="inline-block px-7 py-3 bg-land-accent hover:bg-land-accent-hover text-land-bg font-display text-sm font-medium tracking-wide rounded transition-colors"
            >
              Go to Timeline
            </Link>
          ) : (
            <a
              href="/api/auth/google"
              className="inline-flex items-center gap-3 px-7 py-3 bg-land-accent hover:bg-land-accent-hover text-land-bg font-display text-sm font-medium tracking-wide rounded transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </a>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <div className="h-px bg-land-border" />
      </div>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="space-y-16">
          {features.map((f, i) => (
            <div
              key={f.num}
              className="animate-fade-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-display text-xs font-medium text-land-accent tracking-widest">
                  {f.num}
                </span>
                <h3 className="font-display text-xl md:text-2xl font-medium tracking-tight">
                  {f.title}
                </h3>
              </div>
              <p className="text-land-muted text-base md:text-lg leading-relaxed pl-10">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
