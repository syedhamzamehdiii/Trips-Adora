import React from 'react'
import { FiHeart, FiMapPin, FiClock, FiUsers, FiShare2 } from 'react-icons/fi'

const TourCard = ({ tour }) => {
  const {
    image,
    name,
    duration,
    groupSize = 'Up to 12',
    location = 'Tokyo Japan',
    rating = 4.8,
    reviews = '384',
    tags = ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
    host = 'Karvaan Tours',
    oldPrice = '$250',
    price,
    slotsRemaining
  } = tour

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-custom-blue">
      <div className="relative h-56">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {typeof slotsRemaining === 'number' && slotsRemaining > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded">
            Only {slotsRemaining} slots left
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200">
          <FiHeart className="text-gray-600 hover:text-red-500" />
        </button>
      </div>
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400">★★★★★</span>
          <span className="text-sm text-gray-700">{rating}</span>
          <span className="text-sm text-gray-500">({reviews})</span>
        </div>
        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
          <FiMapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
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
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0,5).map((t, i) => (
            <span key={i} className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700">{t}</span>
          ))}
        </div>
        {/* Host */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">K</div>
          <div className="text-xs text-gray-600">
            <div className="text-gray-500">Hosted by</div>
            <div className="text-gray-800">{host}</div>
          </div>
        </div>

        {/* Price + Share */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-gray-400 line-through">{oldPrice}</span>
            <span className="text-xl font-bold text-custom-blue">{price}</span>
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


