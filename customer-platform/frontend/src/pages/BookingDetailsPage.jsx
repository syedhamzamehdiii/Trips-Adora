import React, { useEffect } from 'react'
import BookingDetails from '../components/BookingDetails'
import { useLocation, useNavigate } from 'react-router-dom'

const BookingDetailsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state || {}

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
        <BookingDetails booking={booking} onClose={handleClose} />
      </div>
    </div>
  )
}

export default BookingDetailsPage
