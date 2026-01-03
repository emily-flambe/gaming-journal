import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import JournalEntryForm from '../components/JournalEntryForm'

function RatingChart({ entries, mini = false }) {
  const entriesWithRating = entries.filter(e => e.rating !== null && e.rating !== undefined)
  if (entriesWithRating.length < 2) return null

  const width = mini ? 200 : 500
  const height = mini ? 60 : 140
  const padding = mini
    ? { top: 10, right: 10, bottom: 15, left: 25 }
    : { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points = entriesWithRating.map((entry, index) => ({
    x: padding.left + (index / (entriesWithRating.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (entry.rating / 10) * chartHeight,
    rating: entry.rating,
    title: entry.title || entry.progress || `Entry ${index + 1}`
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const getColor = (rating) => {
    if (rating >= 9) return '#10b981'
    if (rating >= 7) return '#3b82f6'
    if (rating >= 5) return '#f59e0b'
    return '#f87171'
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={mini ? 'w-full max-w-[200px]' : 'w-full max-w-lg'}>
      {!mini && [0, 5, 10].map(val => (
        <text
          key={val}
          x={padding.left - 8}
          y={padding.top + chartHeight - (val / 10) * chartHeight + 4}
          className="fill-gray-500 text-xs"
          textAnchor="end"
        >
          {val}
        </text>
      ))}
      {[0, 5, 10].map(val => (
        <line
          key={val}
          x1={padding.left}
          y1={padding.top + chartHeight - (val / 10) * chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight - (val / 10) * chartHeight}
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray={val === 5 ? '4,4' : '0'}
        />
      ))}
      <path d={pathD} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, i) => (
        <g key={i}>
          <circle cx={point.x} cy={point.y} r={mini ? 4 : 6} fill={getColor(point.rating)} stroke="#1f2937" strokeWidth="2" />
          <title>{`${point.title}: ${point.rating}/10`}</title>
        </g>
      ))}
    </svg>
  )
}

function CollapsibleEntry({ entry, isExpanded, onToggle, onExpandUpTo, isOwner, onEdit, onDelete }) {
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
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">{entry.content}</div>

          {/* Show predictions without status (spoiler-free) */}
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

          {isOwner && (
            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
              <button onClick={onEdit} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded">Edit</button>
              <button onClick={onDelete} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded">Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AllPredictionsSection({ entries, isOwner, onResolvePrediction }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [resolving, setResolving] = useState(null)
  const [resolutionStatus, setResolutionStatus] = useState('correct')
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Collect all predictions with their entry context
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

  async function handleResolve(predictionId) {
    await onResolvePrediction(predictionId, resolutionStatus, resolutionNotes)
    setResolving(null)
    setResolutionNotes('')
    setResolutionStatus('correct')
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
          <p className="text-xs text-amber-400 mb-4">⚠️ Spoiler warning: This section shows prediction outcomes</p>

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

                {isOwner && pred.status === 'open' && (
                  <div className="mt-3">
                    {resolving === pred.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {['correct', 'incorrect', 'partially_correct'].map(status => (
                            <button
                              key={status}
                              onClick={() => setResolutionStatus(status)}
                              className={`px-2 py-1 rounded text-xs ${resolutionStatus === status
                                ? (status === 'correct' ? 'bg-emerald-600' : status === 'incorrect' ? 'bg-red-600' : 'bg-amber-600')
                                : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                              {status === 'partially_correct' ? 'Partial' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Notes (optional)..."
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleResolve(pred.id)} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm">Resolve</button>
                          <button onClick={() => setResolving(null)} className="px-3 py-1 text-gray-400 hover:text-white text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setResolving(pred.id)} className="text-xs text-purple-400 hover:text-purple-300">
                        Mark as resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function JournalPage() {
  const { logId } = useParams()
  const { user } = useAuth()
  const [gameLog, setGameLog] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [togglingPublic, setTogglingPublic] = useState(false)

  const isOwner = user && gameLog?.user_id === user.id

  useEffect(() => {
    loadData()
  }, [logId])

  async function loadData() {
    setLoading(true)
    try {
      const [logRes, entriesRes] = await Promise.all([
        fetch(`/api/logs/${logId}`, { credentials: 'include' }),
        fetch(`/api/journal/logs/${logId}`, { credentials: 'include' })
      ])
      if (logRes.ok) setGameLog((await logRes.json()).data)
      if (entriesRes.ok) setEntries((await entriesRes.json()).data || [])
    } catch (err) {
      console.error('Failed to load journal:', err)
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

  async function handleSaveEntry(entryData) {
    const method = editingEntry ? 'PATCH' : 'POST'
    const url = editingEntry ? `/api/journal/${editingEntry.id}` : `/api/journal/logs/${logId}`
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(entryData) })
    if (res.ok) {
      loadData()
      setShowForm(false)
      setEditingEntry(null)
    }
  }

  async function handleDeleteEntry(entryId) {
    if (!confirm('Delete this journal entry?')) return
    const res = await fetch(`/api/journal/${entryId}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) loadData()
  }

  async function handleResolvePrediction(predictionId, status, notes) {
    const res = await fetch(`/api/journal/predictions/${predictionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, resolution_notes: notes || null })
    })
    if (res.ok) loadData()
  }

  async function togglePublic() {
    if (togglingPublic) return
    setTogglingPublic(true)
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_public: !gameLog.is_public })
      })
      if (res.ok) {
        const data = await res.json()
        setGameLog(data.data)
      }
    } finally {
      setTogglingPublic(false)
    }
  }

  function getPublicUrl() {
    const baseUrl = window.location.origin
    return `${baseUrl}/u/${user.username}/journal/${logId}`
  }

  function copyPublicUrl() {
    navigator.clipboard.writeText(getPublicUrl())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading journal...</div>
      </div>
    )
  }

  if (!gameLog) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Game not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <Link to="/timeline" className="text-sm text-purple-400 hover:text-purple-300">← Back to Timeline</Link>
            <h1 className="text-xl font-bold">{gameLog.game_name}</h1>
          </div>
          {isOwner && (
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              + New Entry
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Public sharing */}
        {isOwner && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            {gameLog.is_public ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-emerald-400 font-medium">Public</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyPublicUrl}
                      className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      Copy Link
                    </button>
                    <a
                      href={getPublicUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    >
                      View Public Page
                    </a>
                    <button
                      onClick={togglePublic}
                      disabled={togglingPublic}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                    >
                      Make Private
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Anyone with the link can view this journal: <span className="text-gray-400">{getPublicUrl()}</span>
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm text-gray-400">Private</span>
                </div>
                <button
                  onClick={togglePublic}
                  disabled={togglingPublic}
                  className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {togglingPublic ? 'Sharing...' : 'Share Publicly'}
                </button>
              </div>
            )}
          </div>
        )}

        {showForm || editingEntry ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <JournalEntryForm entry={editingEntry} onSave={handleSaveEntry} onCancel={() => { setShowForm(false); setEditingEntry(null) }} />
          </div>
        ) : (
          <>
            {entries.length >= 2 && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Rating Over Time</h3>
                <RatingChart entries={entries} />
              </div>
            )}

            {entries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No journal entries yet.</p>
                {isOwner && <p className="text-sm mt-1">Start documenting your playthrough!</p>}
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
                      isOwner={isOwner}
                      onEdit={() => setEditingEntry(entry)}
                      onDelete={() => handleDeleteEntry(entry.id)}
                    />
                  ))}
                </div>

                {/* All Predictions section at bottom */}
                <AllPredictionsSection
                  entries={entries}
                  isOwner={isOwner}
                  onResolvePrediction={handleResolvePrediction}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export { RatingChart }
