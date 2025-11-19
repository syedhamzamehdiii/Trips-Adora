import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ShieldCheck, Zap, Star, ArrowLeft } from 'lucide-react'
import MainHeader from './MainHeader'
import Footer from './Footer'
import { getProductById, transformProductForFrontend } from '../services/productService'

const ProductComparisonDetail = () => {
  const navigate = useNavigate()
  const { ids } = useParams()
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Parse product IDs from URL params
  const productIds = ids ? ids.split('&').filter(Boolean) : []

  // Fetch selected products by ID
  useEffect(() => {
    const fetchProducts = async () => {
      if (productIds.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Fetch all selected products in parallel
        const productPromises = productIds.map(id => getProductById(id))
        const fetchedProducts = await Promise.all(productPromises)
        
        // Transform and filter out nulls
        const transformed = fetchedProducts
          .filter(Boolean)
          .map(transformProductForFrontend)
          .map(product => ({
            ...product,
            // Extract numeric price for calculations
            priceNum: parseFloat(product.price?.replace(/[^0-9.]/g, '')) || 0,
            // Map included items
            included: product.includedItems || [
              'Professional tour guide',
              'Hotel pickup & drop-off',
              'Transportation',
              'All entrance fees included',
              'Free cancellation up to 24 hours',
              'Instant confirmation'
            ],
            // Map type from activity_type or guide_type
            type: product.guideType || (product.isPrivate ? 'Private' : 'Shared'),
            // Map reviews count
            reviews: product.reviewsCount || 0
          }))
        
        setSelectedProducts(transformed)
      } catch (error) {
        console.error('Error fetching products for comparison:', error)
        setSelectedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [ids])


  const comparisonBaseIds = useMemo(() => {
    if (!selectedProducts.length) return []
    if (selectedProducts.length === 1) {
      return selectedProducts[0]?.id ? [selectedProducts[0].id] : []
    }
    return selectedProducts
      .slice(0, selectedProducts.length - 1)
      .map(sp => sp.id)
      .filter(Boolean)
  }, [selectedProducts])

  const handleBackToComparison = () => {
    const params = new URLSearchParams()
    const idsToUse = comparisonBaseIds.length
      ? comparisonBaseIds
      : (selectedProducts[0]?.id ? [selectedProducts[0].id] : [])
    if (idsToUse.length) {
      params.set('compareFrom', idsToUse.join(','))
      navigate(`/search?${params.toString()}`)
    } else {
      navigate('/search')
    }
  }

  // Calculate differences
  const priceDifference = selectedProducts.length === 2 
    ? Math.abs((selectedProducts[0].priceNum || 0) - (selectedProducts[1].priceNum || 0))
    : 0
  
  const typeDifferent = selectedProducts.length === 2 
    ? selectedProducts[0].type !== selectedProducts[1].type
    : false
  
  const highestRating = selectedProducts.length > 0
    ? Math.max(...selectedProducts.map(p => p.rating || 0))
    : 0

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-wrap gap-3">
              {selectedProducts.length > 0 && selectedProducts[0]?.id && (
                <button 
                  onClick={() => navigate(`/product-details/${selectedProducts[0].id}`)}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to product
                </button>
              )}
              {selectedProducts.length >= 1 && (
                <button 
                  onClick={handleBackToComparison}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Back to comparison
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Perfect Experience</h1>
              <p className="text-lg text-gray-600">
                Compare side by side to find the tour that best matches your preferences
              </p>
            </div>
            {selectedProducts.length === 1 && selectedProducts[0] && (
              <button
                onClick={() => {
                  const baseId = selectedProducts[0]?.id
                  if (!baseId) return
                  const params = new URLSearchParams()
                  params.set('compareFrom', String(baseId))
                  navigate(`/search?${params.toString()}`)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add second item
              </button>
            )}
            {selectedProducts.length === 2 && (
              <button
                onClick={() => {
                  const baseIds = selectedProducts.slice(0, 2).map((p) => p.id)
                  if (!baseIds.length) return
                  const params = new URLSearchParams()
                  params.set('compareFrom', baseIds.join(','))
                  navigate(`/search?${params.toString()}`)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add third item
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : selectedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found for comparison.</p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse tours
            </button>
          </div>
        ) : (
          <>
            {/* Comparison Cards Grid */}
            <div className={`grid grid-cols-1 ${selectedProducts.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 mb-12`}>
              {selectedProducts.map((product, index) => (
                <div key={product.id} className={`bg-white border-2 rounded-2xl overflow-hidden ${index === 0 ? 'border-blue-500' : 'border-gray-200'}`}>
                  {/* Product Image */}
                  <div className="relative h-64">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{product.description || product.tagline || 'Experience this amazing tour.'}</p>
                    
                    {/* Price Box */}
                    <div className="bg-gray-100 rounded-xl p-6 mb-6">
                      <p className="text-sm text-gray-600 mb-1">Starting from</p>
                      <p className="text-4xl font-bold text-blue-600">{product.price || '$0'}</p>
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
                      <span className="text-sm font-semibold text-gray-900">{product.reviews || 0} reviews</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-semibold text-gray-900">{product.type || 'Shared'}</span>
                    </div>
                  </div>
                </div>
                
                {/* What's Included */}
                <div className="mb-6">
                  <h3 className="text-xs text-gray-500 uppercase mb-4">What's included</h3>
                  <div className="space-y-3">
                    {product.included && product.included.length > 0 ? (
                      product.included.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No details available</p>
                    )}
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
                
                <button
                  onClick={() => navigate(`/product-details/${product.id}`)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Book this experience
                </button>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
        
        {/* Key Differences Section - hidden when 3 items or loading */}
        {!loading && selectedProducts.length > 0 && selectedProducts.length < 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Differences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">${priceDifference.toFixed(0)}</p>
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
      
      <Footer />
    </div>
  )
}

export default ProductComparisonDetail

