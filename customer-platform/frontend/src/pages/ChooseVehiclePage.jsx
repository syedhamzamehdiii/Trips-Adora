import React, { useState } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { BsBorderStyle } from 'react-icons/bs'

const ChooseVehiclePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { 
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
    extraVehicles,
    bookingData 
  } = location.state || {}
  
  // Restore extras and special requirements from state if coming back
  const [extras, setExtras] = useState(
    location.state?.extras || {
      childSeat: false,
      wifi: false,
      gps: false,
      insurance: false
    }
  )
  const [specialRequirements, setSpecialRequirements] = useState(
    location.state?.specialRequirements || ''
  )

  const extrasList = [
    { key: 'childSeat', name: 'Child Safety Seat', description: 'For Children under 12 year', price: 12 },
    { key: 'wifi', name: 'Wifi Hotspot', description: 'Unlimited Internet access', price: 10 },
    { key: 'gps', name: 'GPS Navigation', description: 'Advanced Navigation System', price: 8 },
    { key: 'insurance', name: 'Premium Insurance', description: 'Full Coverage Protection', price: 25 }
  ]

  const extrasTotal = extrasList.reduce((sum, extra) => extras[extra.key] ? sum + extra.price : sum, 0)
  const totalPrice = extrasTotal

  const toggleExtra = (key) => {
    setExtras(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleBack = () => {
    navigate('/check-availability', {
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
        extraVehicles,
        extras,
        specialRequirements,
        bookingData: bookingData || {}
      }
    })
  }

  const handleContinue = () => {
    navigate('/payment-details', {
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
        extraVehicles,
        extras,
        extrasTotal,
        totalPrice,
        specialRequirements,
        bookingData: bookingData || {}
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
            onClick={handleBack}
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d236b' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#1d236b' }}>Customize Trip</span>
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
          {/* Left Panel */}
          <div>
            {/* Customize Preference Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <BsBorderStyle className="w-6 h-6" style={{ color: '#1d236b' }} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Customize Your Preference</h2>
                  <p className="text-gray-600">Add optional extras to enhance your experience</p>
                </div>
              </div>

              <div className="space-y-4">
                {extrasList.map((extra) => (
                  <div
                    key={extra.key}
                    onClick={() => toggleExtra(extra.key)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        extras[extra.key] ? 'border-gray-300' : 'border-gray-300'
                      }`}
                      style={extras[extra.key] ? { backgroundColor: '#1d236b', borderColor: '#1d236b' } : {}}
                      >
                        {extras[extra.key] && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{extra.name}</p>
                        <p className="text-sm text-gray-600">{extra.description}</p>
                      </div>
                    </div>
                    <span className="font-bold" style={{ color: '#1d236b' }}>+${extra.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requirements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Write here your Special requirement for Supplier:
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={4}
                placeholder="write here any pic-up instruction, what things bring to you etc...."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#1d236b' }}
              />
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
                <span className="text-gray-600 font-medium">Travel Date:</span>
                <span className="text-gray-900 font-semibold">{selectedDate || 'Oct, 17, 2025'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Travel Time:</span>
                <span className="text-gray-900 font-semibold">{selectedTime || '10:30 AM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Number of Persons:</span>
                <span className="text-gray-900 font-semibold">{selectedPersons || 3}</span>
              </div>
              
              {/* Pickup Location - Moved above vehicles */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-gray-600 font-semibold text-base">Pickup Location:</span>
                <span className="text-gray-900 font-semibold text-base text-right">
                  {selectedMeetingPoint
                    ? (typeof selectedMeetingPoint === 'string' 
                        ? selectedMeetingPoint 
                        : (selectedMeetingPoint.name || 'Pickup Location'))
                    : 'Pickup Location'}
                </span>
              </div>
              
              {/* Vehicles */}
              <div className="space-y-3">
                {/* Primary Vehicle */}
                {selectedVehicle && (
                  <div className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-gray-600 font-medium">Vehicle 1:</span>
                      <span className="text-gray-900 font-semibold text-right">
                        {selectedVehicle?.title || selectedVehicle?.model || 'Vehicle'} 
                        {selectedVehicle?.year ? `(${selectedVehicle.year})` : ''}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Extra Vehicles */}
                {Array.isArray(extraVehicles) && extraVehicles.length > 0 && extraVehicles.map((ev, idx) => (
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
              
              {/* Selected Extras */}
              {extrasList.some(extra => extras[extra.key]) && (
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-gray-600 font-medium mb-2">Selected Extras:</div>
                  {extrasList
                    .filter(extra => extras[extra.key])
                    .map((extra) => (
                      <div key={extra.key} className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">{extra.name}</span>
                        <span className="text-gray-900 font-semibold text-sm">+${extra.price}</span>
                      </div>
                    ))
                  }
                  {extrasTotal > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-700 font-medium">Extras Total:</span>
                      <span className="text-gray-900 font-bold">${extrasTotal}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button 
                onClick={handleContinue}
                className="flex-1 py-3 rounded-lg text-white font-semibold transition"
                style={{ backgroundColor: '#1d236b' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default ChooseVehiclePage
