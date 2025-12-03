import React, { useMemo, useState, useCallback } from 'react'
import { FiDownload, FiClock, FiUser, FiMapPin, FiX } from 'react-icons/fi'
import { Check } from 'lucide-react'

const formatCurrencyValue = (value, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(value || 0)
  } catch (err) {
    const amount = Number(value || 0)
    if (Number.isNaN(amount)) {
      return '$0.00'
    }
    return `$${amount.toFixed(currency === 'JPY' ? 0 : 2)}`
  }
}

const BookingDetails = ({
  booking,
  onClose,
  onCancel,
  onCancelIntent,
  cancelling = false,
  cancelError = null
}) => {
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const handleCancelClick = () => {
    setShowCancelForm(true)
    setCancelReason('')
    if (typeof onCancelIntent === 'function') {
      onCancelIntent()
    }
  }

  const handleCancelClose = () => {
    if (cancelling) {
      return
    }
    setShowCancelForm(false)
    setCancelReason('')
  }

  const handleSubmitCancel = (event) => {
    event.preventDefault()
    if (typeof onCancel !== 'function') {
      return
    }
    const reason = cancelReason.trim()
    if (!reason) {
      return
    }
    onCancel(reason)
  }

  const formattedAmount = useMemo(
    () => formatCurrencyValue(booking?.totalAmount, booking?.currency),
    [booking?.totalAmount, booking?.currency]
  )

  const handleDownload = useCallback(() => {
    const rows = [
      ['Booking ID', booking?.bookingId || booking?.id || ''],
      ['Tour Name', booking?.tourName || booking?.title || ''],
      ['Tour Date', booking?.tourDate || ''],
      ['Destination', booking?.destination || booking?.location || ''],
      ['Total Amount', formattedAmount],
      ['Currency', booking?.currency || 'USD'],
      ['Travelers', booking?.numberOfPersons || booking?.travelers || ''],
      ['Status', booking?.status || ''],
      ['Notes', booking?.notes || ''],
      ['Pick-up Location', booking?.pickUpLocation || ''],
      ['Drop-off Location', booking?.dropOffLocation || ''],
      ['Vehicle', booking?.vehicle || ''],
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell ?? '')
              .replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `booking-${booking?.bookingId || booking?.id || 'details'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [booking, formattedAmount])

  const guide = {
    name: 'Yuki Tanaka',
    role: 'Professional Guide',
    avatar: 'KS',
    phone: '+81 987 654 322',
    languages: ['English', 'Japanese']
  }

  const inclusions = [
    'Round-trip transport from hotel',
    'Entry tickets to all attractions',
    'Traditional Japanese lunch',
    'Professional English-speaking guide',
    'Complimentary bottled water'
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {booking?.tourName || 'Tokyo City Highlights & Hidden Gems Tour'}
          </h1>
          <p className="text-gray-600">
            {booking?.packageType || 'Explore the vibrant streets and serene temples of Tokyo.'}
          </p>
        </div>
        <div className="flex gap-3">
          {onClose && (
            <button 
              onClick={onClose}
              className="px-2 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="px-6 py-2 rounded-lg text-white font-semibold transition flex items-center gap-2"
            style={{ backgroundColor: '#1d236b' }}
          >
            <FiDownload className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={handleCancelClick}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={cancelling}
          >
            Cancel Booking
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Booking Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Booking Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Booking ID:</span>
                <span className="text-gray-900 font-semibold">{booking?.bookingId || 'BA-2025-001235'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Duration:</span>
                <span className="text-gray-900 font-semibold">1 Day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Time:</span>
                <span className="text-gray-900 font-semibold">9:00 AM – 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="text-gray-900 font-semibold">{booking?.tourDate || '18 Nov 2025'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Travelers:</span>
                <span className="text-gray-900 font-semibold">{booking?.numberOfPersons || '3 Persons'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Total Cost:</span>
                <span className="text-gray-900 font-semibold">{formattedAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  booking?.status === 'confirmed' 
                    ? 'bg-blue-500 text-white'
                    : booking?.status === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : booking?.status === 'canceled'
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}>
                  {booking?.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Meeting Point */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <FiMapPin className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Meeting Point</h2>
            </div>
            <p className="text-gray-900 font-medium mb-4">
              {booking?.pickUpLocation || 'Tokyo Station, Exit 5'}
            </p>
            {/* Embedded Map */}
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Map View</div>
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Your Guide */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Guide</h2>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#1d236b' }}>
                {guide.avatar}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{guide.name}</h3>
                <p className="text-gray-600">{guide.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{guide.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex gap-2">
                  {guide.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        idx === 0 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <FiClock className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">What's Included</h2>
            </div>
            <div className="space-y-3">
              {inclusions.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCancelForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6 py-10">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cancel booking</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Please share a short reason so we can improve future experiences.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                disabled={cancelling}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCancel} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="e.g. Need to reschedule, change of plans..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#1d236b' }}
                  disabled={cancelling}
                />
              </div>
              {cancelError && (
                <p className="text-sm text-red-600">{cancelError}</p>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: '#1d236b' }}
                  disabled={cancelling || cancelReason.trim().length < 3}
                >
                  {cancelling ? 'Cancelling…' : 'Submit Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingDetails
