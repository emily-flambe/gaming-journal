import { useState, useEffect } from 'react'
import JournalEntryForm from './JournalEntryForm'

// Simple SVG line chart for ratings over time
function RatingChart({ entries }) {
  const entriesWithRating = entries.filter(e => e.rating !== null && e.rating !== undefined)
  if (entriesWithRating.length < 2) return null

  const width = 400
  const height = 120
  const padding = { top: 20, right: 20, bottom: 30, left: 35 }
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
    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-gray-400 mb-2">Rating Over Time</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md">
        {/* Y-axis labels */}
        {[0, 5, 10].map(val => (
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

        {/* Grid lines */}
        {[0, 5, 10].map(val => (
          <line
            key={val}
            x1={padding.left}
            y1={padding.top + chartHeight - (val / 10) * chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight - (val / 10) * chartHeight}
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray={val === 5 ? "4,4" : "0"}
          />
        ))}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={getColor(point.rating)}
              stroke="#1f2937"
              strokeWidth="2"
            />
            <title>{`${point.title}: ${point.rating}/10`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

// Prediction status badge
function PredictionBadge({ status }) {
  const styles = {
    open: 'bg-gray-600 text-gray-200',
    correct: 'bg-emerald-600 text-emerald-100',
    incorrect: 'bg-red-600 text-red-100',
    partially_correct: 'bg-amber-600 text-amber-100'
  }
  const labels = {
    open: 'Open',
    correct: 'Correct',
    incorrect: 'Wrong',
    partially_correct: 'Partial'
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.open}`}>
      {labels[status] || 'Open'}
    </span>
  )
}

// Single expandable journal entry card
function JournalEntryCard({ entry, isExpanded, onToggle, onEdit, onDelete, openPredictions, onResolvePrediction }) {
  const [resolving, setResolving] = useState(null)
  const [resolutionStatus, setResolutionStatus] = useState('correct')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getColor = (rating) => {
    if (rating === null || rating === undefined) return 'bg-gray-600'
    if (rating >= 9) return 'bg-emerald-600'
    if (rating >= 7) return 'bg-blue-600'
    if (rating >= 5) return 'bg-amber-600'
    return 'bg-red-500'
  }

  async function handleResolve(predictionId) {
    await onResolvePrediction(predictionId, resolutionStatus, resolutionNotes)
    setResolving(null)
    setResolutionNotes('')
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {entry.rating !== null && entry.rating !== undefined && (
            <span className={`px-2 py-1 rounded text-sm font-bold ${getColor(entry.rating)} flex-shrink-0`}>
              {entry.rating}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white truncate">
              {entry.title || 'Untitled Entry'}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{formatDate(entry.created_at)}</span>
              {entry.progress && (
                <>
                  <span>•</span>
                  <span className="truncate">{entry.progress}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {entry.predictions?.length > 0 && (
            <span className="text-xs text-purple-400">
              {entry.predictions.filter(p => p.status === 'open').length} predictions
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          {/* Content */}
          <div className="mt-4 text-gray-300 whitespace-pre-wrap leading-relaxed">
            {entry.content}
          </div>

          {/* Predictions made in this entry */}
          {entry.predictions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h5 className="text-sm font-medium text-purple-400 mb-2">
                Predictions from this entry
              </h5>
              <div className="space-y-2">
                {entry.predictions.map(pred => (
                  <div key={pred.id} className="bg-gray-900/50 rounded p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-300 flex-1">{pred.content}</p>
                      <PredictionBadge status={pred.status} />
                    </div>
                    {pred.resolution_notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">
                        {pred.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open predictions to resolve (from previous entries) */}
          {openPredictions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h5 className="text-sm font-medium text-amber-400 mb-2">
                Resolve predictions
              </h5>
              <div className="space-y-2">
                {openPredictions.map(pred => (
                  <div key={pred.id} className="bg-amber-900/20 rounded p-3">
                    <p className="text-sm text-gray-300">{pred.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      From: {pred.entry_title || pred.entry_progress || 'Earlier entry'}
                    </p>
                    {resolving === pred.id ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          {['correct', 'incorrect', 'partially_correct'].map(status => (
                            <button
                              key={status}
                              onClick={() => setResolutionStatus(status)}
                              className={`px-2 py-1 rounded text-xs ${
                                resolutionStatus === status
                                  ? status === 'correct' ? 'bg-emerald-600' :
                                    status === 'incorrect' ? 'bg-red-600' : 'bg-amber-600'
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                            >
                              {status === 'partially_correct' ? 'Partial' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Notes about how this played out..."
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(pred.id)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => setResolving(null)}
                            className="px-3 py-1 text-gray-400 hover:text-white text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolving(pred.id)}
                        className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                      >
                        Resolve this prediction
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JournalView({ gameLog, onClose }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [openPredictions, setOpenPredictions] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        const [entriesRes, predictionsRes] = await Promise.all([
          fetch(`/api/journal/logs/${gameLog.id}`, { credentials: 'include' }),
          fetch(`/api/journal/logs/${gameLog.id}/predictions?status=open`, { credentials: 'include' })
        ])
        if (entriesRes.ok) {
          const data = await entriesRes.json()
          setEntries(data.data || [])
        }
        if (predictionsRes.ok) {
          const data = await predictionsRes.json()
          setOpenPredictions(data.data || [])
        }
      } catch (err) {
        console.error('Failed to load journal data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [gameLog.id])

  async function fetchEntries() {
    try {
      const res = await fetch(`/api/journal/logs/${gameLog.id}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setEntries(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch journal entries:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOpenPredictions() {
    try {
      const res = await fetch(`/api/journal/logs/${gameLog.id}/predictions?status=open`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOpenPredictions(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch open predictions:', err)
    }
  }

  async function handleSaveEntry(entryData) {
    try {
      const method = editingEntry ? 'PATCH' : 'POST'
      const url = editingEntry
        ? `/api/journal/${editingEntry.id}`
        : `/api/journal/logs/${gameLog.id}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(entryData)
      })

      if (res.ok) {
        fetchEntries()
        fetchOpenPredictions()
        setShowForm(false)
        setEditingEntry(null)
      }
    } catch (err) {
      console.error('Failed to save entry:', err)
    }
  }

  async function handleDeleteEntry(entryId) {
    if (!confirm('Delete this journal entry?')) return
    try {
      const res = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        fetchEntries()
        fetchOpenPredictions()
      }
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  async function handleResolvePrediction(predictionId, status, notes) {
    try {
      const res = await fetch(`/api/journal/predictions/${predictionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          resolution_notes: notes || null
        })
      })
      if (res.ok) {
        fetchEntries()
        fetchOpenPredictions()
      }
    } catch (err) {
      console.error('Failed to resolve prediction:', err)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="text-white">Loading journal...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{gameLog.game_name}</h2>
            <p className="text-sm text-gray-400">Journal • {entries.length} entries</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showForm || editingEntry ? (
            <JournalEntryForm
              entry={editingEntry}
              onSave={handleSaveEntry}
              onCancel={() => {
                setShowForm(false)
                setEditingEntry(null)
              }}
            />
          ) : (
            <>
              {/* Rating Chart */}
              <RatingChart entries={entries} />

              {/* Open Predictions Summary */}
              {openPredictions.length > 0 && (
                <div className="bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-800/30">
                  <p className="text-sm text-amber-400">
                    {openPredictions.length} open prediction{openPredictions.length !== 1 ? 's' : ''} to resolve
                  </p>
                </div>
              )}

              {/* Add Entry Button */}
              <button
                onClick={() => setShowForm(true)}
                className="w-full mb-4 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Journal Entry
              </button>

              {/* Entries List */}
              {entries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No journal entries yet.</p>
                  <p className="text-sm mt-1">Start documenting your playthrough!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map(entry => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      isExpanded={expandedId === entry.id}
                      onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      onEdit={() => setEditingEntry(entry)}
                      onDelete={() => handleDeleteEntry(entry.id)}
                      openPredictions={expandedId === entry.id ? openPredictions.filter(p => p.journal_entry_id !== entry.id) : []}
                      onResolvePrediction={handleResolvePrediction}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
