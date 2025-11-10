import React, { useState, useEffect } from 'react'

const ExperienceCard = ({ image, title, price, liked=false, id }) => {
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    // Check if tour is in wishlist
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      const wishlist = JSON.parse(savedWishlist)
      const tourId = id || title
      setIsInWishlist(wishlist.some(item => item.id === tourId))
    }
  }, [id, title])

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    
    // Get or initialize wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist')
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : []
    
    // Create tour object for wishlist
    const tourId = id || title
    const tourForWishlist = {
      id: tourId,
      name: title,
      image: image,
      price: price,
      rating: 4.8,
      reviews: '384',
      tags: ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
      host: 'TripsAdora',
      oldPrice: null,
      isPrivate: true,
      isTripadurasChoice: false,
      duration: '8 hours',
      groupSize: 'Up to 12',
      location: 'Japan'
    }
    
    // Check if tour is already in wishlist
    const alreadyInWishlist = wishlist.some(item => item.id === tourId)
    
    if (alreadyInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== tourId)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      try {
        window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
      } catch (_) {}
      setIsInWishlist(false)
    } else {
      // Add tour to wishlist
      const updatedWishlist = [...wishlist, tourForWishlist]
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      try {
        window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
      } catch (_) {}
      setIsInWishlist(true)
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
      <div className="h-72">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      {/* Bottom overlay like screenshot */}
      <div className="absolute left-3 right-3 bottom-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] text-gray-900 font-semibold truncate">{title}</div>
            <div className="text-[10px] text-gray-600">{price}</div>
          </div>
          <button onClick={handleWishlistClick} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 border border-gray-300">
            <span className={`text-xs ${isInWishlist ? 'text-red-500' : 'text-gray-500'}`}>♥</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExperienceCard


