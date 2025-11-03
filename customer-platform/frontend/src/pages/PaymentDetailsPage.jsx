import React, { useState } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { BsBorderStyle } from 'react-icons/bs'

const PaymentDetailsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedDate, selectedTime, selectedPersons, selectedVehicle, extras, vehicleData, extrasTotal, totalPrice, bookingData } = location.state || {}
  
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  const handleCompleteBooking = () => {
    // Validate required fields
    if (!cardNumber.trim() || !cardholderName.trim() || !expiryMonth.trim() || !cvv.trim()) {
      alert('Please fill in all required payment fields')
      return
    }

    // Generate booking ID
    const bookingId = `FUJI-2025-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`
    
    // Create booking object
    const booking = {
      id: bookingId,
      bookingId,
      tourName: bookingData?.name || 'Fuji Subaru Line 5th Station Tour',
      packageType: 'Scenic Mountain Drive + Photo Spots',
      tourDate: selectedDate || 'October 22, 2025',
      totalAmount: `$${totalPrice || 778}`,
      customerName: cardholderName || 'Kenji Yamamoto',
      email: 'kenji.yamamoto@email.com',
      numberOfPersons: `${selectedPersons || 3} Adults, 1 Child`,
      phone: '+81 90-1234-5678',
      vehicle: 'Toyota Hiace Van',
      pickUpLocation: 'Kawaguchiko Station',
      dropOffLocation: 'Fuji Subaru Line 5th Station',
      image: bookingData?.image || '/assests/bg.jpg',
      status: 'confirmed'
    }
    
    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    existingBookings.push(booking)
    localStorage.setItem('bookings', JSON.stringify(existingBookings))
    
    // Clear cart after successful booking
    localStorage.removeItem('cart')
    
    // Navigate to payment success page
    navigate('/payment-success', { state: booking })
  }

  return (
    <div className="bg-gray-50">
      <MainHeader />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Steps */}
        <div className="mb-8">
          <Link to="/choose-vehicle" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#1d236b' }}>Choose Vehicle</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#1d236b' }}>Payment Details</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Payment Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <BsBorderStyle className="w-6 h-6" style={{ color: '#1d236b' }} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Detail</h2>
                <p className="text-gray-600">Check your payment detail</p>
              </div>
            </div>

            {/* Card Number */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">Card Number</label>
              <input
                type="text"
                placeholder="123456-5678"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#1d236b' }}
              />
            </div>

            {/* Cardholder Name */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">Cardholder Name</label>
              <input
                type="text"
                placeholder="123456-5678"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#1d236b' }}
              />
            </div>

            {/* Expiry Date and CVV */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">Expiry Date</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': '#1d236b' }}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': '#1d236b' }}
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Special Instructions <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Any special requests or dietary requirements..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#1d236b' }}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <Link
                to="/choose-vehicle"
                className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Previous
              </Link>
              <button 
                onClick={handleCompleteBooking}
                className="flex-1 py-3 rounded-lg text-white font-semibold transition"
                style={{ backgroundColor: '#1d236b' }}
              >
                Complete Booking
              </button>
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
            
            {/* Image */}
            <div className="w-full h-64 rounded-xl overflow-hidden mb-6">
              <img 
                src={bookingData?.image || '/assests/bg.jpg'} 
                alt={bookingData?.name || 'Tour'} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tour Details */}
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">{bookingData?.name || 'Private Tour, Minato City, Tokyo, Japan'}</p>
              <p className="text-gray-600">{bookingData?.location || 'Tokyo, Japan'}</p>
            </div>

            {/* Selected Options */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="text-gray-900 font-semibold">12/10/2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Preference price:</span>
                <span className="text-gray-900 font-semibold">${extrasTotal || 50}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Vehicle up to 4 persons:</span>
                <span className="text-gray-900 font-semibold">${vehicleData?.price || 728}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold text-lg">Total:</span>
                  <span className="text-gray-900 font-bold text-lg">${totalPrice || 778}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default PaymentDetailsPage
