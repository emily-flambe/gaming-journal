import { useState, useEffect, useRef } from 'react'

export default function AddGameModal({ onClose, onSave }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rating, setRating] = useState('')
  const [notes, setNotes] = useState('')

  const searchTimeout = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      searchGames(searchQuery)
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchQuery])

  async function searchGames(query) {
    setSearching(true)
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.games || [])
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
  }

  function selectGame(game) {
    setSelectedGame(game)
    setSearchQuery('')
    setSearchResults([])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!selectedGame) return
    if (!startDate && !endDate) {
      alert('Please enter at least a start or end date')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: selectedGame.id,
          game_name: selectedGame.name,
          start_date: startDate || null,
          end_date: endDate || null,
          rating: rating ? parseInt(rating, 10) : null,
          notes: notes || null,
        }),
      })

      if (res.ok) {
        onSave()
      } else {
        const data = await res.json()
        alert(data.error?.message || 'Failed to save game')
      }
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save game')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Add Game</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {!selectedGame ? (
            <div>
              {/* Search */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a game..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                {searching && (
                  <div className="absolute right-3 top-3 text-gray-400">
                    ...
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-600 rounded-lg overflow-hidden">
                  {searchResults.slice(0, 8).map((game) => (
                    <button
                      key={game.id}
                      onClick={() => selectGame(game)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700 last:border-b-0"
                    >
                      {game.cover_url ? (
                        <img
                          src={game.cover_url}
                          alt=""
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{game.name}</p>
                        {game.release_date && (
                          <p className="text-gray-400 text-sm">
                            {game.release_date.split('-')[0]}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="text-gray-400 text-sm mt-4 text-center">
                  No games found. Try a different search.
                </p>
              )}

              {/* Manual Entry Option */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedGame({ id: null, name: searchQuery || 'Custom Game' })}
                  className="w-full px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Or enter game manually →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Selected Game */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-700 rounded-lg">
                {selectedGame.cover_url ? (
                  <img
                    src={selectedGame.cover_url}
                    alt=""
                    className="w-16 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-20 bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
                <div className="flex-1">
                  {selectedGame.id ? (
                    <p className="text-white font-medium">{selectedGame.name}</p>
                  ) : (
                    <input
                      type="text"
                      value={selectedGame.name}
                      onChange={(e) => setSelectedGame({ ...selectedGame, name: e.target.value })}
                      placeholder="Game name"
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Change
                </button>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="month"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Your thoughts on the game..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
