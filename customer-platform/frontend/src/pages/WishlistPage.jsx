import React, { useState, useEffect } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { FiHeart, FiMapPin, FiClock, FiUsers, FiShare2, FiArrowLeft } from 'react-icons/fi'

const WishlistPage = () => {
  const [wishlistTours, setWishlistTours] = useState([])

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist')
        const parsed = savedWishlist ? JSON.parse(savedWishlist) : []
        if (Array.isArray(parsed)) {
          setWishlistTours(parsed)
        } else {
          setWishlistTours([])
        }
      } catch (_) {
        setWishlistTours([])
      }
    }

    const handleWishlistChange = (event) => {
      if (event?.detail && Array.isArray(event.detail)) {
        setWishlistTours(event.detail)
      } else {
        loadWishlist()
      }
    }

    loadWishlist()
    window.addEventListener('wishlist:changed', handleWishlistChange)
    window.addEventListener('storage', loadWishlist)

    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChange)
      window.removeEventListener('storage', loadWishlist)
    }
  }, [])

  const handleRemoveFromWishlist = (tourId) => {
    const updatedWishlist = wishlistTours.filter(tour => tour.id !== tourId)
    setWishlistTours(updatedWishlist)
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    try {
      window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: updatedWishlist }))
    } catch (_) {}
  }

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <FiHeart className="w-6 h-6 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Tours Grid */}
        {wishlistTours.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            Your wishlist is empty. Browse tours and tap the heart icon to save them here.
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistTours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-custom-blue cursor-pointer">
              <div className="relative h-56">
                <img src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
                {tour.slotsRemaining && tour.slotsRemaining > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded">
                    Only {tour.slotsRemaining} slots left
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleRemoveFromWishlist(tour.id); }} className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200">
                  <FiHeart className="text-red-500 w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-sm text-gray-700">{tour.rating}</span>
                  <span className="text-sm text-gray-500">({tour.reviews})</span>
                </div>
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <FiMapPin className="w-4 h-4" />
                  <span>{tour.location}</span>
                </div>
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tour.name}</h3>
                {/* Badges Row */}
                <div className="flex items-center gap-2 mb-2">
                  {tour.isTripadurasChoice && (
                    <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">TripsAdora's Choice</span>
                  )}
                  {tour.isPrivate && (
                    <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700">Private</span>
                  )}
                </div>
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                  <div className="flex items-center gap-1"><FiClock className="w-4 h-4" />{tour.duration}</div>
                  <div className="flex items-center gap-1"><FiUsers className="w-4 h-4" />{tour.groupSize}</div>
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {tour.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700">{tag}</span>
                  ))}
                </div>
                {/* Host */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">
                    {tour.host.charAt(0)}
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="text-gray-500">Hosted by</div>
                    <div className="text-gray-800">{tour.host}</div>
                  </div>
                </div>

                {/* Price + Share */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    {tour.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">{tour.oldPrice}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-custom-blue">{tour.price}</span>
                      {tour.discount && (
                        <span className="text-xs text-red-500 font-semibold">{tour.discount}</span>
                      )}
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition">
                    <FiShare2 className="text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
      
      <Footer />
    </div>
  )
}

export default WishlistPage

