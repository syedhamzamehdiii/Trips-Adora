import React, { useState } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiClock, FiChevronDown } from 'react-icons/fi'

const CheckAvailabilityPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingData = location.state || {}
  
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('Oct, 17, 2025')
  const [selectedTime, setSelectedTime] = useState('10:30 AM')
  const [selectedPersons, setSelectedPersons] = useState(3)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)

  const timeSlots = [
    '6:00 am', '7:00 am', '8:00 am', '8:30 am', '9:00 am',
    '10:30 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm',
    '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm'
  ]

  const handlePersonChange = (delta) => {
    setSelectedPersons(prev => Math.max(1, prev + delta))
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

    const days = []
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true })
    }
    // Add empty cells for days after the last day of the month
    const remainingCells = 7 - (days.length % 7)
    if (remainingCells !== 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push({ day: null, isCurrentMonth: false })
      }
    }
    return days
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatDate = (day) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return `${monthNames[currentMonth.getMonth()]}, ${day}, ${currentMonth.getFullYear()}`
  }

  const handleDateClick = (dayObj) => {
    if (!dayObj || !dayObj.isCurrentMonth) return
    const formatted = formatDate(dayObj.day)
    setSelectedDate(formatted)
    setShowCalendar(false)
  }

  const isDateSelected = (dayObj) => {
    if (!dayObj || !dayObj.isCurrentMonth) return false
    const formatted = formatDate(dayObj.day)
    return formatted === selectedDate
  }

  const handleContinue = () => {
    navigate('/choose-vehicle', {
      state: {
        selectedDate,
        selectedTime,
        selectedPersons,
        bookingData
      }
    })
  }

  return (
    <div className="bg-gray-50">
      <MainHeader />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Steps */}
        <div className="mb-8">
          <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          {/* Steps */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#1d236b' }}>Select Options</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                <span className="text-gray-500 font-semibold">2</span>
              </div>
              <span className="font-medium text-gray-500">Choose Vehicle</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                <span className="text-gray-500 font-semibold">3</span>
              </div>
              <span className="font-medium text-gray-500">Payment Details</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Select Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiCalendar className="w-6 h-6" style={{ color: '#1d236b' }} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select your travel Options</h2>
                <p className="text-gray-600">Choose your preferred date for the tour</p>
              </div>
            </div>

            {/* Travel Date */}
            <div className="mb-6 relative">
              <label className="block text-lg font-semibold text-gray-900 mb-3">Travel Date</label>
              <div 
                className="cursor-pointer border border-gray-300 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-400 transition"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <FiCalendar className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-gray-700">{selectedDate}</span>
                <FiChevronDown className="w-5 h-5 text-gray-500" />
              </div>

              {/* Calendar Widget */}
              {showCalendar && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePreviousMonth}
                      className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-white px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: '#1d236b' }}>
                        {currentMonth.getFullYear()}
                      </div>
                      <div className="text-white px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: '#1d236b' }}>
                        {months[currentMonth.getMonth()]}
                      </div>
                    </div>

                    <button
                      onClick={handleNextMonth}
                      className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map((day, idx) => (
                      <div key={idx} className="text-center text-sm font-medium py-2">
                        <span className={idx >= 5 ? 'text-blue-600' : 'text-gray-600'} style={idx >= 5 ? { color: '#1d236b' } : {}}>{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentMonth).map((dayObj, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(dayObj)}
                        disabled={!dayObj.isCurrentMonth}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition ${
                          !dayObj.isCurrentMonth
                            ? 'text-gray-300 cursor-not-allowed'
                            : isDateSelected(dayObj)
                            ? 'text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        style={isDateSelected(dayObj) ? { backgroundColor: '#1d236b' } : {}}
                      >
                        {dayObj.day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Travel Time */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">Travel Time</label>
              <div className="relative">
                <div 
                  className="cursor-pointer border border-gray-300 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-400 transition"
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                >
                  <FiClock className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-gray-700">{selectedTime}</span>
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                </div>
                
                {/* Time Dropdown */}
                {showTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {timeSlots.map((time, idx) => (
                      <div 
                        key={idx}
                        className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedTime(time)
                          setShowTimeDropdown(false)
                        }}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedTime === time ? 'border-gray-300' : 'border-gray-300'
                        }`} style={selectedTime === time ? { backgroundColor: '#1d236b', borderColor: '#1d236b' } : {}}>
                          {selectedTime === time && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-gray-700">{time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Number of Persons */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">Choose Number Of Persons</label>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => handlePersonChange(-1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                  style={{ backgroundColor: '#1d236b' }}
                >
                  −
                </button>
                <div className="w-16 text-center border border-gray-300 rounded-lg py-2 bg-white">
                  <span className="text-xl font-bold text-gray-900">{selectedPersons}</span>
                </div>
                <button 
                  onClick={() => handlePersonChange(1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                  style={{ backgroundColor: '#1d236b' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
            
            {/* Image */}
            <div className="w-full h-64 rounded-xl overflow-hidden mb-6">
              <img 
                src={bookingData.image || '/assests/bg.jpg'} 
                alt={bookingData.name || 'Tour'} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tour Details */}
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">{bookingData.name || 'Private Tour, Minato City, Tokyo, Japan'}</p>
              <p className="text-gray-600">{bookingData.location || 'Tokyo, Japan'}</p>
            </div>

            {/* Selected Options */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Travel Date:</span>
                <span className="text-gray-900 font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Travel Time:</span>
                <span className="text-gray-900 font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Number of Persons:</span>
                <span className="text-gray-900 font-semibold">{selectedPersons}</span>
              </div>
            </div>

            {/* Continue Button */}
            <button onClick={handleContinue} className="w-full mt-8 py-3 rounded-lg text-white font-semibold transition" style={{ backgroundColor: '#1d236b' }}>
              Continue
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default CheckAvailabilityPage
