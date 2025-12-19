import React, { useState, useEffect } from 'react'
import { FiHeart, FiMapPin, FiClock, FiUsers, FiShare2 } from 'react-icons/fi'
import { BsHeartFill } from 'react-icons/bs'

const TourCard = ({ tour, onClick }) => {
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    // Check if tour is in wishlist
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      const wishlist = JSON.parse(savedWishlist)
      setIsInWishlist(wishlist.some(item => item.id === tour.id))
    }
  }, [tour.id])

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    
    // Get or initialize wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist')
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : []
    
    // Check if tour is already in wishlist
    const alreadyInWishlist = wishlist.some(item => item.id === tour.id)
    
    if (alreadyInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== tour.id)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      try {
        window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
      } catch (_) {}
      setIsInWishlist(false)
    } else {
      // Add tour to wishlist
      const resolvedHost = tour.host || tour.supplierBusinessName || 'TripsAdora Partner'
      const updatedWishlist = [...wishlist, {
        ...tour,
        oldPrice: tour.oldPrice || '$250',
        rating: tour.rating || 4.8,
        reviews: tour.reviews || '384',
        tags: tour.tags || ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
        host: resolvedHost,
        isPrivate: true,
        isTripadurasChoice: false,
        groupSize: tour.groupSize || 'Up to 12',
        location: tour.location || 'Tokyo Japan'
      }]
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      try {
        window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
      } catch (_) {}
      setIsInWishlist(true)
    }
  }
  
  // Use real data from backend, with fallbacks only if data is truly missing
  const image = tour.hero_image || tour.images?.[0] || tour.image
  const name = tour.title || tour.name
  const duration = tour.duration
  const groupSize = tour.groupSize || 'Up to 12'
  const location = tour.location || tour.destination || 'Location TBD'
  // Use real rating and reviews_count from backend
  const rating = tour.rating !== undefined && tour.rating !== null ? tour.rating : 0.0
  const reviews = tour.reviews_count !== undefined ? tour.reviews_count : 0
  // Use selling_points as tags, with fallback to activity_type
  const tags = tour.selling_points && tour.selling_points.length > 0 
    ? tour.selling_points 
    : (tour.activity_type ? [tour.activity_type] : [])
  // Use supplier_business_name from backend
  const host = tour.supplier_business_name || tour.supplierBusinessName || tour.host || 'TripsAdora Partner'
  const oldPrice = tour.oldPrice || null  // Don't show oldPrice if not set
  // Handle price - it might be a number, string, or undefined
  let price = 'Price TBD'
  if (tour.price !== undefined && tour.price !== null) {
    if (typeof tour.price === 'number') {
      price = `$${tour.price.toFixed(0)}`
    } else if (typeof tour.price === 'string') {
      // If it's already a formatted string, use it as-is
      price = tour.price.startsWith('$') ? tour.price : `$${tour.price}`
    }
  }
  const slotsRemaining = tour.slotsRemaining

  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-custom-blue cursor-pointer">
      <div className="relative h-56">
        <img src={image || '/placeholder-tour.jpg'} alt={name || 'Tour'} className="w-full h-full object-cover" />
        {typeof slotsRemaining === 'number' && slotsRemaining > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded">
            Only {slotsRemaining} slots left
          </div>
        )}
        <button onClick={handleWishlistClick} className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200">
          {isInWishlist ? (
            <BsHeartFill className="text-red-500 w-5 h-5" />
          ) : (
            <FiHeart className="text-gray-600 hover:text-red-500 w-5 h-5" />
          )}
        </button>
      </div>
      <div className="p-4">
        {/* Rating - only show if rating exists */}
        {(rating > 0 || reviews > 0) && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-sm text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({reviews})</span>
          </div>
        )}
        {/* Location - only show if location exists */}
        {location && location !== 'Location TBD' && (
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <FiMapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">TripsAdora's Choice</span>
          <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700">Private</span>
        </div>
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
          <div className="flex items-center gap-1"><FiClock className="w-4 h-4" />{duration}</div>
          <div className="flex items-center gap-1"><FiUsers className="w-4 h-4" />{groupSize}</div>
        </div>
        {/* Tags - only show if tags exist */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0,5).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700">{t}</span>
            ))}
          </div>
        )}
        {/* Host */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">
            {(host && host.trim().charAt(0).toUpperCase()) || 'H'}
          </div>
          <div className="text-xs text-gray-600">
            <div className="text-gray-500">Hosted by</div>
            <div className="text-gray-800">{host}</div>
          </div>
        </div>

        {/* Price + Share */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            {oldPrice && <span className="text-xs text-gray-400 line-through">{oldPrice}</span>}
            <span className="text-xl font-bold text-custom-blue">{price || 'Price TBD'}</span>
          </div>
          <button className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center">
            <FiShare2 className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TourCard


