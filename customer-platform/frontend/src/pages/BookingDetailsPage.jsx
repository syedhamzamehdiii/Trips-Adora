import React, { useEffect, useMemo, useState } from 'react'
import BookingDetails from '../components/BookingDetails'
import { useLocation, useNavigate } from 'react-router-dom'
import { cancelBooking } from '../services/bookingService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const BookingDetailsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state || {}
  const userId = useMemo(
    () => localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID,
    []
  )
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    navigate('/bookings')
  }

  const handleCancelBooking = async (reason) => {
    if (!reason || reason.trim().length < 3) {
      setCancelError('Please provide a short reason before submitting.')
      return
    }
    if (!booking?.id) {
      setCancelError('Unable to identify this booking.')
      return
    }
    setCancelling(true)
    setCancelError(null)
    try {
      await cancelBooking(userId, booking.id, reason)
      window.dispatchEvent(new CustomEvent('customer_bookings_updated'))
      navigate('/bookings', {
        replace: true,
        state: { cancelledBookingId: booking.id }
      })
    } catch (err) {
      setCancelError(err?.message || 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  const handleBackdropClick = (e) => {
    // Close modal if clicking the backdrop
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <BookingDetails
          booking={booking}
          onClose={handleClose}
          onCancel={handleCancelBooking}
          onCancelIntent={() => setCancelError(null)}
          cancelling={cancelling}
          cancelError={cancelError}
        />
      </div>
    </div>
  )
}

export default BookingDetailsPage
