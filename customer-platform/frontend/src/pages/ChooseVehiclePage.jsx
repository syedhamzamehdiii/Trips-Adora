import React, { useState } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { FaCar } from 'react-icons/fa'
import { BsBorderStyle } from 'react-icons/bs'

const ChooseVehiclePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedDate, selectedTime, selectedPersons, bookingData } = location.state || {}
  
  const [selectedVehicle, setSelectedVehicle] = useState('luxury-sedan-728')
  const [extras, setExtras] = useState({
    childSeat: false,
    wifi: false,
    gps: false,
    insurance: false
  })

  const vehicles = [
    {
      id: 'luxury-sedan-728',
      name: 'Luxury Sedan',
      price: 728,
      features: ['Up to 4 Passengers', 'Air Conditioning', 'Leather Seats', 'Premium Sounds'],
      available: 5
    },
    {
      id: 'luxury-sedan-80',
      name: 'Luxury Sedan',
      price: 80,
      features: ['Up to 4 Passengers', 'Air Conditioning', 'Leather Seats', 'Premium Sounds'],
      available: 5
    },
    {
      id: 'luxury-sedan-80-2',
      name: 'Luxury Sedan',
      price: 80,
      features: ['Up to 4 Passengers', 'Air Conditioning', 'Leather Seats', 'Premium Sounds'],
      available: 5
    }
  ]

  const extrasList = [
    { key: 'childSeat', name: 'Child Safety Seat', description: 'For Children under 12 year', price: 12 },
    { key: 'wifi', name: 'Wifi Hotspot', description: 'Unlimited Internet access', price: 10 },
    { key: 'gps', name: 'GPS Navigation', description: 'Advanced Navigation System', price: 8 },
    { key: 'insurance', name: 'Premium Insurance', description: 'Full Coverage Protection', price: 25 }
  ]

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)
  const extrasTotal = extrasList.reduce((sum, extra) => extras[extra.key] ? sum + extra.price : sum, 0)
  const totalPrice = (selectedVehicleData?.price || 0) + extrasTotal

  const toggleExtra = (key) => {
    setExtras(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleContinue = () => {
    navigate('/payment-details', {
      state: {
        selectedDate,
        selectedTime,
        selectedPersons,
        selectedVehicle,
        extras,
        vehicleData: selectedVehicleData,
        extrasTotal,
        totalPrice,
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
          <Link to="/check-availability" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
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
            {/* Choose Vehicle Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <FaCar className="w-6 h-6" style={{ color: '#1d236b' }} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Vehicle</h2>
                  <p className="text-gray-600">Select a vehicle option for your tour</p>
                </div>
              </div>

              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition ${
                      selectedVehicle === vehicle.id 
                        ? '' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={selectedVehicle === vehicle.id ? { borderColor: '#1d236b' } : {}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                      <div>
                        <span className="text-2xl font-bold" style={{ color: '#1d236b' }}>
                          ${vehicle.price}
                        </span>
                        <span className="text-gray-600"> per Vehicle</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {vehicle.features.map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600">{vehicle.available} Available</p>
                  </div>
                ))}
              </div>
            </div>

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
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Vehicle:</span>
                <span className="text-gray-900 font-semibold">Sedan</span>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex gap-4 mt-8">
              <Link
                to="/check-availability"
                className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </Link>
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
