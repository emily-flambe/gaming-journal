import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RatingChart } from '../pages/JournalPage'

export default function TimelineView({
  logs,
  editable = false,
  onLogsChange,
  onLogUpdate,
  username = null // For public timeline, to generate public journal URLs
}) {
  const [selectedLog, setSelectedLog] = useState(null)
  const [clickPosition, setClickPosition] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [dragRating, setDragRating] = useState(null)
  const [journalEntries, setJournalEntries] = useState([])
  const timelineRef = useRef(null)

  useEffect(() => {
    if (selectedLog) {
      // For public timeline with public journals, fetch from public API
      if (!editable && username && selectedLog.is_public && selectedLog.slug) {
        fetch(`/api/u/${username}/journal/${selectedLog.slug}`)
          .then(res => res.ok ? res.json() : { data: { entries: [] } })
          .then(data => setJournalEntries(data.data?.entries || []))
          .catch(() => setJournalEntries([]))
      } else if (editable) {
        // For authenticated view
        fetch(`/api/journal/logs/${selectedLog.id}`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : { data: [] })
          .then(data => setJournalEntries(data.data || []))
          .catch(() => setJournalEntries([]))
      } else {
        // Public timeline but private journal
        setJournalEntries([])
      }
    } else {
      setJournalEntries([])
    }
  }, [selectedLog?.id, editable, username])

  function handleGameClick(e, log, isSelected) {
    if (isSelected) {
      setSelectedLog(null)
      setClickPosition(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setClickPosition({
        gameLeft: rect.left,
        gameRight: rect.right,
        gameTop: rect.top,
        gameBottom: rect.bottom,
      })
      setSelectedLog(log)
    }
  }

  function getModalPosition() {
    if (!clickPosition) return {}
    const modalWidth = 450 // max-w-md is ~28rem = 448px
    const modalHeight = 400
    const gap = 24
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Try right of game
    if (clickPosition.gameRight + gap + modalWidth < viewportWidth) {
      return {
        left: `${clickPosition.gameRight + gap}px`,
        top: `${Math.min(Math.max(8, clickPosition.gameTop), viewportHeight - modalHeight - 8)}px`,
      }
    }
    // Try left of game
    if (clickPosition.gameLeft - gap - modalWidth > 0) {
      return {
        left: `${clickPosition.gameLeft - gap - modalWidth}px`,
        top: `${Math.min(Math.max(8, clickPosition.gameTop), viewportHeight - modalHeight - 8)}px`,
      }
    }
    // Fall back to below game
    const gameCenterX = (clickPosition.gameLeft + clickPosition.gameRight) / 2
    return {
      left: `${Math.max(8, Math.min(gameCenterX - modalWidth / 2, viewportWidth - modalWidth - 8))}px`,
      top: `${clickPosition.gameBottom + gap}px`,
    }
  }

  function startEditing() {
    setEditValues({
      notes: selectedLog.notes || '',
      rating: selectedLog.rating || 5,
      start_date: selectedLog.start_date || '',
      end_date: selectedLog.end_date || '',
    })
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditValues({})
  }

  async function saveEdit() {
    if (!selectedLog || !onLogUpdate) return
    setSaving(true)
    try {
      const res = await fetch(`/api/logs/${selectedLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editValues),
      })
      if (res.ok) {
        const data = await res.json()
        onLogsChange?.(logs.map(log => log.id === selectedLog.id ? { ...log, ...data.data } : log))
        setSelectedLog({ ...selectedLog, ...data.data })
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleDragStart(e, logId, currentRating) {
    if (!editable) return
    setDraggedId(logId)
    setDragRating(currentRating || 5)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, logId) {
    if (!editable) return
    e.preventDefault()
    if (logId === draggedId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? 'before' : 'after'
    setDropTarget({ id: logId, position })
  }

  function handleTimelineDragOver(e) {
    if (!editable) return
    e.preventDefault()
    if (!draggedId || !timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width
    const clampedX = Math.max(0.05, Math.min(0.95, relativeX))
    const normalizedX = (clampedX - 0.05) / 0.9
    const rating = Math.round(normalizedX * 10)
    setDragRating(rating)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDropTarget(null)
    setDragRating(null)
  }

  async function handleDrop(e, year) {
    if (!editable) return
    e.preventDefault()
    const newRating = dragRating

    if (!dropTarget && draggedId && newRating !== null) {
      const draggedLog = logs.find(l => l.id === draggedId)
      if (draggedLog && draggedLog.rating !== newRating) {
        onLogsChange?.(logs.map(log =>
          log.id === draggedId ? { ...log, rating: newRating } : log
        ))
        try {
          await fetch(`/api/logs/${draggedId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ rating: newRating }),
          })
        } catch (err) {
          console.error('Failed to update rating:', err)
        }
      }
      handleDragEnd()
      return
    }

    if (!draggedId || !dropTarget || draggedId === dropTarget.id) {
      handleDragEnd()
      return
    }

    const yearLogs = [...logsByYear[year]]
    const draggedIndex = yearLogs.findIndex(l => l.id === draggedId)
    const targetIndex = yearLogs.findIndex(l => l.id === dropTarget.id)

    if (draggedIndex === -1 || targetIndex === -1) {
      handleDragEnd()
      return
    }

    const [draggedItem] = yearLogs.splice(draggedIndex, 1)
    let insertIndex = targetIndex
    if (draggedIndex < targetIndex) {
      insertIndex = dropTarget.position === 'after' ? targetIndex : targetIndex - 1
    } else {
      insertIndex = dropTarget.position === 'after' ? targetIndex + 1 : targetIndex
    }
    yearLogs.splice(insertIndex, 0, draggedItem)

    const updatedLogs = logs.map(log => {
      const idx = yearLogs.findIndex(l => l.id === log.id)
      if (log.id === draggedId) {
        return { ...log, sort_order: idx !== -1 ? idx : log.sort_order, rating: newRating !== null ? newRating : log.rating }
      }
      if (idx !== -1) {
        return { ...log, sort_order: idx }
      }
      return log
    })
    onLogsChange?.(updatedLogs)

    const updates = yearLogs.map((log, index) => ({ id: log.id, sort_order: index }))
    try {
      await fetch('/api/logs/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ updates }),
      })
      const draggedLog = logs.find(l => l.id === draggedId)
      if (newRating !== null && draggedLog?.rating !== newRating) {
        await fetch(`/api/logs/${draggedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rating: newRating }),
        })
      }
    } catch (err) {
      console.error('Failed to reorder:', err)
    }

    handleDragEnd()
  }

  // Group logs by year and sort by sort_order
  const logsByYear = logs.reduce((acc, log) => {
    const date = log.end_date || log.start_date
    if (!date) return acc
    const year = date.split('-')[0]
    if (!acc[year]) acc[year] = []
    acc[year].push(log)
    return acc
  }, {})

  Object.keys(logsByYear).forEach(year => {
    logsByYear[year].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  })

  const years = Object.keys(logsByYear).sort((a, b) => b - a)

  const getPosition = (rating) => {
    if (rating === undefined || rating === null) return 50
    return 5 + (rating / 10) * 90
  }

  const getColor = (rating) => {
    if (rating === undefined || rating === null) return 'bg-gray-500'
    if (rating >= 9) return 'bg-emerald-500'
    if (rating >= 7) return 'bg-blue-500'
    if (rating >= 5) return 'bg-amber-500'
    if (rating >= 3) return 'bg-red-400'
    return 'bg-gray-900'
  }

  const getBorderColor = (rating) => {
    if (rating === undefined || rating === null) return 'border-gray-400'
    if (rating >= 9) return 'border-emerald-400'
    if (rating >= 7) return 'border-blue-400'
    if (rating >= 5) return 'border-amber-400'
    if (rating >= 3) return 'border-red-300'
    return 'border-gray-600'
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No games logged yet.</p>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Game Detail Modal */}
      {selectedLog && (
        <div
          className="fixed z-50 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
          style={getModalPosition()}
        >
            {/* Cover image header */}
            {selectedLog.cover_url && (
              <div className="relative h-40 overflow-hidden rounded-t-xl">
                <img
                  src={selectedLog.cover_url}
                  alt={selectedLog.game_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
              </div>
            )}
            <div className={selectedLog.cover_url ? "p-6 -mt-8 relative" : "p-6"}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold">{selectedLog.game_name}</h3>
                  {!isEditing && (
                    <p className="text-gray-400 text-base mt-1">
                      {selectedLog.start_date && `Started: ${selectedLog.start_date}`}
                      {selectedLog.start_date && selectedLog.end_date && ' • '}
                      {selectedLog.end_date && `Finished: ${selectedLog.end_date}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {!isEditing && selectedLog.rating !== undefined && selectedLog.rating !== null && (
                    <span className={`px-3 py-1 rounded-full text-base font-bold ${getColor(selectedLog.rating)}`}>
                      {selectedLog.rating}/10
                    </span>
                  )}
                  {editable && !isEditing && (
                    <>
                      <Link
                        to={`/journal/${selectedLog.id}`}
                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Journal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </Link>
                      <button
                        onClick={startEditing}
                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </>
                  )}
                  {!editable && username && selectedLog.is_public && selectedLog.slug && (
                    <Link
                      to={`/u/${username}/journal/${selectedLog.slug}`}
                      className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Journal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </Link>
                  )}
                  <button
                    onClick={() => { setSelectedLog(null); setClickPosition(null); setIsEditing(false) }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editValues.start_date}
                      onChange={(e) => setEditValues({ ...editValues, start_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-base text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={editValues.end_date}
                      onChange={(e) => setEditValues({ ...editValues, end_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-base text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rating (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editValues.rating}
                      onChange={(e) => setEditValues({ ...editValues, rating: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-base text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Notes</label>
                    <textarea
                      value={editValues.notes}
                      onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-base text-white resize-y"
                      placeholder="Your thoughts about this game..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 text-base text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="px-4 py-2 text-base bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Game metadata from RAWG */}
                  {(selectedLog.metacritic || selectedLog.genres || selectedLog.developers) && (
                    <div className="mb-4 pb-4 border-b border-gray-700">
                      {selectedLog.metacritic && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-400 text-sm">Metacritic:</span>
                          <span className={`px-2 py-0.5 rounded text-sm font-bold ${
                            selectedLog.metacritic >= 75 ? 'bg-green-600' :
                            selectedLog.metacritic >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {selectedLog.metacritic}
                          </span>
                        </div>
                      )}
                      {selectedLog.genres && (
                        <div className="mb-2">
                          <span className="text-gray-400 text-sm">Genres: </span>
                          <span className="text-gray-300 text-sm">
                            {JSON.parse(selectedLog.genres).join(', ')}
                          </span>
                        </div>
                      )}
                      {selectedLog.developers && (
                        <div className="mb-2">
                          <span className="text-gray-400 text-sm">Developer: </span>
                          <span className="text-gray-300 text-sm">
                            {JSON.parse(selectedLog.developers).join(', ')}
                          </span>
                        </div>
                      )}
                      {selectedLog.publishers && (
                        <div className="mb-2">
                          <span className="text-gray-400 text-sm">Publisher: </span>
                          <span className="text-gray-300 text-sm">
                            {JSON.parse(selectedLog.publishers).join(', ')}
                          </span>
                        </div>
                      )}
                      {selectedLog.website && (
                        <div>
                          <a
                            href={selectedLog.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-1"
                          >
                            Official Website
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-gray-300 leading-relaxed text-lg">
                    {selectedLog.notes || "No notes for this game."}
                  </p>

                  {/* Mini rating chart */}
                  {journalEntries.length >= 2 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <RatingChart entries={journalEntries} mini={true} />
                    </div>
                  )}

                  {/* Journal link - different for editable vs public view */}
                  {editable && journalEntries.length > 0 && (
                    <Link to={`/journal/${selectedLog.id}`} className="text-purple-400 hover:text-purple-300 text-base mt-4 inline-block">
                      {journalEntries.length} journal {journalEntries.length === 1 ? 'entry' : 'entries'} →
                    </Link>
                  )}
                  {!editable && username && selectedLog.is_public && selectedLog.slug && journalEntries.length > 0 && (
                    <Link to={`/u/${username}/journal/${selectedLog.slug}`} className="text-purple-400 hover:text-purple-300 text-base mt-4 inline-block">
                      {journalEntries.length} journal {journalEntries.length === 1 ? 'entry' : 'entries'} →
                    </Link>
                  )}
                  {!editable && username && !selectedLog.is_public && (
                    <div className="flex items-center gap-2 mt-4 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm">This journal is private.</span>
                    </div>
                  )}
                </>
              )}
            </div>
        </div>
      )}

      {/* Timeline */}
      <div className="h-full overflow-y-auto px-4 py-6">
        <div className="max-w-[70%] mx-auto">
          {/* Legend */}
          <div className="flex justify-center gap-4 mb-6 text-sm flex-wrap">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-900 border border-gray-600"></span> Hated (0-2)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Disliked (3-4)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Mixed (5-6)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Liked (7-8)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Loved (9-10)</div>
          </div>

          {/* Timeline */}
          <div
            ref={timelineRef}
            className="relative"
            onDragOver={editable ? handleTimelineDragOver : undefined}
            onDrop={editable ? (e) => { if (draggedId && !dropTarget) handleDrop(e, null) } : undefined}
          >
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 -translate-x-1/2"></div>

            {/* Rating guide lines (shown when dragging) */}
            {editable && draggedId && (
              <>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => {
                  const pos = getPosition(r)
                  const isActive = dragRating === r
                  return (
                    <div
                      key={r}
                      className={`absolute top-0 bottom-0 w-px transition-opacity ${
                        isActive ? 'bg-purple-400 opacity-100' : 'bg-gray-600 opacity-30'
                      }`}
                      style={{ left: `${pos}%` }}
                    >
                      <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-sm ${
                        isActive ? 'text-purple-400 font-bold' : 'text-gray-500'
                      }`}>
                        {r}
                      </span>
                    </div>
                  )
                })}
              </>
            )}

            {years.map(year => (
              <div key={year} className="mb-8">
                <div className="sticky top-0 z-10 bg-gray-900/95 py-2 border-b border-gray-700 mb-4">
                  <h2 className="text-2xl font-bold text-center text-purple-400">{year}</h2>
                </div>

                <div className="flex flex-col gap-3">
                  {logsByYear[year].map((log) => {
                    const left = getPosition(log.rating)
                    const isSelected = selectedLog?.id === log.id
                    const isDragging = draggedId === log.id
                    const showLineBefore = dropTarget?.id === log.id && dropTarget?.position === 'before'
                    const showLineAfter = dropTarget?.id === log.id && dropTarget?.position === 'after'

                    return (
                      <div
                        key={log.id}
                        className="relative"
                        onDragOver={editable ? (e) => handleDragOver(e, log.id) : undefined}
                        onDrop={editable ? (e) => handleDrop(e, year) : undefined}
                      >
                        {showLineBefore && (
                          <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-500 z-30" />
                        )}
                        <div className="relative">
                          <button
                            draggable={editable}
                            onDragStart={editable ? (e) => handleDragStart(e, log.id, log.rating) : undefined}
                            onDragEnd={editable ? handleDragEnd : undefined}
                            onClick={(e) => handleGameClick(e, log, isSelected)}
                            className={`relative px-2 py-1.5 rounded text-sm font-medium transition-all border-2 ${getColor(log.rating)} ${getBorderColor(log.rating)}
                              ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 z-20' : ''}
                              ${isDragging ? 'opacity-50 scale-95' : ''}
                              hover:brightness-110 text-white shadow-lg cursor-pointer text-center max-w-[180px]
                              ${editable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            style={{
                              left: `${left}%`,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            {log.game_name}
                          </button>
                        </div>
                        {showLineAfter && (
                          <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-purple-500 z-30" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
