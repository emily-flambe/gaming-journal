import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import AddGameModal from '../components/AddGameModal'

export default function Timeline() {
  const { user, logout } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null) // { id, position: 'before' | 'after' }
  const [dragRating, setDragRating] = useState(null) // rating 0-10 based on horizontal position
  const timelineRef = useRef(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const res = await fetch('/api/logs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
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
    if (!selectedLog) return
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
        // Update local state
        setLogs(logs.map(log => log.id === selectedLog.id ? { ...log, ...data.data } : log))
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
    setDraggedId(logId)
    setDragRating(currentRating || 5)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, logId) {
    e.preventDefault()
    if (logId === draggedId) return

    // Determine if dropping before or after based on mouse position
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? 'before' : 'after'
    setDropTarget({ id: logId, position })
  }

  function handleTimelineDragOver(e) {
    e.preventDefault()
    if (!draggedId || !timelineRef.current) return

    // Calculate rating from horizontal position (5% to 95% maps to 0-10)
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
    e.preventDefault()
    const newRating = dragRating

    // If just changing rating (no vertical reorder)
    if (!dropTarget && draggedId && newRating) {
      const draggedLog = logs.find(l => l.id === draggedId)
      if (draggedLog && draggedLog.rating !== newRating) {
        // Update local state
        setLogs(logs.map(log =>
          log.id === draggedId ? { ...log, rating: newRating } : log
        ))
        // Save to backend
        try {
          await fetch(`/api/logs/${draggedId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ rating: newRating }),
          })
        } catch (err) {
          console.error('Failed to update rating:', err)
          fetchLogs()
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

    // Remove dragged item
    const [draggedItem] = yearLogs.splice(draggedIndex, 1)

    // Calculate new insertion index
    let insertIndex = targetIndex
    if (draggedIndex < targetIndex) {
      // Moving down - adjust for removed item
      insertIndex = dropTarget.position === 'after' ? targetIndex : targetIndex - 1
    } else {
      // Moving up
      insertIndex = dropTarget.position === 'after' ? targetIndex + 1 : targetIndex
    }

    yearLogs.splice(insertIndex, 0, draggedItem)

    // Update local state with new sort orders and rating
    const updatedLogs = logs.map(log => {
      const idx = yearLogs.findIndex(l => l.id === log.id)
      if (log.id === draggedId) {
        return { ...log, sort_order: idx !== -1 ? idx : log.sort_order, rating: newRating || log.rating }
      }
      if (idx !== -1) {
        return { ...log, sort_order: idx }
      }
      return log
    })
    setLogs(updatedLogs)

    // Save reorder to backend
    const updates = yearLogs.map((log, index) => ({ id: log.id, sort_order: index }))
    try {
      await fetch('/api/logs/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ updates }),
      })
      // Also update rating if changed
      const draggedLog = logs.find(l => l.id === draggedId)
      if (newRating && draggedLog?.rating !== newRating) {
        await fetch(`/api/logs/${draggedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rating: newRating }),
        })
      }
    } catch (err) {
      console.error('Failed to reorder:', err)
      fetchLogs() // Refresh on error
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

  // Sort each year's logs by sort_order
  Object.keys(logsByYear).forEach(year => {
    logsByYear[year].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  })

  const years = Object.keys(logsByYear).sort((a, b) => b - a)

  const getPosition = (rating) => {
    if (rating === undefined || rating === null) return 50
    // 0-10 scale: 0 → 5%, 5 → 50%, 10 → 95%
    return 5 + (rating / 10) * 90
  }

  const getColor = (rating) => {
    if (rating === undefined || rating === null) return 'bg-gray-500'
    if (rating >= 9) return 'bg-emerald-500'
    if (rating >= 7) return 'bg-blue-500'
    if (rating >= 5) return 'bg-amber-500'
    return 'bg-red-400'
  }

  const getBorderColor = (rating) => {
    if (rating === undefined || rating === null) return 'border-gray-400'
    if (rating >= 9) return 'border-emerald-400'
    if (rating >= 7) return 'border-blue-400'
    if (rating >= 5) return 'border-amber-400'
    return 'border-red-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading your games...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-400">Gaming Journal</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-base">
              {user?.display_name || user?.username}
            </span>
            <Link
              to="/settings"
              className="text-gray-400 hover:text-white transition-colors text-base"
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors text-base"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Left: Timeline */}
        <div className="flex-1 overflow-y-auto px-4 py-6" style={{ direction: 'rtl' }}>
          <div style={{ direction: 'ltr' }}>
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400 text-base">
              ← Liked Less | Liked More →
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              + Add Game
            </button>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Disliked (0-4)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Mixed (5-6)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Liked (7-8)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Loved (9-10)</div>
          </div>

          {/* Timeline */}
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No games logged yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Your First Game
              </button>
            </div>
          ) : (
            <div
              ref={timelineRef}
              className="relative"
              onDragOver={handleTimelineDragOver}
              onDrop={(e) => { if (draggedId && !dropTarget) handleDrop(e, null) }}
            >
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 -translate-x-1/2"></div>

              {/* Rating guide lines (shown when dragging) */}
              {draggedId && (
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

                  <div className="flex flex-col gap-1">
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
                          onDragOver={(e) => handleDragOver(e, log.id)}
                          onDrop={(e) => handleDrop(e, year)}
                        >
                          {showLineBefore && (
                            <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-500 z-30" />
                          )}
                          <div className="h-12">
                            <button
                              draggable
                              onDragStart={(e) => handleDragStart(e, log.id, log.rating)}
                              onDragEnd={handleDragEnd}
                              onClick={() => setSelectedLog(isSelected ? null : log)}
                              className={`absolute px-3 py-2 rounded text-base font-medium transition-all border-2 ${getColor(log.rating)} ${getBorderColor(log.rating)}
                                ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 z-20' : ''}
                                ${isDragging ? 'opacity-50 scale-95' : ''}
                                hover:brightness-110 text-white shadow-lg whitespace-nowrap cursor-grab active:cursor-grabbing`}
                              style={{
                                left: `${left}%`,
                                transform: 'translateX(-50%)',
                              }}
                            >
                              {log.game_name.length > 25 ? log.game_name.substring(0, 23) + '...' : log.game_name}
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
          )}
          </div>
        </div>

        {/* Right: Detail Panel - slides in when a game is selected */}
        <div
          className={`border-l border-gray-700 bg-gray-800 overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out ${
            selectedLog ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'
          }`}
        >
          {selectedLog && (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold truncate">{selectedLog.game_name}</h3>
                  {!isEditing && (
                    <p className="text-gray-400 text-base mt-1">
                      {selectedLog.start_date && `Started: ${selectedLog.start_date}`}
                      {selectedLog.start_date && selectedLog.end_date && ' • '}
                      {selectedLog.end_date && `Finished: ${selectedLog.end_date}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {!isEditing && selectedLog.rating !== undefined && (
                    <span className={`px-3 py-1 rounded-full text-base font-bold ${getColor(selectedLog.rating)}`}>
                      {selectedLog.rating}/10
                    </span>
                  )}
                  {!isEditing && (
                    <button
                      onClick={startEditing}
                      className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedLog(null); setIsEditing(false) }}
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
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {selectedLog.notes || "No notes for this game."}
                  </p>
                  {selectedLog.journal_count > 0 && (
                    <p className="text-purple-400 text-base mt-4">
                      {selectedLog.journal_count} journal {selectedLog.journal_count === 1 ? 'entry' : 'entries'}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddGameModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            fetchLogs()
          }}
        />
      )}
    </div>
  )
}
