import React, { useCallback, useEffect, useMemo, useState } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSearch, FiFilter, FiMapPin, FiDownload, FiCalendar, FiDollarSign, FiUsers, FiChevronDown, FiTrash2 } from 'react-icons/fi'
import { getBookings, deleteBooking } from '../services/bookingService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const formatCurrencyValue = (value, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(value || 0)
  } catch (err) {
    const amount = Number(value || 0)
    if (Number.isNaN(amount)) {
      return '$0.00'
    }
    return `$${amount.toFixed(currency === 'JPY' ? 0 : 2)}`
  }
}

const formatDateDisplay = (value) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (err) {
    return value
  }
}

const normalizeBooking = (booking = {}) => {
  const status = (booking.status || '').toLowerCase() || 'pending'
  const startDate = booking.startDate || booking.start_date
  return {
    ...booking,
    id: booking.id || booking.bookingId || booking.booking_id || '',
    bookingId: booking.bookingId || booking.booking_id || booking.id || '',
    tourName: booking.tourName || booking.title || booking.destination || booking.location || 'Upcoming Trip',
    location: booking.location || booking.destination || '',
    image: booking.image || booking.heroImage || booking.thumbnail || booking.hero_image || '',
    tourDate: booking.tourDate || formatDateDisplay(startDate),
    status,
    totalAmount: typeof booking.totalAmount === 'number'
      ? booking.totalAmount
      : Number(booking.totalAmount || 0),
    currency: booking.currency || 'USD',
  }
}

const BookingsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = useMemo(
    () => localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID,
    []
  )
  const [allBookings, setAllBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingBookingId, setDeletingBookingId] = useState(null)
  
  const [filterProductName, setFilterProductName] = useState('')
  const [filterTravelDateStart, setFilterTravelDateStart] = useState('')
  const [filterPurchaseDateEnd, setFilterPurchaseDateEnd] = useState('')
  const [filterBookingId, setFilterBookingId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (location.state?.cancelledBookingId) {
      setSuccessMessage('Booking cancelled successfully.')
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBookings(userId)
      const normalized = Array.isArray(data) ? data.map(normalizeBooking) : []
      setAllBookings(normalized)
    } catch (err) {
      setError(err?.message || 'Unable to load bookings.')
      setAllBookings([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    const handleUpdated = () => fetchBookings()
    window.addEventListener('customer_bookings_updated', handleUpdated)
    return () => window.removeEventListener('customer_bookings_updated', handleUpdated)
  }, [fetchBookings])

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This will remove it from your bookings list, but it will still be visible to the supplier.')) {
      return
    }

    setDeletingBookingId(bookingId)
    try {
      await deleteBooking(userId, bookingId)
      setSuccessMessage('Booking deleted successfully.')
      fetchBookings()
      window.dispatchEvent(new CustomEvent('customer_bookings_updated'))
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      setError(err?.message || 'Failed to delete booking.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setDeletingBookingId(null)
    }
  }

  useEffect(() => {
    // Real-time filtering
    let filtered = [...allBookings]

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(b => b.status === activeFilter)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b => 
        b.tourName?.toLowerCase().includes(query) || 
        b.location?.toLowerCase().includes(query)
      )
    }

    // Apply dropdown filters
    if (filterProductName.trim()) {
      filtered = filtered.filter(b => 
        b.tourName?.toLowerCase().includes(filterProductName.toLowerCase())
      )
    }

    if (filterBookingId.trim()) {
      filtered = filtered.filter(b => 
        b.bookingId?.toLowerCase().includes(filterBookingId.toLowerCase()) ||
        b.id?.toLowerCase().includes(filterBookingId.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus)
    }
    setFilteredBookings(filtered)
  }, [allBookings, activeFilter, searchQuery, filterProductName, filterBookingId, filterStatus])

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'canceled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length
  const canceledCount = allBookings.filter(b => b.status === 'canceled').length
  const hasFilters = Boolean(
    activeFilter !== 'all' ||
    searchQuery.trim() ||
    filterProductName.trim() ||
    filterBookingId.trim() ||
    filterStatus !== 'all'
  )
  const bookingsToDisplay = hasFilters ? filteredBookings : allBookings

  return (
    <div className="bg-gray-50">
      <MainHeader />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1d236b' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg className="w-4 h-4 absolute bottom-0 right-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1d236b' }}>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <div className="w-16"></div> {/* Spacer */}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === 'all' 
                  ? 'text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={activeFilter === 'all' ? { backgroundColor: '#1d236b' } : {}}
            >
              All Bookings ({allBookings.length})
            </button>
            <button
              onClick={() => setActiveFilter('confirmed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === 'confirmed' 
                  ? 'text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={activeFilter === 'confirmed' ? { backgroundColor: '#1d236b' } : {}}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              onClick={() => setActiveFilter('canceled')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === 'canceled' 
                  ? 'text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={activeFilter === 'canceled' ? { backgroundColor: '#1d236b' } : {}}
            >
              Canceled ({canceledCount})
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Destinations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#1d236b' }}
              />
            </div>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              <FiFilter className="w-5 h-5 text-gray-700" />
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl z-20 w-96 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>
                
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Product Name</label>
                    <input
                      type="text"
                      placeholder="Enter Here"
                      value={filterProductName}
                      onChange={(e) => setFilterProductName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#1d236b' }}
                    />
                  </div>

                  {/* By Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">By Date</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Travel Date</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Start"
                            value={filterTravelDateStart}
                            onChange={(e) => setFilterTravelDateStart(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#1d236b' }}
                          />
                          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Date of Purchase</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="End"
                            value={filterPurchaseDateEnd}
                            onChange={(e) => setFilterPurchaseDateEnd(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#1d236b' }}
                          />
                          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Booking ID</label>
                    <input
                      type="text"
                      placeholder="Enter Here"
                      value={filterBookingId}
                      onChange={(e) => setFilterBookingId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#1d236b' }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white"
                        style={{ '--tw-ring-color': '#1d236b' }}
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="canceled">Canceled</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
            Loading your bookings...
          </div>
        ) : bookingsToDisplay.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h2>
            <p className="text-gray-600">Start booking tours to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingsToDisplay.map((booking) => (
              <div key={booking.id || booking.bookingId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex">
                  {/* Image */}
                  <div className="w-48 h-48 flex-shrink-0">
                    <img src={booking.image} alt={booking.tourName || booking.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6 flex">
                    {/* Left Column */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Booking ID: {booking.bookingId || booking.id}</p>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{booking.tourName || booking.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              <span>{booking.location}</span>
                            </div>
                            {booking.cancellation && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>{booking.cancellation}</span>
                              </div>
                            )}
                            {booking.travelers && (
                              <div className="flex items-center gap-1">
                                <FiUsers className="w-4 h-4" />
                                <span>{booking.travelers}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Status Badge */}
                        <span className={`${getStatusColor(booking.status)} text-white px-3 py-1 rounded-full text-sm font-semibold capitalize`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => navigate('/booking-details', { state: booking })}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => navigate('/share-review', { state: booking })}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share Your Review
                        </button>
                        <button 
                          onClick={() => handleDeleteBooking(booking.id || booking.bookingId)}
                          disabled={deletingBookingId === (booking.id || booking.bookingId)}
                          className="px-4 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete this booking from your list (supplier will still see it)"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          {deletingBookingId === (booking.id || booking.bookingId) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-40 flex flex-col items-end justify-between">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <FiCalendar className="w-4 h-4" />
                          <span className="text-sm">{booking.tourDate || booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-900">
                          <FiDollarSign className="w-5 h-5" />
                          <span className="text-2xl font-bold">
                            {formatCurrencyValue(booking.totalAmount, booking.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  )
}

export default BookingsPage
