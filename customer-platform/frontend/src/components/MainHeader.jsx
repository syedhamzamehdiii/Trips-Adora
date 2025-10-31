import React from 'react'
import { Link } from 'react-router-dom'

const MainHeader = () => {
  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gray-100 rounded-2xl shadow-sm">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
              <img src="/assests/logo1.png" alt="TripsAdora" className="h-8 w-auto object-contain" />
            </div>
            <nav className="hidden md:flex items-center gap-8 text-gray-900">
              <Link to="/dashboard" className="text-sm hover:opacity-80">Home</Link>
              <a href="#" className="text-sm hover:opacity-80">Explore</a>
              <a href="#" className="text-sm hover:opacity-80">Blogs</a>
              <Link to="/about-us" className="text-sm hover:opacity-80">About</Link>
              <a href="#" className="text-sm hover:opacity-80">Contact</a>
            </nav>
            <div className="flex items-center gap-6">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">EN</span>
              <div className="w-8 h-8 rounded-full bg-rose-300 text-black flex items-center justify-center text-xs sm:text-sm">R</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainHeader