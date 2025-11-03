import React from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiDownload } from 'react-icons/fi'

const PaymentSuccessPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state || {}

  return (
    <div className="bg-gray-50">
      <MainHeader />
      
      {/* Banner Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={booking.image || '/assests/mount fuji.jpg'} 
          alt="Mount Fuji" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Your booking has been confirmed. We've sent your details to your email.
            </p>
          </div>
        </div>
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
                <span className="ml-2 font-semibold" style={{ color: '#1d236b' }}>{booking.totalAmount || '$250'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Credit/Debit Card:</span>
                <span className="ml-2 text-gray-900 font-semibold"></span>
              </div>
            </div>

            <button className="w-full mt-8 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <FiDownload className="w-5 h-5" />
              Save to gallery
            </button>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Details</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.customerName || 'Kenji Yamamoto'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email Address:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.email || 'kenji.yamamoto@email.com'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Number of persons:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.numberOfPersons || '3 Adults, 1 Child'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Phone Number:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.phone || '+81 90-1234-5678'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Selected Vehicle:</span>
                <span className="ml-2 text-gray-900 font-semibold">{booking.vehicle || 'Toyota Hiace Van'}</span>
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

        {/* Action Buttons */}
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
