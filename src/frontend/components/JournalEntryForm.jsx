import { useState } from 'react'

export default function JournalEntryForm({ entry, onSave, onCancel }) {
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [progress, setProgress] = useState(entry?.progress || '')
  const [rating, setRating] = useState(entry?.rating ?? '')
  const [predictions, setPredictions] = useState([])
  const [newPrediction, setNewPrediction] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = !!entry

  function addPrediction() {
    if (newPrediction.trim()) {
      setPredictions([...predictions, { content: newPrediction.trim() }])
      setNewPrediction('')
    }
  }

  function removePrediction(index) {
    setPredictions(predictions.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return

    setSaving(true)
    try {
      const data = {
        title: title.trim() || null,
        content: content.trim(),
        progress: progress.trim() || null,
        rating: rating !== '' ? parseInt(rating, 10) : null,
      }

      // Only include predictions for new entries
      if (!isEditing && predictions.length > 0) {
        data.predictions = predictions
      }

      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {isEditing ? 'Edit Entry' : 'New Journal Entry'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., First impressions, Plot twist!, Final thoughts"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Progress */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Where in the game?</label>
        <input
          type="text"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="e.g., Chapter 3, 10 hours in, Act 2 beginning"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Rating at this point (0-10)</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            value={rating !== '' ? rating : 5}
            onChange={(e) => setRating(e.target.value)}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') {
                  setRating('')
                } else {
                  const num = parseInt(val, 10)
                  if (num >= 0 && num <= 10) setRating(num)
                }
              }}
              placeholder="-"
              className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setRating('')}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Entry *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening? How are you feeling about the game? Any memorable moments?"
          rows={6}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-y"
        />
      </div>

      {/* Predictions (only for new entries) */}
      {!isEditing && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Predictions</label>
          <p className="text-xs text-gray-500 mb-2">
            Make predictions about what will happen. You can mark them as correct/incorrect later.
          </p>

          {predictions.length > 0 && (
            <div className="space-y-2 mb-3">
              {predictions.map((pred, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-800/50 rounded p-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span className="flex-1 text-sm text-gray-300">{pred.content}</span>
                  <button
                    type="button"
                    onClick={() => removePrediction(index)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newPrediction}
              onChange={(e) => setNewPrediction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPrediction()
                }
              }}
              placeholder="I think the butler did it..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addPrediction}
              disabled={!newPrediction.trim()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!content.trim() || saving}
          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Entry'}
        </button>
      </div>
    </form>
  )
}
