import React, { useMemo, useState } from 'react'
import { FiX } from 'react-icons/fi'

const months = [
  'January 2025','February 2025','March 2025','April 2025','May 2025','June 2025',
  'July 2025','August 2025','September 2025','October 2025','November 2025','December 2025'
]

const companionOptions = ['Business','Couples','Family','Friends','Solo']

const ShareReview = ({ booking, onClose }) => {
  const [search, setSearch] = useState('')
  const [rating, setRating] = useState(0) // 1-5 pandas
  const [visitMonth, setVisitMonth] = useState('November 2025')
  const [companions, setCompanions] = useState(new Set())
  const [title, setTitle] = useState('')
  const [review, setReview] = useState('')

  const selectedCompanions = useMemo(() => Array.from(companions), [companions])

  const toggleCompanion = (label) => {
    setCompanions(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const handleSubmit = () => {
    console.log('Review submitted:', { search, rating, visitMonth, selectedCompanions, title, review, booking })
    if (onClose) onClose()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Share Your Travel Experience</h2>

      {/* Search input */}
      <div className="mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search which tour did you do?"
          className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#1d236b' }}
        />
      </div>

      {/* Panda rating */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Rate your experience</label>
        <div className="flex items-center gap-6">
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className="focus:outline-none">
              <span className={`text-4xl ${n <= rating ? 'opacity-100' : 'opacity-40'}`}>🐼</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visit month */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-3">When did you visit?</label>
        <div className="relative inline-block">
          <select
            value={visitMonth}
            onChange={(e) => setVisitMonth(e.target.value)}
            className="appearance-none w-56 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1d236b' }}
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
        </div>
      </div>

      {/* Companions */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Who did you go with?</label>
        <div className="flex flex-wrap gap-4">
          {companionOptions.map((label) => {
            const active = companions.has(label)
            return (
              <button
                key={label}
                onClick={() => toggleCompanion(label)}
                className={`px-5 py-2 rounded-lg text-sm border transition ${active ? 'text-white' : 'text-gray-700 border-gray-300'}`}
                style={active ? { backgroundColor: '#1d236b', borderColor: '#1d236b' } : {}}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Title your review</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Share your experience..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#1d236b' }}
        />
      </div>

      {/* Review body */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Write your review here:</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-y"
          style={{ '--tw-ring-color': '#1d236b' }}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-lg text-white font-semibold"
          style={{ backgroundColor: '#1d236b' }}
        >
          Submit Review
        </button>
      </div>
    </div>
  )
}

export default ShareReview
