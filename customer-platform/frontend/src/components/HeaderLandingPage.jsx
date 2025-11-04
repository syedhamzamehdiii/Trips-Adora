import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiChevronDown } from 'react-icons/fi'
import SettingsModal from './SettingsModal'

const HeaderLandingPage = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const profileRef = useRef(null)

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between h-16 px-6">
              <Link to="/dashboard" className="flex items-center cursor-pointer">
                <img 
                  src="/assests/logo1.png" 
                  alt="TripsAdora Logo" 
                  className="h-14 w-auto object-contain"
                />
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/dashboard" className="text-white font-semibold text-base hover:text-gray-200 transition">Home</Link>
                <Link to="/blogs" className="text-white font-normal text-base hover:text-gray-200 transition">Blogs</Link>
                <Link to="/about-us" className="text-white font-normal text-base hover:text-gray-200 transition">About</Link>
                <Link to="/contact" className="text-white font-normal text-base hover:text-gray-200 transition">Contact</Link>
              </nav>

              <div className="flex items-center space-x-6 relative">
                <div className="flex items-center space-x-1 text-white cursor-pointer hover:text-gray-200">
                  <span className="text-sm font-medium">EN</span>
                  <FiChevronDown className="text-xs" />
                </div>

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

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        profileRef={profileRef}
      />
    </>
  )
}

export default HeaderLandingPage


