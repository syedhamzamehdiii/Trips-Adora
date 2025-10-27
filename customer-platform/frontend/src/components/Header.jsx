import React, { useState, useRef } from 'react'
import { FiUser, FiChevronDown } from 'react-icons/fi'
import SettingsModal from './SettingsModal'

const Header = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const profileRef = useRef(null)

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Navigation Bar with Rounded Corners */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
            {/* Main Navigation */}
            <div className="flex items-center justify-between h-16 px-6">
              {/* Logo */}
              <div className="flex items-center">
                <img 
                  src="/assests/logo1.png" 
                  alt="TripsAdora Logo" 
                  className="h-14 w-auto object-contain"
                />
              </div>

              {/* Main Navigation Links */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-white font-semibold text-base hover:text-gray-200 transition">Home</a>
                <a href="#" className="text-white font-normal text-base hover:text-gray-200 transition">Blogs</a>
                <a href="#" className="text-white font-normal text-base hover:text-gray-200 transition">About</a>
                <a href="#" className="text-white font-normal text-base hover:text-gray-200 transition">Contact</a>
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-6 relative">
                {/* Language Selector */}
                <div className="flex items-center space-x-1 text-white cursor-pointer hover:text-gray-200">
                  <span className="text-sm font-medium">EN</span>
                  <FiChevronDown className="text-xs" />
                </div>

                {/* User Profile */}
                <div 
                  ref={profileRef}
                  className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <FiUser className="text-white text-sm" />
                </div>
              </div>
            </div>


          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        profileRef={profileRef}
      />
    </>
  )
}

export default Header
