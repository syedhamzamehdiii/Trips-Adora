import React from 'react'
import { FiSearch, FiUser, FiShoppingCart, FiChevronDown } from 'react-icons/fi'

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      {/* Top Navigation Bar */}
      <div className="bg-black bg-opacity-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/assests/logo1.png" 
                alt="TripsAdora Logo" 
                className="h-10 w-10"
              />
              <span className="text-white text-2xl font-bold">TripsAdora</span>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white hover:text-gray-200 font-semibold text-lg">Home</a>
              <a href="#" className="text-gray-300 hover:text-white font-medium text-lg">Blogs</a>
              <a href="#" className="text-gray-300 hover:text-white font-medium text-lg">About</a>
              <a href="#" className="text-gray-300 hover:text-white font-medium text-lg">Contact</a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* Language/Currency */}
              <div className="flex items-center space-x-3 text-white">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">EN</span>
                  <FiChevronDown className="text-xs" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">$</span>
                  <FiChevronDown className="text-xs" />
                </div>
              </div>

              {/* User Profile */}
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-black bg-opacity-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left Side Dropdowns */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center text-white hover:text-gray-200 cursor-pointer">
                <span className="text-sm font-medium">Top Attractions</span>
                <FiChevronDown className="ml-1 text-xs" />
              </div>
              <div className="flex items-center text-white hover:text-gray-200 cursor-pointer">
                <span className="text-sm font-medium">Top Destinations</span>
                <FiChevronDown className="ml-1 text-xs" />
              </div>
              <div className="flex items-center text-white hover:text-gray-200 cursor-pointer">
                <span className="text-sm font-medium">Explore TripsAdora</span>
                <FiChevronDown className="ml-1 text-xs" />
              </div>
            </div>

            {/* Separator Line */}
            <div className="hidden lg:block w-px h-6 bg-gray-400 bg-opacity-50"></div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-6">
              <div className="text-white text-xl cursor-pointer hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="text-white text-xl cursor-pointer hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-white text-xl cursor-pointer hover:text-gray-200">
                <FiShoppingCart />
              </div>
              <div className="text-white text-xl cursor-pointer hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
