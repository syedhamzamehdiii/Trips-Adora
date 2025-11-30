import React, { useState, useEffect, useMemo } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiClock, FiChevronDown, FiMapPin } from 'react-icons/fi'
import { FaCar, FaCheck } from 'react-icons/fa'
import { getProductById, transformProductForFrontend } from '../services/productService'

const CheckAvailabilityPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingData = location.state || {}
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('Oct, 17, 2025')
  const [selectedTime, setSelectedTime] = useState('10:30 AM')
  const [selectedPersons, setSelectedPersons] = useState(3)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  
  // Vehicle and meeting point selection
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(
    bookingData.selectedVehicleIndex !== undefined ? bookingData.selectedVehicleIndex : null
  )
  const [selectedMeetingPointIndex, setSelectedMeetingPointIndex] = useState(
    bookingData.selectedMeetingPointIndex !== undefined ? bookingData.selectedMeetingPointIndex : null
  )
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)
  const [showMeetingPointDropdown, setShowMeetingPointDropdown] = useState(false)

  // Fetch product data if productId is available
  useEffect(() => {
    const fetchProduct = async () => {
      if (bookingData.productId) {
        setLoading(true)
        try {
          const productData = await getProductById(bookingData.productId, true)
          if (productData) {
            const transformed = transformProductForFrontend(productData)
            setProduct(transformed)
          }
        } catch (error) {
          console.error('Failed to fetch product:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchProduct()
  }, [bookingData.productId])

  // Initialize vehicle selection when product loads
  useEffect(() => {
    if (product && Array.isArray(product.vehicles) && product.vehicles.length > 0) {
      // Only set default if no valid selection exists from bookingData
      if (selectedVehicleIndex === null || selectedVehicleIndex >= product.vehicles.length) {
        // Check if bookingData has a valid selection
        if (bookingData.selectedVehicleIndex !== undefined && 
            bookingData.selectedVehicleIndex !== null &&
            bookingData.selectedVehicleIndex < product.vehicles.length) {
          setSelectedVehicleIndex(bookingData.selectedVehicleIndex)
        } else {
          // Default to first vehicle only if no selection from bookingData
          setSelectedVehicleIndex(0)
        }
      }
    } else {
      setSelectedVehicleIndex(null)
    }
  }, [product]) // Remove bookingData.selectedVehicleIndex from dependencies to avoid overriding

  // Initialize meeting point selection when vehicle is set
  useEffect(() => {
    if (selectedVehicleIndex !== null && bookingData.selectedMeetingPointIndex !== undefined && bookingData.selectedMeetingPointIndex !== null) {
      // Only set if we have meeting points available (will be checked in the meeting points useMemo)
      setSelectedMeetingPointIndex(bookingData.selectedMeetingPointIndex)
    }
  }, [selectedVehicleIndex, bookingData.selectedMeetingPointIndex])

  // Reset meeting point when vehicle changes
  useEffect(() => {
    setSelectedMeetingPointIndex(null)
  }, [selectedVehicleIndex])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showVehicleDropdown && !event.target.closest('[data-vehicle-dropdown]')) {
        setShowVehicleDropdown(false)
      }
      if (showMeetingPointDropdown && !event.target.closest('[data-meeting-point-dropdown]')) {
        setShowMeetingPointDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVehicleDropdown, showMeetingPointDropdown])

  // Get available days from product data
  const availableDays = useMemo(() => {
    // Priority 1: From bookingData (passed from ProductDetails)
    if (Array.isArray(bookingData.availableDays) && bookingData.availableDays.length > 0) {
      return bookingData.availableDays
    }
    // Priority 2: From product.pickup_dropoff.available_days
    if (product?.pickup_dropoff?.available_days && Array.isArray(product.pickup_dropoff.available_days) && product.pickup_dropoff.available_days.length > 0) {
      return product.pickup_dropoff.available_days
    }
    // Priority 3: From bookingData.pickup_dropoff.available_days
    if (bookingData.pickup_dropoff?.available_days && Array.isArray(bookingData.pickup_dropoff.available_days) && bookingData.pickup_dropoff.available_days.length > 0) {
      return bookingData.pickup_dropoff.available_days
    }
    // Fallback: All days available
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }, [product, bookingData])

  // Get time slots for selected day
  const timeSlots = useMemo(() => {
    // Get day name from selected date
    const getDayName = (dateStr) => {
      try {
        const [month, day, year] = dateStr.split(', ').map(s => s.trim())
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = monthNames.indexOf(month)
        if (monthIndex === -1) return null
        const date = new Date(parseInt(year), monthIndex, parseInt(day))
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return dayNames[date.getDay()]
      } catch {
        return null
      }
    }
    
    const dayName = getDayName(selectedDate)
    if (!dayName) {
      // Fallback time slots if day name cannot be determined
      return [
        '6:00 am', '7:00 am', '8:00 am', '8:30 am', '9:00 am',
        '10:30 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm',
        '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm'
      ]
    }

    // Priority 1: From product.pickup_dropoff.time_slots_by_day
    if (product?.pickup_dropoff?.time_slots_by_day && typeof product.pickup_dropoff.time_slots_by_day === 'object') {
      const slotsForDay = product.pickup_dropoff.time_slots_by_day[dayName]
      if (Array.isArray(slotsForDay) && slotsForDay.length > 0) {
        return slotsForDay.map(slot => {
          if (typeof slot === 'string') {
            // Format to "HH:MM am/pm" format
            const cleaned = slot.replace(/\s+/g, '').trim()
            if (cleaned.includes(':')) {
              const [hours, minutes] = cleaned.split(':')
              const hour = parseInt(hours) || 0
              const min = minutes || '00'
              const period = hour >= 12 ? 'pm' : 'am'
              const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
              return `${displayHour}:${min} ${period}`
            }
            return cleaned
          }
          return slot
        }).filter(Boolean)
      }
    }
    // Priority 2: From bookingData.timeSlotsByDay
    if (bookingData.timeSlotsByDay && typeof bookingData.timeSlotsByDay === 'object') {
      const slotsForDay = bookingData.timeSlotsByDay[dayName]
      if (Array.isArray(slotsForDay) && slotsForDay.length > 0) {
        return slotsForDay.map(slot => {
          if (typeof slot === 'string') {
            const cleaned = slot.replace(/\s+/g, '').trim()
            if (cleaned.includes(':')) {
              const [hours, minutes] = cleaned.split(':')
              const hour = parseInt(hours) || 0
              const min = minutes || '00'
              const period = hour >= 12 ? 'pm' : 'am'
              const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
              return `${displayHour}:${min} ${period}`
            }
            return cleaned
          }
          return slot
        }).filter(Boolean)
      }
    }
    // Priority 3: From bookingData.pickup_dropoff.time_slots_by_day
    if (bookingData.pickup_dropoff?.time_slots_by_day && typeof bookingData.pickup_dropoff.time_slots_by_day === 'object') {
      const slotsForDay = bookingData.pickup_dropoff.time_slots_by_day[dayName]
      if (Array.isArray(slotsForDay) && slotsForDay.length > 0) {
        return slotsForDay.map(slot => {
          if (typeof slot === 'string') {
            const cleaned = slot.replace(/\s+/g, '').trim()
            if (cleaned.includes(':')) {
              const [hours, minutes] = cleaned.split(':')
              const hour = parseInt(hours) || 0
              const min = minutes || '00'
              const period = hour >= 12 ? 'pm' : 'am'
              const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
              return `${displayHour}:${min} ${period}`
            }
            return cleaned
          }
          return slot
        }).filter(Boolean)
      }
    }
    // Fallback: Default time slots
    return [
      '6:00 am', '7:00 am', '8:00 am', '8:30 am', '9:00 am',
      '10:30 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm',
      '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm'
    ]
  }, [product, bookingData, selectedDate])

  // Get selected vehicle
  const selectedVehicle = useMemo(() => {
    // First try to get from product vehicles based on selectedVehicleIndex
    if (product && Array.isArray(product.vehicles) && selectedVehicleIndex !== null && selectedVehicleIndex < product.vehicles.length) {
      return product.vehicles[selectedVehicleIndex] || null
    }
    // Fallback to bookingData.selectedVehicle if available
    if (bookingData.selectedVehicle) {
      return bookingData.selectedVehicle
    }
    return null
  }, [product, selectedVehicleIndex, bookingData.selectedVehicle])

  // Get meeting points for selected vehicle
  const selectedVehicleMeetingPoints = useMemo(() => {
    // First check if we have meeting points from bookingData
    if (Array.isArray(bookingData.selectedVehicleMeetingPoints) && bookingData.selectedVehicleMeetingPoints.length > 0) {
      return bookingData.selectedVehicleMeetingPoints
    }
    
    if (!selectedVehicle || !product) return []
    
    // Try to get meeting points from pickup_configurations
    if (product?.pickup_dropoff?.pickup_configurations && Array.isArray(product.pickup_dropoff.pickup_configurations)) {
      const configs = product.pickup_dropoff.pickup_configurations
      const vehicleId = selectedVehicle.id || selectedVehicle._id
      const vehicleTitle = selectedVehicle.title || selectedVehicle.model
      
      const matched = configs.filter((config) => {
        // Match by vehicle_id
        if (config.vehicle_id && vehicleId && String(config.vehicle_id) === String(vehicleId)) {
          return true
        }
        // Match by vehicle.id
        if (config.vehicle?.id && vehicleId && String(config.vehicle.id) === String(vehicleId)) {
          return true
        }
        // Match by vehicle._id
        if (config.vehicle?._id && vehicleId && String(config.vehicle._id) === String(vehicleId)) {
          return true
        }
        // Match by title/model
        if (vehicleTitle && config.vehicle) {
          const configTitle = config.vehicle.title || config.vehicle.model
          if (configTitle && String(configTitle).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
            return true
          }
        }
        // Match by vehicle_id as title (string match)
        if (vehicleTitle && config.vehicle_id && typeof config.vehicle_id === 'string') {
          if (String(config.vehicle_id).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
            return true
          }
        }
        return false
      })
      
      if (matched.length > 0) {
        // Extract unique pickup locations from configurations
        const locationsMap = new Map()
        matched.forEach(config => {
          if (config.pickup_location) {
            const locs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean)
            locs.forEach(loc => {
              const locationKey = loc.toLowerCase()
              if (!locationsMap.has(locationKey)) {
                locationsMap.set(locationKey, {
                  name: loc,
                  time: config.pickup_time || null,
                  address: config.pickup_location
                })
              }
            })
          }
        })
        return Array.from(locationsMap.values())
      }
    }
    
    // Fallback to product pickup_locations if no vehicle-specific configs
    if (Array.isArray(product?.pickup_dropoff?.pickup_locations) && product.pickup_dropoff.pickup_locations.length > 0) {
      return product.pickup_dropoff.pickup_locations.map(loc => ({
        name: typeof loc === 'string' ? loc : (loc.name || loc),
        time: null,
        address: typeof loc === 'string' ? loc : (loc.address || loc)
      }))
    }
    
    // Final fallback to product.meetingPoints
    if (Array.isArray(product?.meetingPoints) && product.meetingPoints.length > 0) {
      return product.meetingPoints.map(loc => ({
        name: typeof loc === 'string' ? loc : (loc.name || loc),
        time: null,
        address: typeof loc === 'string' ? loc : (loc.address || loc)
      }))
    }
    
    return []
  }, [selectedVehicle, product, bookingData.selectedVehicleMeetingPoints])

  // Get selected meeting point
  const selectedMeetingPoint = useMemo(() => {
    // First try to get from selectedVehicleMeetingPoints based on selectedMeetingPointIndex
    if (selectedMeetingPointIndex !== null && Array.isArray(selectedVehicleMeetingPoints) && selectedMeetingPointIndex < selectedVehicleMeetingPoints.length) {
      return selectedVehicleMeetingPoints[selectedMeetingPointIndex] || null
    }
    // Fallback to bookingData.selectedMeetingPoint if available
    if (bookingData.selectedMeetingPoint) {
      return bookingData.selectedMeetingPoint
    }
    return null
  }, [selectedMeetingPointIndex, selectedVehicleMeetingPoints, bookingData.selectedMeetingPoint])

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

  // Check if a date is available (falls on an available day)
  const isDateAvailable = (dayObj) => {
    if (!dayObj || !dayObj.isCurrentMonth) return false
    try {
      const [month, day, year] = formatDate(dayObj.day).split(', ').map(s => s.trim())
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthIndex = monthNames.indexOf(month)
      if (monthIndex === -1) return true // If can't parse, allow selection
      const date = new Date(parseInt(year), monthIndex, parseInt(day))
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayName = dayNames[date.getDay()]
      return availableDays.includes(dayName)
    } catch {
      return true // If error parsing, allow selection
    }
  }

  const handleDateClick = (dayObj) => {
    if (!dayObj || !dayObj.isCurrentMonth) return
    if (!isDateAvailable(dayObj)) return // Don't allow selection of unavailable days
    const formatted = formatDate(dayObj.day)
    setSelectedDate(formatted)
    setShowCalendar(false)
    // Reset selected time when date changes (time slots may be different)
    if (timeSlots.length > 0) {
      setSelectedTime(timeSlots[0])
    }
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
        selectedVehicleIndex,
        selectedVehicle,
        selectedMeetingPointIndex,
        selectedMeetingPoint,
        selectedVehicleMeetingPoints,
        bookingData: {
          ...bookingData,
          selectedVehicleIndex,
          selectedVehicle,
          selectedMeetingPointIndex,
          selectedMeetingPoint,
          selectedVehicleMeetingPoints
        }
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
                    {getDaysInMonth(currentMonth).map((dayObj, idx) => {
                      const isAvailable = isDateAvailable(dayObj)
                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(dayObj)}
                          disabled={!dayObj.isCurrentMonth || !isAvailable}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition ${
                            !dayObj.isCurrentMonth
                              ? 'text-gray-300 cursor-not-allowed'
                              : !isAvailable
                              ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                              : isDateSelected(dayObj)
                              ? 'text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          style={isDateSelected(dayObj) ? { backgroundColor: '#1d236b' } : {}}
                          title={!isAvailable && dayObj.isCurrentMonth ? 'Not available on this day' : ''}
                        >
                          {dayObj.day}
                        </button>
                      )
                    })}
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
            <div className="mb-6">
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

            {/* Vehicle Selection */}
            {product && Array.isArray(product.vehicles) && product.vehicles.length > 0 && (
              <div className="mb-6" data-vehicle-dropdown>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Select Vehicle</label>
                <div className="relative">
                  <div 
                    className="cursor-pointer border border-gray-300 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-400 transition"
                    onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                  >
                    <FaCar className="w-5 h-5 text-gray-500" />
                    <span className="flex-1 text-gray-700">
                      {selectedVehicle 
                        ? `${selectedVehicle.title || selectedVehicle.model || 'Vehicle'} ${selectedVehicle.year ? `(${selectedVehicle.year})` : ''}`
                        : 'Select a vehicle'}
                    </span>
                    <FiChevronDown className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  {/* Vehicle Dropdown */}
                  {showVehicleDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {product.vehicles.map((vehicle, idx) => {
                        const isSelected = selectedVehicleIndex === idx
                        return (
                          <div 
                            key={idx}
                            className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedVehicleIndex(idx)
                              setShowVehicleDropdown(false)
                            }}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-gray-300' : 'border-gray-300'
                            }`} style={isSelected ? { backgroundColor: '#1d236b', borderColor: '#1d236b' } : {}}>
                              {isSelected && (
                                <FaCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FaCar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 font-medium">
                                  {vehicle.title || vehicle.model || 'Vehicle'} {vehicle.year ? `(${vehicle.year})` : ''}
                                </span>
                              </div>
                              {vehicle.capacity && (
                                <span className="text-sm text-gray-500">Up to {vehicle.capacity} passengers</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meeting Point Selection */}
            {selectedVehicle && selectedVehicleMeetingPoints.length > 0 && (
              <div className="mb-6" data-meeting-point-dropdown>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Select Pickup Location</label>
                <div className="relative">
                  <div 
                    className="cursor-pointer border border-gray-300 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-400 transition"
                    onClick={() => setShowMeetingPointDropdown(!showMeetingPointDropdown)}
                  >
                    <FiMapPin className="w-5 h-5 text-gray-500" />
                    <span className="flex-1 text-gray-700">
                      {selectedMeetingPoint
                        ? (typeof selectedMeetingPoint === 'string' ? selectedMeetingPoint : (selectedMeetingPoint.name || 'Pickup Location'))
                        : 'Select a pickup location'}
                    </span>
                    <FiChevronDown className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  {/* Meeting Point Dropdown */}
                  {showMeetingPointDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {selectedVehicleMeetingPoints.map((loc, idx) => {
                        const isSelected = selectedMeetingPointIndex === idx
                        const locationName = typeof loc === 'string' ? loc : (loc.name || loc || 'Pickup Location')
                        const address = typeof loc === 'object' ? (loc.address || '') : ''
                        const time = typeof loc === 'object' && loc.time ? loc.time : null
                        
                        return (
                          <div 
                            key={idx}
                            className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedMeetingPointIndex(idx)
                              setShowMeetingPointDropdown(false)
                            }}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-gray-300' : 'border-gray-300'
                            }`} style={isSelected ? { backgroundColor: '#1d236b', borderColor: '#1d236b' } : {}}>
                              {isSelected && (
                                <FaCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FiMapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 font-medium">{locationName}</span>
                              </div>
                              {address && address !== locationName && (
                                <span className="text-sm text-gray-500">{address}</span>
                              )}
                              {time && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FiClock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
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
              {(selectedVehicle || bookingData.selectedVehicle) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Vehicle:</span>
                  <span className="text-gray-900 font-semibold">
                    {(selectedVehicle || bookingData.selectedVehicle)?.title || 
                     (selectedVehicle || bookingData.selectedVehicle)?.model || 
                     'Vehicle'} 
                    {(selectedVehicle || bookingData.selectedVehicle)?.year ? `(${(selectedVehicle || bookingData.selectedVehicle).year})` : ''}
                  </span>
                </div>
              )}
              {(selectedMeetingPoint || bookingData.selectedMeetingPoint) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Pickup Location:</span>
                  <span className="text-gray-900 font-semibold text-right">
                    {(() => {
                      const meetingPoint = selectedMeetingPoint || bookingData.selectedMeetingPoint
                      if (!meetingPoint) return 'Pickup Location'
                      return typeof meetingPoint === 'string' 
                        ? meetingPoint 
                        : (meetingPoint.name || 'Pickup Location')
                    })()}
                  </span>
                </div>
              )}
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
