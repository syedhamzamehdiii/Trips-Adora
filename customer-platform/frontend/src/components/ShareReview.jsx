import React, { useState } from 'react'
import { FiX, FiUpload } from 'react-icons/fi'
import { Star } from 'lucide-react'

const ShareReview = ({ booking, onClose }) => {
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const [visitDate, setVisitDate] = useState('')
  const [experience, setExperience] = useState('')
  const [travelTip, setTravelTip] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const tags = [
    'Cleanliness',
    'Friendly Staff',
    'Food Quality',
    'Location',
    'Family-Friendly',
    'Value For Money'
  ]

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const toggleAnonymous = () => {
    setIsAnonymous(prev => !prev)
  }

  const handleSubmit = () => {
    // Handle review submission
    console.log('Review submitted:', {
      rating,
      selectedTags,
      visitDate,
      experience,
      travelTip,
      isAnonymous,
      booking
    })
    if (onClose) onClose()
  }

  const charCount = experience.length
  const maxChars = 500
  const remainingChars = maxChars - charCount

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Share Your Journey</h2>
          <p className="text-gray-600">Help fellow travelers discover amazing places</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Rate your Experience */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Rate your Experience
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* What did you enjoy the most? */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          What did you enjoy the most?
        </label>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedTags.includes(tag)
                  ? 'text-white'
                  : 'text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
              style={
                selectedTags.includes(tag) ? { backgroundColor: '#1d236b' } : {}
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* When did you visit? */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          When did you visit?
        </label>
        <div className="relative">
          <input
            type="text"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            placeholder="Pick a Date"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': '#1d236b' }}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Share your experience */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Share your experience
        </label>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Tell us about your visit... What did made it special?.."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
          style={{ '--tw-ring-color': '#1d236b' }}
          rows={4}
          maxLength={maxChars}
        />
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-500">{remainingChars} characters remaining</span>
          <span className="text-sm text-gray-500">{charCount}/{maxChars}</span>
        </div>
      </div>

      {/* Media Upload */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-gray-700 font-medium">Click to Upload your media</span>
          </div>
        </div>
      </div>

      {/* Travel Tip */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <label className="block text-sm font-semibold text-gray-900">
            Would you like to give a travel tip? <span className="font-normal text-gray-500">(optional)</span>
          </label>
        </div>
        <textarea
          value={travelTip}
          onChange={(e) => setTravelTip(e.target.value)}
          placeholder="Best time to visit or something other should know......"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
          style={{ '--tw-ring-color': '#1d236b' }}
          rows={3}
        />
      </div>

      {/* Anonymous Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Post as anonymous
            </label>
            <p className="text-sm text-gray-600">Hide your identity on this review</p>
          </div>
          <button
            type="button"
            onClick={toggleAnonymous}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2`}
            style={isAnonymous ? { backgroundColor: '#1d236b' } : { backgroundColor: '#d1d5db' }}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAnonymous ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-lg text-white font-semibold transition flex items-center gap-2"
          style={{ backgroundColor: '#1d236b' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Share My Experience
        </button>
      </div>
    </div>
  )
}

export default ShareReview
