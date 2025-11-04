import React, { useState } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const SearchSection = () => {
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [theme, setTheme] = useState('')
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('q', destination)
    if (theme) params.set('category', theme)
    if (date) params.set('date', date)
    const qs = params.toString()
    navigate(`/search${qs ? `?${qs}` : ''}`)
  }

  return (
    <section className="relative -mt-12 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-10 mt-8">Find Your Escape</h2>
          {/* Search Form */}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search Destination */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Where to?</label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destination"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-custom-blue outline-none text-lg"
                  onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(e) }}
                />
                <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
            
            {/* Check Dates */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">When?</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Check dates"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-custom-blue outline-none text-lg"
                  onFocus={(e) => { if (e.target.showPicker) e.target.showPicker() }}
                  onClick={(e) => { if (e.target.showPicker) e.target.showPicker() }}
                />
              </div>
            </div>
            
            {/* Select Theme */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Theme</label>
              <div className="relative">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-custom-blue outline-none appearance-none bg-white text-lg"
                >
                  <option value="">Select Theme</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="culture">Culture</option>
                  <option value="nature">Nature</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
              </div>
            </div>
            
            {/* Search Button */}
            <div className="flex items-end">
              <button type="submit" className="w-full bg-custom-blue text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg">
                Find
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default SearchSection
