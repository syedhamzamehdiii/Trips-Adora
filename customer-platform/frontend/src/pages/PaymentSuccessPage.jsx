import React, { useCallback, useMemo, useEffect, useState } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiDownload } from 'react-icons/fi'
import { Check } from 'lucide-react'
import { getProfile, getCachedProfileSync } from '../services/profileService'

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

const BANNER_IMAGE = '/assests/Screenshot%202025-11-03%20at%2010.27.32%20AM.png'

const PaymentSuccessPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state || {}
  const formattedAmount = useMemo(
    () => formatCurrencyValue(booking.totalAmount, booking.currency),
    [booking.totalAmount, booking.currency]
  )
  const [showPopup, setShowPopup] = useState(true)
  
  // Get customer profile for name and email
  const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID
  const [customerProfile, setCustomerProfile] = useState(() => getCachedProfileSync(userId))
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true)
        const profile = await getProfile(userId, true)
        setCustomerProfile(profile)
      } catch (err) {
        console.warn('Failed to fetch customer profile:', err)
      } finally {
        setProfileLoading(false)
      }
    }
    
    if (!customerProfile) {
      fetchProfile()
    }
  }, [userId, customerProfile])

  // Get customer name from profile
  const customerName = useMemo(() => {
    if (customerProfile?.user?.name) {
      return customerProfile.user.name
    }
    if (customerProfile?.user?.first_name || customerProfile?.user?.last_name) {
      return [customerProfile.user.first_name, customerProfile.user.last_name].filter(Boolean).join(' ').trim()
    }
    return booking.customerName || 'Guest'
  }, [customerProfile, booking.customerName])

  // Get customer email from profile (Google email)
  const customerEmail = useMemo(() => {
    return customerProfile?.user?.email || booking.customerEmail || booking.email || ''
  }, [customerProfile, booking.customerEmail, booking.email])

  // Get all vehicles from metadata
  const allVehicles = useMemo(() => {
    try {
      if (booking.metadata?.allVehicles) {
        return JSON.parse(booking.metadata.allVehicles)
      }
    } catch (err) {
      console.warn('Failed to parse vehicles from metadata:', err)
    }
    
    // Fallback: if no vehicles in metadata, use the primary vehicle
    if (booking.vehicle) {
      return [{ name: booking.vehicle, type: 'primary' }]
    }
    return []
  }, [booking.metadata, booking.vehicle])

  const handleDownloadCsv = useCallback(() => {
    const vehiclesList = allVehicles.length > 0
      ? allVehicles.map((v, idx) => `${idx + 1}. ${v.name || 'Vehicle'}`).join('; ')
      : (booking.vehicle || '')
    
    const rows = [
      ['Booking ID', booking.bookingId || booking.id || ''],
      ['Tour Name', booking.tourName || booking.title || ''],
      ['Package Type', booking.packageType || ''],
      ['Tour Date', booking.tourDate || ''],
      ['Destination', booking.destination || booking.location || ''],
      ['Total Amount', formattedAmount],
      ['Currency', booking.currency || 'USD'],
      ['Customer Name', customerName],
      ['Customer Email', customerEmail],
      ['Customer Phone', booking.customerPhone || booking.phone || ''],
      ['Travelers', booking.travelers || booking.numberOfPersons || ''],
      ['Vehicle' + (allVehicles.length > 1 ? 's' : ''), vehiclesList],
      ['Pick-up Location', booking.pickUpLocation || ''],
      ['Drop-off Location', booking.dropOffLocation || ''],
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell ?? '')
              .replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `booking-${booking.bookingId || booking.id || 'summary'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [booking, formattedAmount, customerName, customerEmail, allVehicles])

  return (
    <div className="bg-gray-50">
      <MainHeader />

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="mb-6 text-gray-600">
              Your booking has been confirmed. We've sent your details to your email.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {/* Banner Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={booking.image || BANNER_IMAGE}
          alt="Payment success banner"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 font-medium">Booking ID:</span>
                <span className="ml-2 text-gray-900 font-semibold">#{booking.bookingId || 'FUJI-2025-0184'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Tour Date:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.tourDate || 'October 22, 2025'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Tour Name:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.tourName || 'Fuji Subaru Line 5th Station Tour'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Package Type:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.packageType || 'Scenic Mountain Drive + Photo Spots'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Total Amount Paid:</span>
                <span className="ml-2 font-semibold" style={{ color: '#1d236b' }}>{formattedAmount}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Credit/Debit Card:</span>
                <span className="ml-2 text-gray-900 font-semibold"></span>
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="w-full mt-8 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              Save as CSV
            </button>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Details</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  {profileLoading ? 'Loading...' : customerName}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email Address:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  {profileLoading ? 'Loading...' : customerEmail}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Number of persons:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.travelers || booking.numberOfPersons || '3 Adults, 1 Child'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Phone Number:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.customerPhone || booking.phone || '+81 90-1234-5678'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Selected Vehicle{allVehicles.length > 1 ? 's' : ''}:</span>
                <div className="ml-2 mt-1">
                  {allVehicles.length > 0 ? (
                    allVehicles.map((vehicle, idx) => (
                      <div key={idx} className="text-gray-900 font-semibold">
                        {allVehicles.length > 1 && `${idx + 1}. `}{vehicle.name || 'Vehicle'}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-900 font-semibold">{booking.vehicle || 'Toyota Hiace Van'}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Pick-up Location:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.pickUpLocation || 'Kawaguchiko Station'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Drop-Off Location:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.dropOffLocation || 'Fuji Subaru Line 5th Station'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Highlights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tour Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Highlight 1 */}
            <div className="relative group">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <img 
                  src="/assests/mount fuji.jpg" 
                  alt="Panoramic Fuji view" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 rounded-xl">
                <p className="text-white font-semibold">Enjoy the panoramic Fuji view</p>
              </div>
            </div>

            {/* Highlight 2 */}
            <div className="relative group">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <img 
                  src="/assests/golden-pavilion-kinkakuji-temple-kyoto-japan.jpg" 
                  alt="Komitaké Shrine" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 rounded-xl">
                <p className="text-white font-semibold">Stop by Komitaké Shrine</p>
              </div>
            </div>

            {/* Highlight 3 */}
            <div className="relative group">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <img 
                  src="/assests/Arashiyama-Bamboo-Grove.jpg" 
                  alt="Scenic mountain road" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 rounded-xl">
                <p className="text-white font-semibold">Scenic mountain road experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex justify-between">
          <Link
            to="/search"
            className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition"
          >
            Book Another Tour
          </Link>
          <button 
            onClick={() => navigate('/bookings')}
            className="px-8 py-3 rounded-lg text-white font-semibold transition"
            style={{ backgroundColor: '#1d236b' }}
          >
            View My Booking
          </button>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default PaymentSuccessPage
