import React, { useEffect } from 'react'
import ShareReview from '../components/ShareReview'
import { useLocation, useNavigate } from 'react-router-dom'

const ShareReviewPage = () => {
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
      className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <ShareReview booking={booking} onClose={handleClose} />
      </div>
    </div>
  )
}

export default ShareReviewPage
