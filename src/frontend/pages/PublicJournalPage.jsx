import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { RatingChart } from './JournalPage'

function CollapsibleEntry({ entry, isExpanded, onToggle, onExpandUpTo }) {
  const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getColor = (rating) => {
    if (rating === null || rating === undefined) return 'bg-gray-600'
    if (rating >= 9) return 'bg-emerald-600'
    if (rating >= 7) return 'bg-blue-600'
    if (rating >= 5) return 'bg-amber-600'
    return 'bg-red-500'
  }

  const predictionCount = entry.predictions?.length || 0

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        {entry.rating !== null && entry.rating !== undefined && (
          <span className={`px-2 py-1 rounded text-sm font-bold ${getColor(entry.rating)} flex-shrink-0`}>
            {entry.rating}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{formatDate(entry.created_at)}</span>
            {entry.progress && <span className="text-sm text-purple-400">• {entry.progress}</span>}
          </div>
          <h4 className="font-medium text-white truncate">{entry.title || 'Untitled Entry'}</h4>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {predictionCount > 0 && (
            <span className="text-xs text-gray-400">{predictionCount} prediction{predictionCount !== 1 ? 's' : ''}</span>
          )}
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!isExpanded && (
        <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700">
          <button onClick={onExpandUpTo} className="text-xs text-purple-400 hover:text-purple-300">
            Expand all up to here
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="px-4 py-4 bg-gray-900/50 border-t border-gray-700">
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{entry.content}</div>

          {entry.predictions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h5 className="text-sm font-medium text-purple-400 mb-2">Predictions made</h5>
              <ul className="space-y-1">
                {entry.predictions.map(pred => (
                  <li key={pred.id} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{pred.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AllPredictionsSection({ entries }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const allPredictions = entries.flatMap(entry =>
    (entry.predictions || []).map(pred => ({
      ...pred,
      entryTitle: entry.title,
      entryProgress: entry.progress,
      entryDate: entry.created_at
    }))
  )

  if (allPredictions.length === 0) return null

  const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'border-l-emerald-500 bg-emerald-900/20'
      case 'incorrect': return 'border-l-red-500 bg-red-900/20'
      case 'partially_correct': return 'border-l-amber-500 bg-amber-900/20'
      default: return 'border-l-gray-500 bg-gray-800/50'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'correct': return { text: 'Correct', color: 'text-emerald-400' }
      case 'incorrect': return { text: 'Wrong', color: 'text-red-400' }
      case 'partially_correct': return { text: 'Partial', color: 'text-amber-400' }
      default: return { text: 'Open', color: 'text-gray-400' }
    }
  }

  const openCount = allPredictions.filter(p => p.status === 'open').length
  const resolvedCount = allPredictions.length - openCount

  return (
    <div className="mt-8 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-medium">All Predictions</span>
          <span className="text-sm text-gray-400">
            {allPredictions.length} total • {openCount} open • {resolvedCount} resolved
          </span>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-900/50 border-t border-gray-700 space-y-3">
          <p className="text-xs text-amber-400 mb-4">Spoiler warning: This section shows prediction outcomes</p>

          {allPredictions.map(pred => {
            const statusInfo = getStatusLabel(pred.status)
            return (
              <div key={pred.id} className={`border-l-4 rounded-r p-3 ${getStatusColor(pred.status)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{pred.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      From: {pred.entryTitle || pred.entryProgress || formatDate(pred.entryDate)}
                    </p>
                    {pred.resolution_notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">"{pred.resolution_notes}"</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function PublicJournalPage() {
  const { username, logId } = useParams()
  const [profile, setProfile] = useState(null)
  const [gameLog, setGameLog] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())

  useEffect(() => {
    fetchJournal()
  }, [username, logId])

  async function fetchJournal() {
    try {
      const res = await fetch(`/api/u/${username}/journal/${logId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.data?.user)
        setGameLog(data.data?.log)
        setEntries(data.data?.entries || [])
      } else if (res.status === 404) {
        setError('Journal not found')
      } else if (res.status === 403) {
        setError('This journal is private')
      } else {
        setError('Failed to load journal')
      }
    } catch {
      setError('Failed to load journal')
    } finally {
      setLoading(false)
    }
  }

  function toggleEntry(id) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandUpTo(index) {
    const idsToExpand = entries.slice(0, index + 1).map(e => e.id)
    setExpandedIds(new Set(idsToExpand))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading journal...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error}</p>
          <Link to="/" className="text-purple-400 hover:underline">
            Go to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">
            <Link to={`/u/${username}`} className="text-gray-400 hover:text-purple-400">
              {profile?.display_name || username}
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <span>{gameLog?.game_name}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            {gameLog?.start_date && ` • Started ${gameLog.start_date}`}
            {gameLog?.end_date && ` • Finished ${gameLog.end_date}`}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
        {entries.length >= 2 && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Rating Over Time</h3>
            <RatingChart entries={entries} />
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No journal entries yet.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <CollapsibleEntry
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedIds.has(entry.id)}
                  onToggle={() => toggleEntry(entry.id)}
                  onExpandUpTo={() => expandUpTo(index)}
                />
              ))}
            </div>

            <AllPredictionsSection entries={entries} />
          </>
        )}
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-700">
        <Link to="/" className="hover:text-purple-400 transition-colors">
          Create your own Gaming Journal
        </Link>
      </footer>
    </div>
  )
}
