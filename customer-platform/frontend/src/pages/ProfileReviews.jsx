import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSliders, FiTrash2 } from 'react-icons/fi'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { createReview, deleteReview, getReviews } from '../services/reviewService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const ReviewItem = ({ review, onDelete, deleting }) => {
  const initials = useMemo(() => {
    const name = review?.author?.name || ''
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U'
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }, [review?.author?.name])

  const avatar = review?.author?.avatar_url

  const visitedLabel = useMemo(() => {
    if (!review?.visited_at) return ''
    try {
      const date = new Date(review.visited_at)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } catch (err) {
      return ''
    }
  }, [review?.visited_at])

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={review?.author?.name || 'Traveller avatar'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 text-sm">{review?.author?.name || 'Traveller'}</div>
              {visitedLabel && (
                <div className="text-xs text-gray-500">{visitedLabel}</div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className={index < (review?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
        {typeof onDelete === 'function' && (
          <button
            onClick={() => onDelete(review?.id)}
            className="text-xs text-red-500 hover:text-red-600 font-semibold"
            type="button"
            disabled={deleting}
          >
            {deleting ? <span>Deleting…</span> : <FiTrash2 className="w-4 h-4" />}
          </button>
        )}
      </div>
      {review?.title && (
        <div className="mt-3 text-sm font-semibold text-gray-900">{review.title}</div>
      )}
      {review?.product_title && (
        <div className="mt-1 text-xs uppercase tracking-wide text-blue-600 font-semibold">
          {review.product_title}
        </div>
      )}
      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
        {review?.content}
      </p>
    </li>
  )
}

const ProfileReviews = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formContent, setFormContent] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [rating, setRating] = useState(5)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [sortMode, setSortMode] = useState('newest')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const textareaRef = useRef(null)

  const userId = useMemo(
    () => localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID,
    []
  )

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReviews(userId)
      setReviews(data)
    } catch (err) {
      setError(err?.message || 'Unable to load reviews right now.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    const handleRefresh = () => fetchReviews()
    window.addEventListener('customer_reviews_updated', handleRefresh)
    return () => window.removeEventListener('customer_reviews_updated', handleRefresh)
  }, [fetchReviews])

  const visibleReviews = useMemo(() => {
    const entries = [...reviews]
    entries.sort((a, b) => {
      const aDate = new Date(a?.updated_at || a?.created_at || a?.createdAt || 0).getTime()
      const bDate = new Date(b?.updated_at || b?.created_at || b?.createdAt || 0).getTime()
      if (sortMode === 'oldest') {
        return aDate - bDate
      }
      return bDate - aDate
    })
    return entries
  }, [reviews, sortMode])

  const totalReviewsLabel = useMemo(() => {
    const total = visibleReviews.length
    if (total === 0) return 'No reviews yet'
    return `${total.toLocaleString()} ${total === 1 ? 'Review' : 'Reviews'}`
  }, [visibleReviews])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitError(null)
    setSubmitSuccess(null)
    setDeleteError(null)

    const content = formContent.trim()
    const title = formTitle.trim()

    if (!content) {
      setSubmitError('Please share a short review before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        rating,
        title: title || undefined,
        content,
        visited_at: new Date().toISOString(),
        author: {
          name: localStorage.getItem('customer_profile_name') || undefined,
          email: localStorage.getItem('customer_profile_email') || undefined,
          avatar_url: localStorage.getItem('customer_profile_avatar') || undefined
        }
      }
      const created = await createReview(userId, payload)
      setReviews((prev) => [created, ...prev])
      setFormContent('')
      setFormTitle('')
      setRating(5)
      setSubmitSuccess('Thanks for sharing your travel experience!')
      window.dispatchEvent(new CustomEvent('customer_reviews_updated'))
      window.dispatchEvent(new CustomEvent('customer_profile_updated'))
      textareaRef.current?.focus()
    } catch (err) {
      setSubmitError(err?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
      setTimeout(() => setSubmitSuccess(null), 4000)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId || deletingId) return
    setDeleteError(null)
    setDeletingId(reviewId)
    try {
      await deleteReview(userId, reviewId)
      setReviews((prev) => prev.filter((item) => item.id !== reviewId))
      window.dispatchEvent(new CustomEvent('customer_reviews_updated'))
      window.dispatchEvent(new CustomEvent('customer_profile_updated'))
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete review.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900"
            type="button"
          >
            ← Back
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              <FiSliders className="w-5 h-5" />
              <span>
                {sortMode === 'newest' ? 'Latest first' : 'Oldest first'}
              </span>
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => {
                    setSortMode('newest')
                    setIsSortOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    sortMode === 'newest' ? 'text-blue-600 font-semibold' : 'text-gray-700'
                  } hover:bg-gray-50`}
                >
                  Latest first
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortMode('oldest')
                    setIsSortOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    sortMode === 'oldest' ? 'text-blue-600 font-semibold' : 'text-gray-700'
                  } hover:bg-gray-50`}
                >
                  Oldest first
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Opinions</h1>
                <p className="text-sm text-gray-600 mt-1">{totalReviewsLabel}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1
                  const active = starValue <= rating
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className={`text-2xl transition ${active ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                    >
                      ★
                    </button>
                  )
                })}
              </div>
              <span className="text-sm text-gray-600">{rating} / 5</span>
            </div>

            <input
              value={formTitle}
              onChange={(event) => setFormTitle(event.target.value)}
              placeholder="Give your review a headline"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />

            <textarea
              ref={textareaRef}
              value={formContent}
              onChange={(event) => setFormContent(event.target.value)}
              placeholder="Share what made your trip memorable..."
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              disabled={submitting}
            />

            {submitError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                {submitSuccess}
              </div>
            )}
            {deleteError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {deleteError}
              </div>
            )}

            <div className="mt-4 flex justify-end items-center gap-3">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setFormContent('')
                  setFormTitle('')
                  setSubmitError(null)
                  setRating(5)
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#1f3661] text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>

          <div className="px-6 py-6">
            {loading ? (
              <div className="text-sm text-gray-500">Loading reviews...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : visibleReviews.length === 0 ? (
              <div className="text-sm text-gray-600">You have not shared any reviews yet.</div>
            ) : (
              <ul className="space-y-4">
                {visibleReviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    onDelete={handleDeleteReview}
                    deleting={deletingId === review.id}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfileReviews

