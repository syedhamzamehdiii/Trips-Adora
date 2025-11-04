import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiChevronDown, FiShoppingCart } from 'react-icons/fi'
import SettingsModal from './SettingsModal'
import AttractionsDropdown from './AttractionsDropdown'
import DestinationsDropdown from './DestinationsDropdown'
import ExploreTripsAdoraDropdown from './ExploreTripsAdoraDropdown'

const MainHeader = () => {
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const profileRef = useRef(null)
  
  // Bottom Navigation Bar State
  const [isAttractionsOpen, setIsAttractionsOpen] = useState(false)
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false)
  const attractionsRef = useRef(null)
  const destinationsRef = useRef(null)
  const exploreRef = useRef(null)
  const [isExploreOpen, setIsExploreOpen] = useState(false)

  return (
    <>
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gray-100 rounded-2xl shadow-sm">
            <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center cursor-pointer">
                <img 
                  src="/assests/logo1.png" 
                  alt="TripsAdora Logo" 
                  className="h-14 w-auto object-contain"
                />
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6 flex-shrink-0">
                <Link to="/dashboard" className="text-gray-900 font-medium text-sm hover:opacity-80 transition">Home</Link>
                <Link to="/blogs" className="text-gray-900 font-normal text-sm hover:opacity-80 transition">Blogs</Link>
                <Link to="/about-us" className="text-gray-900 font-normal text-sm hover:opacity-80 transition">About</Link>
                <Link to="/contact" className="text-gray-900 font-normal text-sm hover:opacity-80 transition">Contact</Link>
              </nav>

              {/* Language Selector and Profile */}
              <div className="flex items-center space-x-4 relative flex-shrink-0">
                <div className="flex items-center text-gray-900 cursor-pointer hover:opacity-80">
                  <span className="text-sm font-medium">EN</span>
                </div>

                <div 
                  ref={profileRef}
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition"
                  style={{ backgroundColor: '#1d236b' }}
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <FiUser className="text-white text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between h-12 px-4 sm:px-6">
              {/* Left Side Dropdowns */}
              <div className="flex items-center space-x-8">
                <div 
                  ref={exploreRef}
                  className="flex items-center text-gray-900 cursor-pointer group"
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                >
                  <span className="text-sm font-medium group-hover:opacity-80">Things to do</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:opacity-80" />
                </div>
                <div 
                  ref={attractionsRef}
                  className="flex items-center text-gray-900 cursor-pointer group"
                  onClick={() => setIsAttractionsOpen(!isAttractionsOpen)}
                >
                  <span className="text-sm font-medium group-hover:opacity-80">Top Attractions of Japan</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:opacity-80" />
                </div>
                <div 
                  ref={destinationsRef}
                  className="flex items-center text-gray-900 cursor-pointer group"
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                >
                  <span className="text-sm font-medium group-hover:opacity-80">Trips Inspiration</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:opacity-80" />
                </div>
              </div>

              {/* Right Side Icons - Only 3 icons: Heart, Cart, Calendar */}
              <div className="flex items-center space-x-6">
                <button onClick={() => navigate('/wishlist')} className="text-gray-900 hover:opacity-80 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button onClick={() => navigate('/cart')} className="text-gray-900 hover:opacity-80 transition">
                  <FiShoppingCart className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/bookings')} className="text-gray-900 hover:opacity-80 transition relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg className="w-3 h-3 absolute bottom-0 right-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1d236b' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        profileRef={profileRef}
      />
    </>
  )
}

export default MainHeader