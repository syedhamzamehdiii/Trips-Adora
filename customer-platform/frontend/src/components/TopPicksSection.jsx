import React from 'react'
import { FiHeart, FiStar } from 'react-icons/fi'

const TopPicksSection = () => {
  const destinations = [
    {
      id: 1,
      name: "Mount Fuji, Japan",
      image: "/assests/bg.jpg", // Using bg.jpg as placeholder
      rating: 4.5,
      reviews: "1.2k reviews",
      price: "$120/person",
      isNew: true
    },
    {
      id: 2,
      name: "Arashiyama Bamboo Forest, Japan",
      image: "/assests/bg.jpg",
      rating: 4.8,
      reviews: "856 reviews",
      price: "$95/person",
      isNew: false
    },
    {
      id: 3,
      name: "Santorini, Greece",
      image: "/assests/bg.jpg",
      rating: 4.7,
      reviews: "2.1k reviews",
      price: "$180/person",
      isNew: true
    },
    {
      id: 4,
      name: "Bali, Indonesia",
      image: "/assests/bg.jpg",
      rating: 4.6,
      reviews: "1.8k reviews",
      price: "$150/person",
      isNew: false
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Top picks for you...</h2>
          <a href="#" className="text-custom-blue hover:text-blue-600 font-medium">
            View All
          </a>
        </div>
        
        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Image Container */}
              <div className="relative h-48">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                
                {/* New Badge */}
                {destination.isNew && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      New
                    </span>
                  </div>
                )}
                
                {/* Heart Icon */}
                <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200">
                  <FiHeart className="text-gray-600 hover:text-red-500" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {destination.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(destination.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {destination.rating} ({destination.reviews})
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-custom-blue">
                    {destination.price}
                  </span>
                </div>
                
                {/* Book Now Button */}
                <button className="w-full bg-custom-blue text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopPicksSection
