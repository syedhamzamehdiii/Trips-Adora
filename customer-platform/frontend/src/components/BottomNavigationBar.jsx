import React, { useState, useRef } from 'react'
import { FiShoppingCart, FiChevronDown } from 'react-icons/fi'
import AttractionsDropdown from './AttractionsDropdown'
import DestinationsDropdown from './DestinationsDropdown'
import ExploreTripsAdoraDropdown from './ExploreTripsAdoraDropdown'

const BottomNavigationBar = () => {
  const [isAttractionsOpen, setIsAttractionsOpen] = useState(false)
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false)
  const attractionsRef = useRef(null)
  const destinationsRef = useRef(null)
  const exploreRef = useRef(null)
  const [isExploreOpen, setIsExploreOpen] = useState(false)

  return (
    <>
      <div className="absolute top-24 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Bottom Navigation Bar */}
          <div className="border-b border-white/10">
            {/* Top Row - Secondary Navigation */}
            <div className="flex items-center justify-between h-12 px-6">
              {/* Left Side Dropdowns */}
              <div className="flex items-center space-x-8">
                <div 
                  ref={attractionsRef}
                  className="flex items-center text-gray-400 cursor-pointer group"
                  onClick={() => setIsAttractionsOpen(!isAttractionsOpen)}
                >
                  <span className="text-sm font-medium group-hover:text-gray-600">Top Attractions</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:text-gray-600" />
                </div>
                <div 
                  ref={destinationsRef}
                  className="flex items-center text-gray-400 cursor-pointer group"
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                >
                  <span className="text-sm font-medium group-hover:text-gray-600">Top Destinations</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:text-gray-600" />
                </div>
                <div 
                  ref={exploreRef}
                  className="flex items-center text-gray-400 cursor-pointer group"
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                >
                  <span className="text-sm font-medium group-hover:text-gray-600">Explore TripsAdora</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:text-gray-600" />
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="w-px h-6 bg-gray-400"></div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-6">
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <FiShoppingCart className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attractions Dropdown */}
      <AttractionsDropdown 
        isOpen={isAttractionsOpen} 
        onClose={() => setIsAttractionsOpen(false)}
        triggerRef={attractionsRef}
      />

      {/* Destinations Dropdown */}
      <DestinationsDropdown 
        isOpen={isDestinationsOpen}
        onClose={() => setIsDestinationsOpen(false)}
        triggerRef={destinationsRef}
      />

      {/* Explore TripsAdora Dropdown */}
      <ExploreTripsAdoraDropdown 
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        triggerRef={exploreRef}
      />
    </>
  )
}

export default BottomNavigationBar
