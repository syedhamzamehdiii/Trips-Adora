import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ShieldCheck, Zap, Star, ArrowLeft } from 'lucide-react'
import MainHeader from './MainHeader'
import Footer from './Footer'
import mountfuj from '../../assests/mount-fuj.jpg'

const ProductComparisonDetail = () => {
  const navigate = useNavigate()
  const { ids } = useParams()
  const [isChooserOpen, setIsChooserOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [changeTargetIndex, setChangeTargetIndex] = useState(null)
  
  // Parse product IDs from URL params
  const productIds = ids ? ids.split('&') : []
  
  // Mock products data - this will be replaced with backend data
  const products = [
    {
      id: 1,
      name: 'Mount Fuji Day Trip with Lake Kawaguchi & Hakone',
      description: 'Experience the breathtaking beauty and cultural richness of this carefully curated journey.',
      image: mountfuj,
      price: 149,
      oldPrice: 200,
      duration: '12 hours',
      groupSize: 'Up to 15',
      location: 'Mount Fuji Japan',
      rating: 4.9,
      reviews: 428,
      type: 'Shared',
      included: [
        'Professional tour guide',
        'Hotel pickup & drop-off',
        'Shared transportation',
        'All entrance fees included',
        'Light refreshments',
        'Free cancellation up to 24 hours',
        'Instant confirmation',
        'Highly rated experience'
      ]
    },
    {
      id: 2,
      name: 'Mount Fuji Day Trip with Lake Kawaguchi & Hakone',
      description: 'Experience the breathtaking beauty and cultural richness of this carefully curated journey.',
      image: mountfuj,
      price: 250,
      oldPrice: 300,
      duration: '12 hours',
      groupSize: 'Up to 15',
      location: 'Mount Fuji Japan',
      rating: 5.0,
      reviews: 438,
      type: 'Private',
      included: [
        'Professional tour guide',
        'Hotel pickup & drop-off',
        'Shared transportation',
        'All entrance fees included',
        'Light refreshments',
        'Free cancellation up to 24 hours',
        'Instant confirmation',
        'Highly rated experience'
      ]
    }
  ]
  
  // Get selected products
  const selectedProducts = productIds.map(id => 
    products.find(p => p.id === parseInt(id))
  ).filter(Boolean)

  const selectedIdsNum = useMemo(() => selectedProducts.map(p => p.id), [selectedProducts])
  const otherProducts = useMemo(
    () => products.filter(p => !selectedIdsNum.includes(p.id)),
    [products, selectedIdsNum]
  )

  // When only one product is selected, prompt user to add a second
  useEffect(() => {
    if (selectedProducts.length === 1) {
      setIsAddOpen(true)
    }
  }, [selectedProducts.length])
  
  // Calculate differences
  const priceDifference = selectedProducts.length === 2 
    ? Math.abs(selectedProducts[0].price - selectedProducts[1].price)
    : 0
  
  const typeDifferent = selectedProducts.length === 2 
    ? selectedProducts[0].type !== selectedProducts[1].type
    : false
  
  const highestRating = selectedProducts.length > 0
    ? Math.max(...selectedProducts.map(p => p.rating))
    : 0

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Selection
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Perfect Experience</h1>
              <p className="text-lg text-gray-600">
                Compare side by side to find the tour that best matches your preferences
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedProducts.length === 2 && (
                <>
                  <button onClick={() => { setChangeTargetIndex(1); setIsChooserOpen(true) }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Change with
                  </button>
                  <span className="text-gray-400">or</span>
                </>
              )}
              {selectedProducts.length < 3 && (
                <button onClick={() => setIsAddOpen(true)} className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
                  {selectedProducts.length === 1 ? 'Add second item' : 'Add third item'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className={`grid grid-cols-1 ${selectedProducts.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 mb-12`}>
          {selectedProducts.map((product, index) => (
            <div key={product.id} className={`bg-white border-2 rounded-2xl overflow-hidden ${index === 0 ? 'border-blue-500' : 'border-gray-200'}`}>
              {/* Product Image */}
              <div className="relative h-64">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                {/* Price Box */}
                <div className="bg-gray-100 rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <p className="text-4xl font-bold text-blue-600">${product.price}</p>
                  <p className="text-sm text-gray-600">Per person</p>
                </div>
                
                {/* Tour Details */}
                <div className="mb-6">
                  <h3 className="text-xs text-gray-500 uppercase mb-4">Tour Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-semibold text-gray-900">{product.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Group size:</span>
                      <span className="text-sm font-semibold text-gray-900">{product.groupSize}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-semibold text-gray-900">{product.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reviews:</span>
                      <span className="text-sm font-semibold text-gray-900">{product.reviews} reviews</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-semibold text-gray-900">{product.type}</span>
                    </div>
                  </div>
                </div>
                
                {/* What's Included */}
                <div className="mb-6">
                  <h3 className="text-xs text-gray-500 uppercase mb-4">What's included</h3>
                  <div className="space-y-3">
                    {product.included.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Secure
                  </button>
                  <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    <Zap className="w-4 h-4" />
                    Instant
                  </button>
                  <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    Top Rated
                  </button>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Book this experience
                </button>
                {selectedProducts.length === 3 && (
                  <button
                    onClick={() => { setChangeTargetIndex(index); setIsChooserOpen(true) }}
                    className="w-full mt-3 bg-white text-blue-700 border border-blue-200 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Change product
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Key Differences Section - hidden when 3 items */}
        {selectedProducts.length < 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Differences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">${priceDifference}</p>
                <p className="text-sm text-gray-600">Price Difference</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {typeDifferent ? 'Different' : 'Same'}
                </p>
                <p className="text-sm text-gray-600">Tour Type</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">{highestRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Highest Rating</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Trust Statement */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-900">Secure</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">Instant</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Star className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900">Top Rated</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            All tours are protected by our comprehensive booking guarantee and backed by thousands of verified reviews.
          </p>
        </div>
      </div>
      
      {/* Change-with chooser modal */}
      {isChooserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsChooserOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-xl p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Choose another product to compare</h3>
              <button onClick={() => setIsChooserOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {otherProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (changeTargetIndex !== null) {
                      const currentIds = selectedProducts.map(sp => sp.id)
                      currentIds[changeTargetIndex] = p.id
                      setIsChooserOpen(false)
                      navigate(`/comparison/detail/${currentIds.join('&')}`)
                    } else {
                      const baseId = selectedProducts[0]?.id ?? p.id
                      setIsChooserOpen(false)
                      navigate(`/comparison/detail/${baseId}&${p.id}`)
                    }
                  }}
                  className="text-left border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white"
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{p.name}</div>
                    <div className="text-sm text-gray-600">From <span className="font-bold text-blue-600">${p.price}</span> · {p.duration}</div>
                    <div className="text-xs text-gray-500">{p.location}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add third item modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-xl p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedProducts.length === 1 ? 'Choose a second product' : 'Add a third product'}</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const currentIds = selectedProducts.map(sp => sp.id)
                    const newIds = [...currentIds, p.id].slice(0, 3)
                    setIsAddOpen(false)
                    navigate(`/comparison/detail/${newIds.join('&')}`)
                  }}
                  className="text-left border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white"
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{p.name}</div>
                    <div className="text-sm text-gray-600">From <span className="font-bold text-blue-600">${p.price}</span> · {p.duration}</div>
                    <div className="text-xs text-gray-500">{p.location}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ProductComparisonDetail

