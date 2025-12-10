import React, { useState, useRef } from 'react'
import { FiShoppingCart, FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AttractionsDropdown from './AttractionsDropdown'
import DestinationsDropdown from './DestinationsDropdown'
import ExploreTripsAdoraDropdown from './ExploreTripsAdoraDropdown'

const BottomNavigationBar = () => {
  const navigate = useNavigate()
  const [isAttractionsOpen, setIsAttractionsOpen] = useState(false)
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false)
  const attractionsRef = useRef(null)
  const destinationsRef = useRef(null)
  const exploreRef = useRef(null)
  const [isExploreOpen, setIsExploreOpen] = useState(false)

  return (
    <>
      {/* Desktop navigation */}
      <div className="absolute top-24 left-0 right-0 z-40 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6">
          {/* Bottom Navigation Bar */}
          <div className="border-b border-white/10">
            {/* Top Row - Secondary Navigation */}
            <div className="flex items-center justify-between h-12 px-6">
              {/* Left Side Dropdowns */}
              <div className="flex items-center space-x-2 sm:space-x-8 text-[10px] sm:text-sm">
                <div 
                  ref={attractionsRef}
                  className="flex items-center text-gray-400 cursor-pointer group transition-colors text-[10px] sm:text-sm"
                  onClick={() => setIsAttractionsOpen(!isAttractionsOpen)}
                >
                  <span className="text-sm font-medium group-hover:text-white">Top Attractions</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:text-white" />
                </div>
                <div 
                  ref={destinationsRef}
                  className="flex items-center text-gray-400 cursor-pointer group transition-colors text-[10px] sm:text-sm"
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                >
                  <span className="text-sm font-medium group-hover:text-white">Top Destinations</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:text-white" />
                </div>
                <div 
                  ref={exploreRef}
                  className="flex items-center text-gray-400 cursor-pointer group transition-colors text-[10px] sm:text-sm"
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                >
                  <span className="text-sm font-medium group-hover:text-white">Explore TripsAdora</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:text-white" />
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="w-px h-6 bg-gray-400"></div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-6">
                <button onClick={() => navigate('/wishlist')} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button onClick={() => navigate('/cart')} className="text-gray-400 hover:text-gray-600 transition">
                  <FiShoppingCart className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/bookings')} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation (clean + no bubble background) */}
      <div className="lg:hidden fixed top-24 left-0 right-0 z-40 px-4">
<div className="grid grid-cols-3 gap-2 text-xs">


     <button
       ref={attractionsRef}
       onClick={() => setIsAttractionsOpen(!isAttractionsOpen)}
       className="flex-1 flex items-center justify-center gap-1 text-white font-medium py-2"
     >
       <span>Attractions</span>
       <FiChevronDown className="text-xs" />
     </button>

     <button
       ref={destinationsRef}
       onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
       className="flex-1 flex items-center justify-center gap-1 text-white font-medium py-2"
     >
       <span>Destinations</span>
       <FiChevronDown className="text-xs" />
     </button>

     <button
       ref={exploreRef}
       onClick={() => setIsExploreOpen(!isExploreOpen)}
       className="flex-1 flex items-center justify-center gap-1 text-white font-medium py-2"
     >
       <span>Explore</span>
       <FiChevronDown className="text-xs" />
     </button>

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
