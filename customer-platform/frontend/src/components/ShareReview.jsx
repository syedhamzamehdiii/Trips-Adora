import React, { useMemo, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { createReview } from '../services/reviewService'

// Month/year helpers for a compact selector
const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const buildYearOptions = () => {
  const now = new Date()
  const startYear = now.getFullYear() - 3
  const endYear = now.getFullYear() + 2
  const options = []
  for (let year = startYear; year <= endYear; year++) {
    options.push(year)
  }
  return { options, currentYear: now.getFullYear(), currentMonthIndex: now.getMonth() }
}

const { options: yearOptions, currentYear, currentMonthIndex } = buildYearOptions()

const companionOptions = ['Business','Couples','Family','Friends','Solo']
const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const ShareReview = ({ booking, onClose }) => {
  const [rating, setRating] = useState(0) // 1-5 pandas
  const [visitMonthIndex, setVisitMonthIndex] = useState(currentMonthIndex)
  const [visitYear, setVisitYear] = useState(currentYear)
  const [companions, setCompanions] = useState(new Set())
  const [title, setTitle] = useState('')
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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
    if (submitting) return
    setError(null)

    if (!review.trim() || rating <= 0) {
      setError('Please rate your experience and write a short review before submitting.')
      return
    }

    setSubmitting(true)

    const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID

    // Derive visited_at from selected month/year (use first day of month)
    let visited_at = new Date()
    try {
      visited_at = new Date(visitYear, visitMonthIndex, 1)
    } catch (_) {}

    const payload = {
      product_id: booking?.productId || booking?.product_id || null,
      product_title: booking?.tourName || booking?.title || undefined,
      booking_id: booking?.bookingId || booking?.id || undefined,
      rating,
      title: title || undefined,
      content: review.trim(),
      visited_at: visited_at.toISOString(),
      author: {
        name: localStorage.getItem('customer_profile_name') || undefined,
        email: localStorage.getItem('customer_profile_email') || undefined,
        avatar_url: localStorage.getItem('customer_profile_avatar') || undefined
      },
      metadata: {
        companions: selectedCompanions
      }
    }

    // Fire-and-forget API call so UI closes immediately
    ;(async () => {
      try {
        await createReview(userId, payload)
        window.dispatchEvent(new CustomEvent('customer_reviews_updated'))
      } catch (e) {
        console.error('Failed to submit review:', e)
      } finally {
        setSubmitting(false)
      }
    })()

    // Close modal right away – no waiting
    if (onClose) onClose()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Share Your Travel Experience</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
            aria-label="Close review form"
          >
            <FiX className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* We already know which tour from the booking, so no search bar */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

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

      {/* Visit month/year */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-3">When did you visit?</label>
        <div className="flex items-center gap-3">
          {/* Month */}
          <div className="relative inline-block">
            <select
              value={visitMonthIndex}
              onChange={(e) => setVisitMonthIndex(Number(e.target.value))}
              className="appearance-none w-36 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#1d236b' }}
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </div>
          {/* Year */}
          <div className="relative inline-block">
          <select
              value={visitYear}
              onChange={(e) => setVisitYear(Number(e.target.value))}
              className="appearance-none w-28 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1d236b' }}
          >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </div>
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
          disabled={submitting}
          className={`px-6 py-3 rounded-lg text-white font-semibold ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: '#1d236b' }}
        >
          Submit Review
        </button>
      </div>
    </div>
  )
}

export default ShareReview
