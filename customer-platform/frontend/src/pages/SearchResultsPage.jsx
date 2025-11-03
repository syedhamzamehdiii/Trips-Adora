import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import TourCard from '../components/TourCard'
import { FiFilter } from 'react-icons/fi'
import tc2 from '../../assests/tc2.jpg'
import tc4 from '../../assests/tc4.jpg'
import place1 from '../../assests/place 1.jpg'

const SearchResultsPage = () => {
  const navigate = useNavigate()
  
  // Filter states
  const [tourTypes, setTourTypes] = useState([])
  const [locations, setLocations] = useState([])
  const [durations, setDurations] = useState([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minimumRating, setMinimumRating] = useState('Any Rating')
  const [itemsPerPage, setItemsPerPage] = useState('9')
  const [sortBy, setSortBy] = useState('Recommended')

  // All products data
  const allProducts = useMemo(() => [
    {
      id: 1,
      name: 'Hokonos Highlights & Hidden Gems Tour',
      image: tc2,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$245/person',
      location: 'Tokyo, Japan'
    },
    {
      id: 2,
      name: 'Burj Khalifa Highlights & Hidden Gems Tour',
      image: tc4,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$167/person',
      location: 'Dubai, UAE'
    },
    {
      id: 3,
      name: 'Tokyo Highlights & Hidden Gems Tour',
      image: place1,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$345/person',
      location: 'Tokyo, Japan'
    },
    // Repeat the pattern to create 9 products
    {
      id: 4,
      name: 'Hokonos Highlights & Hidden Gems Tour',
      image: tc2,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$245/person',
      location: 'Tokyo, Japan'
    },
    {
      id: 5,
      name: 'Burj Khalifa Highlights & Hidden Gems Tour',
      image: tc4,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$167/person',
      location: 'Dubai, UAE'
    },
    {
      id: 6,
      name: 'Tokyo Highlights & Hidden Gems Tour',
      image: place1,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$345/person',
      location: 'Tokyo, Japan'
    },
    {
      id: 7,
      name: 'Hokonos Highlights & Hidden Gems Tour',
      image: tc2,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$245/person',
      location: 'Tokyo, Japan'
    },
    {
      id: 8,
      name: 'Burj Khalifa Highlights & Hidden Gems Tour',
      image: tc4,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$167/person',
      location: 'Dubai, UAE'
    },
    {
      id: 9,
      name: 'Tokyo Highlights & Hidden Gems Tour',
      image: place1,
      rating: 4.8,
      reviews: 234,
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$345/person',
      location: 'Tokyo, Japan'
    }
  ], [])

  // Filter toggle functions
  const toggleFilter = (filterType, value) => {
    if (filterType === 'tourType') {
      setTourTypes(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else if (filterType === 'location') {
      setLocations(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else if (filterType === 'duration') {
      setDurations(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    }
  }

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Apply price range filter
    if (priceRange && priceRange.length === 2) {
      filtered = filtered.filter(product => {
        // Extract numeric price from string like "$245/person"
        const priceValue = parseInt(product.price.match(/\$(\d+)/)?.[1] || '0')
        return priceValue >= priceRange[0] && priceValue <= priceRange[1]
      })
    }

    // Apply minimum rating filter
    if (minimumRating !== 'Any Rating') {
      const minRating = parseFloat(minimumRating)
      filtered = filtered.filter(product => product.rating >= minRating)
    }

    // Apply location filter
    if (locations.length > 0) {
      filtered = filtered.filter(product => 
        locations.some(loc => product.location.includes(loc))
      )
    }

    // Apply duration filter
    if (durations.length > 0) {
      filtered = filtered.filter(product => 
        durations.some(dur => product.duration.includes(dur))
      )
    }

    return filtered
  }, [allProducts, priceRange, minimumRating, locations, durations])

  // Handle price range slider
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value)
    setPriceRange([0, value])
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiFilter className="w-5 h-5" />
                  Filters
                </h2>
              </div>
              
              <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Tour Type */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tour Type</h3>
                  <div className="space-y-2">
                    {['Shared Tours', 'Private Tours', 'Customize Tours'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tourTypes.includes(type)}
                          onChange={() => toggleFilter('tourType', type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Locations</h3>
                  <div className="space-y-2">
                    {[
                      'Amsterdam, Netherlands',
                      'Bali, Indonesia',
                      'Bangkok, Thailand',
                      'Barcelona, Spain',
                      'Dubai, UAE',
                      'Kyoto, Japan',
                      'London, UK'
                    ].map((location) => (
                      <label key={location} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={locations.includes(location)}
                          onChange={() => toggleFilter('location', location)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Duration</h3>
                  <div className="space-y-2">
                    {[
                      '10 hours', '3 hours', '4 hours', '5 hours',
                      '6 hours', '7 hours', '8 hours', 'Flexible hours', 'Full Day'
                    ].map((duration) => (
                      <label key={duration} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={durations.includes(duration)}
                          onChange={() => toggleFilter('duration', duration)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{duration}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={priceRange[1]}
                        onChange={handlePriceChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h3>
                  <select
                    value={minimumRating}
                    onChange={(e) => setMinimumRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>Any Rating</option>
                    <option>4.5+</option>
                    <option>4.0+</option>
                    <option>3.5+</option>
                    <option>3.0+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Top controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="9">Items Per Page</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="36">36</option>
                </select>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <TourCard 
                  key={product.id} 
                  tour={product}
                  onClick={() => navigate(`/product-details/${product.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default SearchResultsPage

