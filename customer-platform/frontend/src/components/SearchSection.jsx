import React from 'react'
import { FiSearch, FiCalendar, FiChevronDown } from 'react-icons/fi'

const SearchSection = () => {
  return (
    <section className="relative -mt-24 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-10">Find Your Escape</h2>
          
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search Destination */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Where to?</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destination"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-custom-blue outline-none text-lg"
                />
                <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
            
            {/* Check Dates */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">When?</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Check dates"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-custom-blue outline-none text-lg"
                />
                <FiCalendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
            
            {/* Select Theme */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Who?</label>
              <div className="relative">
                <select className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-custom-blue outline-none appearance-none bg-white text-lg">
                  <option>Select Theme</option>
                  <option>Adventure</option>
                  <option>Relaxation</option>
                  <option>Culture</option>
                  <option>Nature</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
              </div>
            </div>
            
            {/* Search Button */}
            <div className="flex items-end">
              <button className="w-full bg-custom-blue text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg">
                Find
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchSection
