import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import TourCard from '../components/TourCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import tc2 from '../../assests/tc2.jpg'
import tc4 from '../../assests/tc4.jpg'
import place1 from '../../assests/place 1.jpg'
import mountfuj from '../../assests/mount-fuj.jpg'

const ComparisonPage = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Products to compare with
  const comparisonProducts = [
    {
      id: 1,
      name: 'Mount Fuji Highlights & Hidden Gems Tour',
      image: mountfuj,
      rating: 4.8,
      reviews: '342',
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$258/person',
      oldPrice: '$300',
      location: 'Tokyo, Japan'
    },
    {
      id: 2,
      name: 'Burj Khalifa Highlights & Hidden Gems Tour',
      image: tc4,
      rating: 4.8,
      reviews: '234',
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$167/person',
      oldPrice: '$200',
      location: 'Dubai, UAE'
    },
    {
      id: 3,
      name: 'Tokyo Highlights & Hidden Gems Tour',
      image: place1,
      rating: 4.8,
      reviews: '234',
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$345/person',
      oldPrice: '$400',
      location: 'Tokyo, Japan'
    },
    {
      id: 4,
      name: 'Hakone Highlights & Hidden Gems Tour',
      image: tc2,
      rating: 4.8,
      reviews: '234',
      duration: '8 hours',
      groupSize: 'Up to 12',
      price: '$245/person',
      oldPrice: '$280',
      location: 'Tokyo, Japan'
    }
  ]

  const visibleCards = 3
  const maxIndex = Math.max(0, comparisonProducts.length - visibleCards)

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const visibleProducts = comparisonProducts.slice(currentIndex, currentIndex + visibleCards)

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Perfect Experience</h1>
          <p className="text-lg text-gray-600">
            Compare side by side to find the tour that best matches your preferences
          </p>
        </div>

        {/* Comparison Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Choose the list of products you want to compare your product with:
          </h2>
          
          {/* Products Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
                currentIndex === 0 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
                currentIndex >= maxIndex 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Products Grid */}
            <div className="flex justify-center gap-6 overflow-hidden">
              {visibleProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex-none w-full sm:w-1/2 md:w-1/3 transition-transform duration-300"
                  style={{ 
                    minWidth: '300px',
                    maxWidth: '350px'
                  }}
                >
                  <TourCard 
                    tour={product}
                    onClick={() => navigate(`/comparison/detail/1&${product.id}`)}
                  />
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Back to Products Button */}
        <div className="text-center mb-12">
          <Link 
            to="/search"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            View All Tours
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ComparisonPage

