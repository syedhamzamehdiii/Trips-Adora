import React from 'react'
import { useNavigate } from 'react-router-dom'
import ShareReview from './ShareReview'
import mountfuj from '../../assests/mount-fuj.jpg'

const CustomerReviews = () => {
  const navigate = useNavigate()
  const bestFor = ['Excellent','Admission fee','Experience','Length of visit','Atmosphere']

  const handleOpenProduct = () => {
    navigate('/product-details/1')
  }
  const handleBookNow = () => {
    navigate('/cart')
  }

  const handleClose = () => {
    navigate(-1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute top-3 right-3 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100"
        >
          ✕
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Share Your Travel Experience</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <ShareReview />
          </div>

          <div className="lg:col-span-1">
            <div
              onClick={handleOpenProduct}
              className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="h-56 w-full overflow-hidden">
                <img src={mountfuj} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-yellow-500 text-sm mb-1">
                  <span>★★★★☆</span>
                  <span className="text-gray-500">4.8 (834)</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">Tokyo Highlights & Hidden Gems Tour</h3>
                <div className="text-xs text-gray-500 mb-3">8 hours · Up to 12</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-gray-900">$345</span>
                  <span className="text-xs text-gray-500">/person</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg"
            >
              Book now
            </button>

            <div className="mt-6">
              <h3 className="text-gray-900 font-semibold mb-3">Best for?</h3>
              <div className="flex flex-wrap gap-3">
                {bestFor.map((label) => (
                  <span key={label} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerReviews


