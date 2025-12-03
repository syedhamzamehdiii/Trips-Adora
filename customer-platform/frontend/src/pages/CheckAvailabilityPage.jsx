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
  const stateData = location.state || {}
  // Extract bookingData (might be nested or at root level)
  const bookingData = stateData.bookingData || stateData || {}
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  // Travel date shown in UI – initialize from state if available
  const [selectedDate, setSelectedDate] = useState(stateData.selectedDate || bookingData.selectedDate || 'Oct, 17, 2025')
  // Earliest date the customer can travel (derived from supplier pickup date)
  const [earliestPickupDate, setEarliestPickupDate] = useState(null)

  // Helper: parse supplier pickup date strings like "23 Dec" or "23 Dec 2025"
  const parseSupplierPickupDate = (rawDate) => {
    if (!rawDate) return null

    // Already a valid Date
    if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
      return rawDate
    }

    if (typeof rawDate === 'string') {
      const trimmed = rawDate.trim()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthMap = monthNames.reduce((acc, m, idx) => {
        acc[m.toLowerCase()] = idx
        return acc
      }, {})

      // Patterns: "23 Dec", "23 Dec 2025", "Dec 23", "Dec 23 2025"
      let day = null
      let monthName = null
      let year = null

      let match = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s*,?\s*(\d{4})?$/)
      if (match) {
        day = parseInt(match[1], 10)
        monthName = match[2]
        year = match[3] ? parseInt(match[3], 10) : null
      } else {
        match = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})\s*,?\s*(\d{4})?$/)
        if (match) {
          monthName = match[1]
          day = parseInt(match[2], 10)
          year = match[3] ? parseInt(match[3], 10) : null
        }
      }

      if (day !== null && monthName) {
        const monthIndex = monthMap[monthName.toLowerCase()]
        if (monthIndex !== undefined) {
          let resolvedYear = year || today.getFullYear()
          let candidate = new Date(resolvedYear, monthIndex, day)

          // If candidate ended up in the distant past, bump to next year
          if (candidate < today) {
            candidate = new Date(resolvedYear + 1, monthIndex, day)
          }

          if (!Number.isNaN(candidate.getTime())) {
            return candidate
          }
        }
      }

      // Fallback: let Date try to parse, but normalize obviously wrong years
      const fallback = new Date(trimmed)
      if (!Number.isNaN(fallback.getTime())) {
        const yr = fallback.getFullYear()
        if (yr < 2000 || yr > 2100) {
          // Replace with current year
          const m = fallback.getMonth()
          const d = fallback.getDate()
          const candidate = new Date(today.getFullYear(), m, d)
          return candidate
        }
        return fallback
      }
    }

    return null
  }
  const [selectedTime, setSelectedTime] = useState(stateData.selectedTime || bookingData.selectedTime || '10:30 AM')
  const [selectedPersons, setSelectedPersons] = useState(stateData.selectedPersons || bookingData.selectedPersons || 3)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  // Extra vehicles added when group size exceeds capacity - restore from state
  const restoredExtraVehicles = Array.isArray(stateData.extraVehicles) ? stateData.extraVehicles : 
    (Array.isArray(bookingData.extraVehicles) ? bookingData.extraVehicles : [])
  const [extraVehicles, setExtraVehicles] = useState(restoredExtraVehicles)
  // When true, user has chosen to use multiple vehicles to handle larger groups
  const [allowMultipleVehicles, setAllowMultipleVehicles] = useState(
    restoredExtraVehicles.length > 0 || stateData.allowMultipleVehicles || bookingData.allowMultipleVehicles || false
  )
  // Shown when user exceeds current vehicle capacity – offers Change Vehicle / Add Another Vehicle
  const [showCapacityModal, setShowCapacityModal] = useState(false)
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [modalSelectedVehicleIndex, setModalSelectedVehicleIndex] = useState(null)
  const [modalSelectedPickup, setModalSelectedPickup] = useState('')
  
  // Vehicle and meeting point selection - restore from state
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(
    stateData.selectedVehicleIndex !== undefined ? stateData.selectedVehicleIndex :
    (bookingData.selectedVehicleIndex !== undefined ? bookingData.selectedVehicleIndex : null)
  )
  const [selectedMeetingPointIndex, setSelectedMeetingPointIndex] = useState(
    stateData.selectedMeetingPointIndex !== undefined ? stateData.selectedMeetingPointIndex :
    (bookingData.selectedMeetingPointIndex !== undefined ? bookingData.selectedMeetingPointIndex : null)
  )
  const [selectedDropoffLocationIndex, setSelectedDropoffLocationIndex] = useState(
    stateData.selectedDropoffLocationIndex !== undefined ? stateData.selectedDropoffLocationIndex :
    (bookingData.selectedDropoffLocationIndex !== undefined ? bookingData.selectedDropoffLocationIndex : null)
  )
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)
  const [showMeetingPointDropdown, setShowMeetingPointDropdown] = useState(false)
  const [showDropoffLocationDropdown, setShowDropoffLocationDropdown] = useState(false)

  // Fetch product data if productId is available
  useEffect(() => {
    const fetchProduct = async () => {
      const productId = stateData.productId || bookingData.productId
      if (productId) {
        setLoading(true)
        try {
          const productData = await getProductById(productId, true)
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
  }, [stateData.productId, bookingData.productId])

  // Filter vehicles to only show those linked in pickup_configurations (prevents duplicates)
  const vehiclesForDisplay = useMemo(() => {
    const rawVehicles = Array.isArray(product?.vehicles) ? product.vehicles : []
    if (!rawVehicles.length) return []

    const configs = product?.pickup_dropoff?.pickup_configurations
    if (!Array.isArray(configs) || configs.length === 0) {
      // No configs – show all vehicles as-is
      return rawVehicles
    }

    const linkedIds = new Set(
      configs
        .map((c) => c?.vehicle?.id || c?.vehicle?._id || c?.vehicle_id)
        .filter(Boolean)
        .map((id) => String(id))
    )

    if (linkedIds.size > 0) {
      return rawVehicles.filter((v) => {
        const id = v?.id || v?._id
        return id && linkedIds.has(String(id))
      })
    }

    return rawVehicles
  }, [product?.vehicles, product?.pickup_dropoff?.pickup_configurations])

  // Get pickup configurations for selected vehicle (subset of pickup_configurations)
  const selectedVehiclePickupConfigs = useMemo(() => {
    if (!product?.pickup_dropoff?.pickup_configurations || selectedVehicleIndex === null) {
      return []
    }

    const configs = product.pickup_dropoff.pickup_configurations
    if (!Array.isArray(configs) || configs.length === 0) return []

    const vehicle =
      (vehiclesForDisplay && Array.isArray(vehiclesForDisplay) && vehiclesForDisplay[selectedVehicleIndex]) ||
      bookingData.selectedVehicle ||
      null

    if (!vehicle) return []

    const vehicleId = vehicle.id || vehicle._id
    const vehicleTitle = vehicle.title || vehicle.model
    const vehicleModel = vehicle.model || vehicle.title

    return configs.filter((config) => {
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
      // Match by title/model on vehicle object
      if (config.vehicle && (vehicleTitle || vehicleModel)) {
        const configTitle = config.vehicle.title || config.vehicle.model
        const configModel = config.vehicle.model || config.vehicle.title
        if (configTitle && vehicleTitle && String(configTitle).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
          return true
        }
        if (configModel && vehicleModel && String(configModel).toLowerCase().trim() === String(vehicleModel).toLowerCase().trim()) {
          return true
        }
      }
      // Match by vehicle_id used as title/string
      if (vehicleTitle && typeof config.vehicle_id === 'string') {
        if (String(config.vehicle_id).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
          return true
        }
      }
      return false
    })
  }, [product?.pickup_dropoff?.pickup_configurations, vehiclesForDisplay, selectedVehicleIndex, bookingData.selectedVehicle])

  // Initialize travel date from:
  // 1) bookingData.selectedDate (if user is coming back)
  // 2) pickup_date for the selected vehicle (from pickup_configurations)
  // 3) fallback to first pickup_configurations entry if no vehicle match
  useEffect(() => {
    // If a date was already chosen earlier in the flow, respect it
    if (bookingData.selectedDate) {
      setSelectedDate(bookingData.selectedDate)
      try {
        const [month, day, year] = bookingData.selectedDate.split(', ').map(s => s.trim())
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = monthNames.indexOf(month)
        if (monthIndex !== -1) {
          setCurrentMonth(new Date(parseInt(year), monthIndex, 1))
        }
      } catch {
        // Ignore parsing errors – keep currentMonth as is
      }
      return
    }

    const allConfigs = Array.isArray(product?.pickup_dropoff?.pickup_configurations)
      ? product.pickup_dropoff.pickup_configurations
      : []

    let sourceConfig = null
    if (selectedVehiclePickupConfigs.length > 0) {
      sourceConfig = selectedVehiclePickupConfigs[0]
    } else if (allConfigs.length > 0) {
      sourceConfig = allConfigs[0]
    }

    if (sourceConfig) {
      const rawDate =
        sourceConfig.pickup_date ||
        sourceConfig.date ||
        sourceConfig.pickup_datetime ||
        null

      const parsed = parseSupplierPickupDate(rawDate)
      if (parsed && !Number.isNaN(parsed.getTime())) {
        // Store normalized earliest pickup date (midnight) for availability checks
        const normalized = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
        setEarliestPickupDate(normalized)

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const formatted = `${monthNames[parsed.getMonth()]}, ${parsed.getDate()}, ${parsed.getFullYear()}`
        setSelectedDate(formatted)
        setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
      }
    }
  }, [product, bookingData.selectedDate, selectedVehiclePickupConfigs])

  // Initialize vehicle selection when product loads
  useEffect(() => {
    if (vehiclesForDisplay && Array.isArray(vehiclesForDisplay) && vehiclesForDisplay.length > 0) {
      // Only set default if no valid selection exists from bookingData
      if (selectedVehicleIndex === null || selectedVehicleIndex >= vehiclesForDisplay.length) {
        // Check if bookingData has a valid selection
        if (bookingData.selectedVehicleIndex !== undefined && 
            bookingData.selectedVehicleIndex !== null &&
            bookingData.selectedVehicleIndex < vehiclesForDisplay.length) {
          setSelectedVehicleIndex(bookingData.selectedVehicleIndex)
        } else {
          // Default to first vehicle only if no selection from bookingData
          setSelectedVehicleIndex(0)
        }
      }
    } else {
      setSelectedVehicleIndex(null)
    }
  }, [vehiclesForDisplay]) // Remove bookingData.selectedVehicleIndex from dependencies to avoid overriding

  // Initialize meeting point selection when vehicle is set
  useEffect(() => {
    if (selectedVehicleIndex !== null && bookingData.selectedMeetingPointIndex !== undefined && bookingData.selectedMeetingPointIndex !== null) {
      // Only set if we have meeting points available (will be checked in the meeting points useMemo)
      setSelectedMeetingPointIndex(bookingData.selectedMeetingPointIndex)
    }
  }, [selectedVehicleIndex, bookingData.selectedMeetingPointIndex])

  // Reset meeting point and dropoff location when vehicle changes
  useEffect(() => {
    setSelectedMeetingPointIndex(null)
    setSelectedDropoffLocationIndex(null)
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
    // First try to get from filtered vehicles based on selectedVehicleIndex
    if (vehiclesForDisplay && Array.isArray(vehiclesForDisplay) && selectedVehicleIndex !== null && selectedVehicleIndex < vehiclesForDisplay.length) {
      return vehiclesForDisplay[selectedVehicleIndex] || null
    }
    // Fallback to bookingData.selectedVehicle if available
    if (bookingData.selectedVehicle) {
      return bookingData.selectedVehicle
    }
    return null
  }, [vehiclesForDisplay, selectedVehicleIndex, bookingData.selectedVehicle])

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

  // Get dropoff locations for selected vehicle
  const selectedVehicleDropoffLocations = useMemo(() => {
    if (!selectedVehicle || !product) return []
    
    // Priority 1: From pickup_configurations for selected vehicle
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
        return false
      })
      
      if (matched.length > 0) {
        const locationsMap = new Map()
        const pickupLocations = new Set()
        
        // First, collect pickup locations to compare
        matched.forEach(config => {
          if (config.pickup_location) {
            const locs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean)
            locs.forEach(loc => pickupLocations.add(loc.toLowerCase()))
          }
        })
        
        // Then, collect dropoff locations (only if different from pickup)
        matched.forEach(config => {
          if (config.dropoff_location) {
            const dropoffLocs = config.dropoff_location.split(',').map(l => l.trim()).filter(Boolean)
            dropoffLocs.forEach(loc => {
              const locationKey = loc.toLowerCase()
              // Only add if different from pickup locations
              if (!pickupLocations.has(locationKey) && !locationsMap.has(locationKey)) {
                locationsMap.set(locationKey, {
                  name: loc,
                  time: config.pickup_time || null,
                  address: config.dropoff_location,
                  isSameAsPickup: false
                })
              }
            })
          }
        })
        
        const dropoffLocs = Array.from(locationsMap.values())
        
        // If no separate dropoff locations found, add pickup locations as dropoff (same as pickup)
        if (dropoffLocs.length === 0 && pickupLocations.size > 0) {
          matched.forEach(config => {
            if (config.pickup_location) {
              const locs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean)
              locs.forEach(loc => {
                const locationKey = loc.toLowerCase()
                if (!locationsMap.has(locationKey)) {
                  locationsMap.set(locationKey, {
                    name: loc,
                    time: config.pickup_time || null,
                    address: config.pickup_location,
                    isSameAsPickup: true
                  })
                }
              })
            }
          })
          return Array.from(locationsMap.values())
        }
        
        return dropoffLocs
      }
    }
    
    // Priority 2: From dropoff_locations array
    if (Array.isArray(product?.pickup_dropoff?.dropoff_locations) && product.pickup_dropoff.dropoff_locations.length > 0) {
      const pickupLocs = new Set()
      if (Array.isArray(product?.pickup_dropoff?.pickup_locations)) {
        product.pickup_dropoff.pickup_locations.forEach(loc => {
          const locName = typeof loc === 'string' ? loc : (loc.name || loc)
          pickupLocs.add(locName.toLowerCase())
        })
      }
      
      const dropoffLocs = product.pickup_dropoff.dropoff_locations
        .map(loc => {
          const locName = typeof loc === 'string' ? loc : (loc.name || loc)
          return {
            name: locName,
            time: null,
            address: typeof loc === 'string' ? loc : (loc.address || loc),
            isSameAsPickup: pickupLocs.has(locName.toLowerCase())
          }
        })
        .filter(loc => !loc.isSameAsPickup || pickupLocs.size === 0) // Only show if different, or if no pickup locations exist
      
      // If all dropoffs are same as pickup, show pickup locations as dropoff
      if (dropoffLocs.length === 0 && Array.isArray(product?.pickup_dropoff?.pickup_locations) && product.pickup_dropoff.pickup_locations.length > 0) {
        return product.pickup_dropoff.pickup_locations.map(loc => ({
          name: typeof loc === 'string' ? loc : (loc.name || loc),
          time: null,
          address: typeof loc === 'string' ? loc : (loc.address || loc),
          isSameAsPickup: true
        }))
      }
      
      return dropoffLocs
    }
    
    // Priority 3: If no dropoff locations, use pickup locations (same as pickup)
    if (Array.isArray(product?.pickup_dropoff?.pickup_locations) && product.pickup_dropoff.pickup_locations.length > 0) {
      return product.pickup_dropoff.pickup_locations.map(loc => ({
        name: typeof loc === 'string' ? loc : (loc.name || loc),
        time: null,
        address: typeof loc === 'string' ? loc : (loc.address || loc),
        isSameAsPickup: true
      }))
    }
    
    return []
  }, [selectedVehicle, product, selectedVehicleMeetingPoints])

  // Get selected dropoff location
  const selectedDropoffLocation = useMemo(() => {
    if (selectedDropoffLocationIndex !== null && Array.isArray(selectedVehicleDropoffLocations) && selectedDropoffLocationIndex < selectedVehicleDropoffLocations.length) {
      return selectedVehicleDropoffLocations[selectedDropoffLocationIndex] || null
    }
    // Fallback to bookingData.selectedDropoffLocation if available
    if (bookingData.selectedDropoffLocation) {
      return bookingData.selectedDropoffLocation
    }
    // Default to first dropoff location if available
    if (selectedVehicleDropoffLocations.length > 0) {
      return selectedVehicleDropoffLocations[0]
    }
    return null
  }, [selectedDropoffLocationIndex, selectedVehicleDropoffLocations, bookingData.selectedDropoffLocation])

  const handlePersonChange = (delta) => {
    setSelectedPersons(prev => {
      const current = prev || 1
      let next = current + delta
      if (next < 1) {
        next = 1
      }

      // Capacity for the primary (currently selected) vehicle
      const primaryCapacity =
        selectedVehicle?.capacity ||
        bookingData.selectedVehicle?.capacity ||
        null

      // Capacity contributed by extra vehicles that have been added
      const extraCaps = extraVehicles.map(ev =>
        typeof ev.vehicle?.capacity === 'number' ? ev.vehicle.capacity : 0
      )
      const extraCapacity = extraCaps.reduce((sum, cap) => sum + cap, 0)
      const totalCapacity = (primaryCapacity || 0) + extraCapacity

      // If increasing and we know a total capacity, don't let the count exceed it.
      // Instead, clamp and prompt the user with the right modal.
      if (delta > 0 && totalCapacity > 0 && next > totalCapacity) {
        next = totalCapacity

        if (allowMultipleVehicles) {
          // User already chose to use multiple vehicles earlier:
          // jump straight to the "Add another vehicle" modal with only NEW vehicles.
          setModalSelectedVehicleIndex(null)
          setModalSelectedPickup('')
          setShowAddVehicleModal(true)
        } else {
          // First time hitting the limit – show the capacity modal with
          // "Change Vehicle" / "Add Another Vehicle" options.
          setShowCapacityModal(true)
        }
      }

      // If decreasing, drop extra vehicles that are no longer needed
      if (delta < 0 && primaryCapacity) {
        let remaining = next
        // First fill primary vehicle
        remaining -= primaryCapacity
        let neededExtras = 0
        for (let i = 0; i < extraCaps.length; i++) {
          if (remaining > 0) {
            remaining -= extraCaps[i]
            neededExtras += 1
          } else {
            break
          }
        }
        // Trim extras beyond what is needed to cover the new passenger count
        setExtraVehicles(prevExtras => prevExtras.slice(0, neededExtras))
      }

      return next
    })
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

  // Check if a date is available:
  // 1) Must be on or AFTER the supplier pickup start date (earliestPickupDate), if defined
  // 2) Weekends are now also selectable – we no longer restrict by availableDays
  const isDateAvailable = (dayObj) => {
    if (!dayObj || !dayObj.isCurrentMonth) return false
    try {
      const [month, day, year] = formatDate(dayObj.day).split(', ').map(s => s.trim())
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthIndex = monthNames.indexOf(month)
      if (monthIndex === -1) return true // If can't parse, allow selection
      const date = new Date(parseInt(year), monthIndex, parseInt(day))

      // Rule: cannot book before earliestPickupDate (e.g. pickup date 18 Dec → only 18+ allowed)
      if (earliestPickupDate instanceof Date && !Number.isNaN(earliestPickupDate.getTime())) {
        // Normalize both dates to midnight for comparison
        const normalizedCandidate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        if (normalizedCandidate < earliestPickupDate) {
          return false
        }
      }
      
      // All days (weekdays + weekends) are selectable after earliestPickupDate
      return true
    } catch {
      return true // If error parsing, allow selection
    }
  }

  // Helper: get vehicle identifier consistently (returns ID if available, otherwise index-based key)
  // Since vehicles may not have IDs, we'll use the index in vehiclesForDisplay array as fallback
  const getVehicleIdentifier = (v, index) => {
    if (!v) return null
    const id = v.id || v._id
    if (id) return String(id)
    // Fallback: use index if provided (for vehicles in vehiclesForDisplay array)
    if (index !== undefined && index !== null) return `index_${index}`
    return null
  }

  // Helper: get pickup options for a specific vehicle (used in "Add another vehicle" modal)
  const getPickupOptionsForVehicle = (vehicle) => {
    if (!vehicle || !product) return []

    const options = new Set()

    // Prefer pickup_configurations matching this vehicle
    if (product?.pickup_dropoff?.pickup_configurations && Array.isArray(product.pickup_dropoff.pickup_configurations)) {
      const configs = product.pickup_dropoff.pickup_configurations
      const vehicleId = vehicle.id || vehicle._id
      const vehicleTitle = vehicle.title || vehicle.model

      configs.forEach((config) => {
        let matches = false
        if (config.vehicle_id && vehicleId && String(config.vehicle_id) === String(vehicleId)) {
          matches = true
        } else if (config.vehicle?.id && vehicleId && String(config.vehicle.id) === String(vehicleId)) {
          matches = true
        } else if (config.vehicle?._id && vehicleId && String(config.vehicle._id) === String(vehicleId)) {
          matches = true
        } else if (vehicleTitle && config.vehicle) {
          const configTitle = config.vehicle.title || config.vehicle.model
          if (configTitle && String(configTitle).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
            matches = true
          }
        }

        if (matches && config.pickup_location) {
          config.pickup_location
            .split(',')
            .map(l => l.trim())
            .filter(Boolean)
            .forEach(loc => options.add(loc))
        }
      })
    }

    // Fallback to general pickup locations
    if (options.size === 0 && Array.isArray(product?.pickup_dropoff?.pickup_locations)) {
      product.pickup_dropoff.pickup_locations.forEach(loc => {
        if (typeof loc === 'string') {
          options.add(loc)
        } else if (loc?.name) {
          options.add(loc.name)
        }
      })
    }

    return Array.from(options)
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
    // Enforce capacity constraint unless user explicitly chooses multiple vehicles
    const maxCapacity =
      selectedVehicle?.capacity ||
      bookingData.selectedVehicle?.capacity ||
      null

    if (maxCapacity && selectedPersons > maxCapacity && !allowMultipleVehicles) {
      alert(`This vehicle can take a maximum of ${maxCapacity} travelers. Please choose another vehicle or add another vehicle to continue.`)
      return
    }

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
        selectedDropoffLocationIndex,
        selectedDropoffLocation,
        // Extra vehicles selected when using multiple vehicles
        extraVehicles,
        // Preserve extras and special requirements if coming back from step 2
        extras: stateData.extras,
        specialRequirements: stateData.specialRequirements,
        bookingData: {
          ...bookingData,
          selectedVehicleIndex,
          selectedVehicle,
          selectedMeetingPointIndex,
          selectedMeetingPoint,
          selectedVehicleMeetingPoints,
          selectedDropoffLocationIndex,
          selectedDropoffLocation
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
          <button
            type="button"
            onClick={() => {
              // If we came from cart, go back to cart
              if (bookingData.from === 'cart') {
                navigate('/cart')
              } else if (bookingData.from === 'product-details') {
                // If we came from a product page, prefer going back in history
                // so we land on the exact product (could be /tours/:slug, etc.)
                navigate(-1)
              } else {
                // Fallback: go back one step, or to home if no history
                if (window.history.length > 1) {
                  navigate(-1)
                } else {
                  navigate('/')
                }
              }
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

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

        {/* Capacity Reached Modal */}
        {showCapacityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 relative">
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCapacityModal(false)}
              >
                <span className="sr-only">Close</span>
                ×
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-2">Passenger limit reached</h3>
              <p className="text-sm text-gray-700 mb-4">
                The current vehicle cannot take more passengers. What would you like to do?
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowCapacityModal(false)
                    // Send user back to product details to choose another vehicle
                    if (bookingData.productId) {
                      if (bookingData.from === 'product-details' && window.history.length > 1) {
                        navigate(-1)
                      } else {
                        navigate(`/product-details/${bookingData.productId}`, { state: bookingData })
                      }
                    } else {
                      // Fallback: go back one step
                      if (window.history.length > 1) {
                        navigate(-1)
                      } else {
                        navigate('/')
                      }
                    }
                  }}
                >
                  Change vehicle
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg text-white"
                  style={{ backgroundColor: '#1d236b' }}
                  onClick={() => {
                    setShowCapacityModal(false)
                    setAllowMultipleVehicles(true)
                    setShowAddVehicleModal(true)
                  }}
                >
                  Add another vehicle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Another Vehicle Modal */}
        {showAddVehicleModal && product && Array.isArray(vehiclesForDisplay) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 relative">
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setShowAddVehicleModal(false)
                    setModalSelectedVehicleIndex(null)
                    setModalSelectedPickup('')
                  }}
              >
                <span className="sr-only">Close</span>
                ×
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Add another vehicle
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select an additional vehicle to accommodate more travelers. The pickup location will be the same for all vehicles.
              </p>

              {/* Vehicle list */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Select vehicle</h4>
                <div className="max-h-56 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {(() => {
                    // Collect used vehicles by both identifier and object reference
                    const usedVehicleIds = new Set()
                    const usedVehicleRefs = new Set()
                    
                    console.log('🔍 Debug - selectedVehicleIndex:', selectedVehicleIndex, 'selectedVehicle:', selectedVehicle?.title || selectedVehicle?.model, 'vehiclesForDisplay length:', vehiclesForDisplay?.length)
                    
                    // Get primary vehicle - always get from vehiclesForDisplay array to ensure correct object reference
                    let primaryVehicleFromArray = null
                    let primaryVehicleIndex = null
                    
                    // First try to get by selectedVehicleIndex
                    if (selectedVehicleIndex !== null && selectedVehicleIndex >= 0 && vehiclesForDisplay && vehiclesForDisplay[selectedVehicleIndex]) {
                      primaryVehicleFromArray = vehiclesForDisplay[selectedVehicleIndex]
                      primaryVehicleIndex = selectedVehicleIndex
                      console.log('✅ Found primary vehicle from array at index', selectedVehicleIndex, primaryVehicleFromArray.title || primaryVehicleFromArray.model)
                    } else if (selectedVehicle) {
                      // Fallback: find the vehicle in the array by object reference or by matching properties
                      const foundIndex = vehiclesForDisplay?.findIndex(v => {
                        // Try object reference first
                        if (v === selectedVehicle) return true
                        // Fallback: match by title/model/year
                        const vTitle = v.title || v.model
                        const sTitle = selectedVehicle.title || selectedVehicle.model
                        if (vTitle && sTitle && vTitle === sTitle) {
                          const vYear = v.year
                          const sYear = selectedVehicle.year
                          if (vYear && sYear && vYear === sYear) return true
                          if (!vYear && !sYear) return true
                        }
                        return false
                      })
                      
                      if (foundIndex !== -1 && foundIndex !== null && vehiclesForDisplay[foundIndex]) {
                        primaryVehicleFromArray = vehiclesForDisplay[foundIndex]
                        primaryVehicleIndex = foundIndex
                        console.log('✅ Found primary vehicle from selectedVehicle at index', foundIndex, primaryVehicleFromArray.title || primaryVehicleFromArray.model)
                      } else {
                        console.log('❌ Could not find primary vehicle in array. selectedVehicle:', selectedVehicle?.title || selectedVehicle?.model)
                      }
                    } else {
                      console.log('❌ No selectedVehicleIndex or selectedVehicle available')
                    }
                    
                    if (primaryVehicleFromArray && primaryVehicleIndex !== null) {
                      // Add by object reference (most reliable when IDs are missing)
                      usedVehicleRefs.add(primaryVehicleFromArray)
                      
                      // Also add by identifier for ID-based matching
                      const primaryId = getVehicleIdentifier(primaryVehicleFromArray, primaryVehicleIndex)
                      if (primaryId) {
                        usedVehicleIds.add(primaryId)
                      }
                      console.log('🔵 Primary vehicle added to used set:', primaryId || `index_${primaryVehicleIndex}`, primaryVehicleFromArray.title || primaryVehicleFromArray.model)
                    }
                    
                    // Add all extra vehicles (by reference and identifier)
                    extraVehicles.forEach((ev, extraIdx) => {
                      if (ev && ev.vehicle) {
                        // Add by object reference
                        usedVehicleRefs.add(ev.vehicle)
                        
                        // Also add by identifier
                        const vehicleIndex = vehiclesForDisplay.findIndex(v => v === ev.vehicle)
                        const evId = getVehicleIdentifier(ev.vehicle, vehicleIndex !== -1 ? vehicleIndex : null)
                        if (evId) {
                          usedVehicleIds.add(evId)
                        }
                        console.log(`🟢 Extra vehicle ${extraIdx + 1} added to used set:`, evId || 'by reference', ev.vehicle.title || ev.vehicle.model)
                      }
                    })

                    console.log('📋 All used vehicle IDs:', Array.from(usedVehicleIds))
                    console.log('📋 Used vehicle refs count:', usedVehicleRefs.size)

                    // Also track used indices for additional safety
                    const usedIndices = new Set()
                    if (primaryVehicleIndex !== null && primaryVehicleIndex >= 0) {
                      usedIndices.add(primaryVehicleIndex)
                      console.log('📌 Added primary vehicle index to usedIndices:', primaryVehicleIndex)
                    }
                    extraVehicles.forEach((ev) => {
                      if (ev && ev.vehicle) {
                        const evIndex = vehiclesForDisplay.findIndex(v => v === ev.vehicle)
                        if (evIndex !== -1) {
                          usedIndices.add(evIndex)
                        }
                      }
                    })

                    const availableVehicles = vehiclesForDisplay
                      .map((v, idx) => ({ vehicle: v, idx }))
                      .filter(({ vehicle, idx }) => {
                        // Check by index first (most reliable fallback)
                        if (usedIndices.has(idx)) {
                          console.log('❌ Filtering out used vehicle (by index):', idx, vehicle.title || vehicle.model)
                          return false
                        }
                        
                        // Check by object reference (should match if we got the correct reference)
                        if (usedVehicleRefs.has(vehicle)) {
                          console.log('❌ Filtering out used vehicle (by ref):', vehicle.title || vehicle.model)
                          return false
                        }
                        
                        // Also check by identifier (for ID-based matching)
                        const vehicleId = getVehicleIdentifier(vehicle, idx)
                        if (vehicleId && usedVehicleIds.has(vehicleId)) {
                          console.log('❌ Filtering out used vehicle (by ID):', vehicleId, vehicle.title || vehicle.model)
                          return false
                        }
                        
                        console.log('✅ Available vehicle:', vehicleId || `index_${idx}`, vehicle.title || vehicle.model)
                        return true
                      })

                    if (availableVehicles.length === 0) {
                      return (
                        <p className="text-xs text-gray-500 italic">
                          All available vehicles are already selected. You can adjust passengers or remove a vehicle to change the assignment.
                        </p>
                      )
                    }

                    return availableVehicles.map(({ vehicle, idx }) => {
                      const isSelected = modalSelectedVehicleIndex === idx
                      return (
                        <button
                          key={vehicle.id || vehicle._id || idx}
                          type="button"
                          onClick={() => {
                            setModalSelectedVehicleIndex(idx)
                            // Reset pickup when changing vehicle
                            setModalSelectedPickup('')
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span>
                            {vehicle.title || vehicle.model || 'Vehicle'}{' '}
                            {vehicle.year ? `(${vehicle.year})` : ''}
                          </span>
                          {vehicle.capacity && (
                            <span className="text-xs text-gray-500">
                              Max {vehicle.capacity} travelers
                            </span>
                          )}
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowAddVehicleModal(false)
                    setModalSelectedVehicleIndex(null)
                    setModalSelectedPickup('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={modalSelectedVehicleIndex === null}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#1d236b' }}
                  onClick={() => {
                    const vehicle = vehiclesForDisplay[modalSelectedVehicleIndex]
                    if (!vehicle) return

                    setExtraVehicles(prev => {
                      // Add new extra vehicle (no pickup location - uses main pickup)
                      return [...prev, { vehicle, pickupLocation: null }]
                    })

                    // Once at least one extra vehicle is added, we are in multi-vehicle mode
                    setAllowMultipleVehicles(true)
                    setShowAddVehicleModal(false)
                    setModalSelectedVehicleIndex(null)
                    setModalSelectedPickup('')
                  }}
                >
                  Add vehicle
                </button>
              </div>
            </div>
          </div>
        )}
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
              <label className="block text-lg font-semibold text-gray-900 mb-2">Choose Number Of Persons</label>
              {selectedVehicle?.capacity && (
                <p className="text-xs text-gray-500 mb-2">
                  Vehicle capacity: <span className="font-semibold">{selectedVehicle.capacity}</span> travelers per vehicle
                </p>
              )}
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

            {/* Extra vehicles summary */}
            {extraVehicles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Additional vehicles</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {extraVehicles.map((ev, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium">
                          Vehicle {idx + 2}: {ev.vehicle.title || ev.vehicle.model || 'Vehicle'}{' '}
                          {ev.vehicle.year ? `(${ev.vehicle.year})` : ''}
                        </div>
                        {ev.pickupLocation && (
                          <div className="text-xs text-gray-500">
                            Pickup: {ev.pickupLocation}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                          onClick={() => {
                            setExtraVehicles(prev => prev.filter((_, i) => i !== idx))
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vehicle Selection */}
            {product && Array.isArray(vehiclesForDisplay) && vehiclesForDisplay.length > 0 && (
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
                      {vehiclesForDisplay.map((vehicle, idx) => {
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

            {/* Dropoff Location Selection */}
            {selectedVehicle && selectedVehicleDropoffLocations.length > 0 && (
              <div className="mb-6" data-dropoff-location-dropdown>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Select Drop-off Location</label>
                <div className="relative">
                  <div 
                    className="cursor-pointer border border-gray-300 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-400 transition"
                    onClick={() => setShowDropoffLocationDropdown(!showDropoffLocationDropdown)}
                  >
                    <FiMapPin className="w-5 h-5 text-gray-500" />
                    <span className="flex-1 text-gray-700">
                      {selectedDropoffLocation
                        ? (typeof selectedDropoffLocation === 'string' 
                            ? selectedDropoffLocation 
                            : (selectedDropoffLocation.name || 'Drop-off Location'))
                        : 'Select a drop-off location'}
                    </span>
                    <FiChevronDown className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  {/* Dropoff Location Dropdown */}
                  {showDropoffLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {selectedVehicleDropoffLocations.map((loc, idx) => {
                        const isSelected = selectedDropoffLocationIndex === idx
                        const locationName = typeof loc === 'string' ? loc : (loc.name || loc || 'Drop-off Location')
                        const address = typeof loc === 'object' ? (loc.address || '') : ''
                        const time = typeof loc === 'object' && loc.time ? loc.time : null
                        const isSameAsPickup = typeof loc === 'object' && loc.isSameAsPickup
                        
                        return (
                          <div 
                            key={idx}
                            className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedDropoffLocationIndex(idx)
                              setShowDropoffLocationDropdown(false)
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
                                <span className="text-gray-700 font-medium">
                                  {locationName}
                                  {isSameAsPickup && <span className="text-xs text-gray-500 ml-2">(Same as pickup)</span>}
                                </span>
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
              
              {/* Pickup Location - Moved above vehicles */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-gray-600 font-semibold text-base">Pickup Location:</span>
                <span className="text-gray-900 font-semibold text-base text-right">
                  {(() => {
                    const meetingPoint = selectedMeetingPoint || bookingData.selectedMeetingPoint
                    if (!meetingPoint) return 'Pickup Location'
                    return typeof meetingPoint === 'string' 
                      ? meetingPoint 
                      : (meetingPoint.name || 'Pickup Location')
                  })()}
                </span>
              </div>
              
              {/* Dropoff Location */}
              {selectedDropoffLocation && (
                <div className="flex justify-between items-start mb-3">
                  <span className="text-gray-600 font-semibold text-base">Drop-off Location:</span>
                  <span className="text-gray-900 font-semibold text-base text-right">
                    {typeof selectedDropoffLocation === 'string' 
                      ? selectedDropoffLocation 
                      : (selectedDropoffLocation.name || 'Drop-off Location')}
                    {selectedDropoffLocation.isSameAsPickup && (
                      <span className="text-xs text-gray-500 ml-2">(Same as pickup)</span>
                    )}
                  </span>
                </div>
              )}
              
              {/* Vehicles and Pickup Locations */}
              <div className="space-y-3">
                {/* Primary Vehicle */}
                {(selectedVehicle || bookingData.selectedVehicle) && (
                  <div className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-gray-600 font-medium">Vehicle 1:</span>
                      <span className="text-gray-900 font-semibold text-right">
                        {(selectedVehicle || bookingData.selectedVehicle)?.title || 
                         (selectedVehicle || bookingData.selectedVehicle)?.model || 
                         'Vehicle'} 
                        {(selectedVehicle || bookingData.selectedVehicle)?.year ? `(${(selectedVehicle || bookingData.selectedVehicle).year})` : ''}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Extra Vehicles */}
                {extraVehicles.length > 0 && extraVehicles.map((ev, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-gray-600 font-medium">Vehicle {idx + 2}:</span>
                      <span className="text-gray-900 font-semibold text-right">
                        {ev.vehicle?.title || ev.vehicle?.model || 'Vehicle'} 
                        {ev.vehicle?.year ? `(${ev.vehicle.year})` : ''}
                      </span>
                    </div>
                  </div>
                ))}
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
