import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import TourCard from '../components/TourCard'
import { FiFilter } from 'react-icons/fi'
import { getPublishedProducts, transformProductForFrontend, getCachedPublishedProductsSync } from '../services/productService'
import { ensureProductLocationResolved } from '../services/climateService'

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Filter states
  const [tourTypes, setTourTypes] = useState([])
  const [locations, setLocations] = useState([])
  const [durations, setDurations] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000000]) // Increased max to show all products including expensive ones
  const [minimumRating, setMinimumRating] = useState('Any Rating')
  const [itemsPerPage, setItemsPerPage] = useState('9')
  const [sortBy, setSortBy] = useState('Recommended')
  
  // Load from cache immediately (synchronous) - only if no search term
  const searchParams = new URLSearchParams(location.search)
  const searchTerm = searchParams.get('q') || ''
  const compareFromParam = searchParams.get('compareFrom') || ''
  const compareBaseIds = useMemo(
    () => (compareFromParam ? compareFromParam.split(',').map((id) => id.trim()).filter(Boolean) : []),
    [compareFromParam]
  )
  useEffect(() => {
    if (compareFromParam === 'pick-product') {
      alert('Please open any product and use the compare button to start comparing.')
      navigate('/search', { replace: true })
    }
  }, [compareFromParam, navigate])
  const isComparisonSelection = compareBaseIds.length > 0 && compareFromParam !== 'pick-product'
  const comparisonHeading = compareBaseIds.length > 1
    ? 'Select a third product to finish your comparison.'
    : 'Select a product to compare with your current choice.'
  const comparisonSubheading = compareBaseIds.length > 1
    ? 'We removed your current choices from this list—pick any other experience to add as the third slot.'
    : 'We removed your current choice from this list so you only see new experiences.'
  const handleComparisonBack = () => {
    if (compareBaseIds.length >= 2) {
      navigate(`/comparison/detail/${compareBaseIds.join('&')}`)
    } else if (compareBaseIds.length === 1) {
      navigate(`/product-details/${compareBaseIds[0]}`)
    } else {
      navigate(-1)
    }
  }
  const initialProducts = (() => {
    if (!searchTerm) {
      try {
        const cached = getCachedPublishedProductsSync()
        if (cached && cached.length > 0) {
          return cached.map(transformProductForFrontend)
        }
      } catch (_) {}
    }
    return []
  })()
  
  const [products, setProducts] = useState(initialProducts)
  const hasLoadedOnceRef = useRef(false)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [totalProducts, setTotalProducts] = useState(initialProducts.length)

  // Background fetch function for refreshing cache
  const fetchAllProductsInBackground = async () => {
    try {
      const pageSize = 100
      let currentPage = 1
      let hasMore = true
      let allProducts = []
      
      while (hasMore) {
        const params = { page: currentPage, page_size: pageSize }
        const data = await getPublishedProducts(params, true) // Use cache
        
        if (data && data.products && Array.isArray(data.products)) {
          if (data.products.length > 0) {
            allProducts = [...allProducts, ...data.products]
            if (data.total_pages && currentPage < data.total_pages) {
              currentPage++
            } else {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }
      
      if (allProducts.length > 0) {
        const transformed = allProducts.map(transformProductForFrontend).filter(p => p !== null)
        setProducts(transformed)
        setTotalProducts(transformed.length)
      }
    } catch (error) {
      console.error('Background fetch error:', error)
    }
  }

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Only show loading if we don't have cached data
        if (initialProducts.length === 0 && !hasLoadedOnceRef.current) {
          setLoading(true)
        }
        
        const searchParams = new URLSearchParams(location.search)
        const searchTerm = searchParams.get('q') || ''
        
        let allProducts = []
        let total = 0
        
        if (searchTerm && searchTerm.trim()) {
          // With search term - use pagination
          const params = {
            page: 1,
            page_size: parseInt(itemsPerPage) || 9,
            search: searchTerm.trim()
          }
          const data = await getPublishedProducts(params, false) // Don't use cache for search
          if (data && data.products && Array.isArray(data.products)) {
            allProducts = data.products
            total = data.total || 0
          }
        } else {
          // No search term - use cached data if available, otherwise fetch
          if (initialProducts.length > 0) {
            allProducts = initialProducts
            total = initialProducts.length
            hasLoadedOnceRef.current = true
            setLoading(false)
            // Set products immediately from cache
            setProducts(allProducts)
            setTotalProducts(total)
            // Fetch fresh in background (async, don't await)
            fetchAllProductsInBackground().catch(() => {})
            return
          }
          
          // No cache, fetch ALL products by getting all pages
          const pageSize = 100 // Max allowed by API
          let currentPage = 1
          let hasMore = true
          
          console.log('🔍 Fetching all products (no search term)...')
          
          while (hasMore) {
            const params = {
              page: currentPage,
              page_size: pageSize
            }
            console.log(`📄 Fetching page ${currentPage}...`)
            const data = await getPublishedProducts(params)
            
            console.log(`📦 Page ${currentPage} response:`, {
              productsCount: data?.products?.length || 0,
              total: data?.total || 0,
              totalPages: data?.total_pages || 0
            })
            
            if (data && data.products && Array.isArray(data.products)) {
              if (data.products.length > 0) {
                allProducts = [...allProducts, ...data.products]
                total = data.total || 0
                console.log(`✅ Added ${data.products.length} products. Total so far: ${allProducts.length}`)
                
                // Check if there are more pages
                if (data.total_pages && currentPage < data.total_pages) {
                  currentPage++
                } else {
                  hasMore = false
                  console.log('✅ Reached last page')
                }
              } else {
                // Empty page means we're done
                hasMore = false
                console.log('✅ No more products (empty page)')
              }
            } else {
              hasMore = false
              console.log('⚠️ Invalid response, stopping')
            }
          }
          
          console.log(`✅ Finished fetching. Total products: ${allProducts.length}, Total in DB: ${total}`)
        }
        
        if (allProducts.length > 0) {
          console.log('🔄 Transforming products...', allProducts.length)
          const transformed = allProducts.map((product, index) => {
            try {
              const transformedProduct = transformProductForFrontend(product)
              console.log(`✅ Product ${index + 1} transformed:`, {
                id: transformedProduct.id,
                name: transformedProduct.name,
                price: transformedProduct.price,
                location: transformedProduct.location,
                duration: transformedProduct.duration,
                rating: transformedProduct.rating,
                hasImage: !!transformedProduct.image
              })
              return transformedProduct
            } catch (error) {
              console.error(`❌ Error transforming product ${index + 1}:`, error, product)
              return null
            }
          }).filter(p => p !== null) // Remove any failed transformations
          
          console.log(`✅ Transformed ${transformed.length} products successfully`)
          setProducts(transformed)
          setTotalProducts(total)
        } else {
          setProducts([])
          setTotalProducts(0)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [location.search, itemsPerPage])

  // All products data - now from API
  const allProducts = useMemo(() => products, [products])

  // Filter toggle functions
  const toggleFilter = (filterType, value) => {
    if (filterType === 'tourType') {
      setTourTypes(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else if (filterType === 'location') {
      setLocations(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else if (filterType === 'duration') {
      setDurations(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    }
  }

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let filtered = allProducts
    if (isComparisonSelection) {
      const excludeSet = new Set(compareBaseIds.map(String))
      filtered = filtered.filter((product) => !excludeSet.has(String(product.id)))
    }
    console.log(`🔍 Starting with ${filtered.length} products for filtering`)

    // Apply price range filter
    if (priceRange && priceRange.length === 2) {
      const beforeCount = filtered.length
      filtered = filtered.filter(product => {
        // Extract numeric price from string like "$245/person" or "$245"
        const priceMatch = product.price?.match(/\$(\d+)/)
        const priceValue = priceMatch ? parseInt(priceMatch[1]) : 0
        const passes = priceValue >= priceRange[0] && priceValue <= priceRange[1]
        if (!passes) {
          console.log(`❌ Product "${product.name}" filtered out by price: $${priceValue} (range: $${priceRange[0]}-$${priceRange[1]})`)
        }
        return passes
      })
      console.log(`💰 Price filter: ${beforeCount} → ${filtered.length} products`)
    }

    // Apply minimum rating filter
    if (minimumRating !== 'Any Rating') {
      const beforeCount = filtered.length
      const minRating = parseFloat(minimumRating)
      filtered = filtered.filter(product => {
        const productRating = product.rating || 0
        const passes = productRating >= minRating
        if (!passes) {
          console.log(`❌ Product "${product.name}" filtered out by rating: ${productRating} (minimum: ${minRating})`)
        }
        return passes
      })
      console.log(`⭐ Rating filter: ${beforeCount} → ${filtered.length} products`)
    }

    // Apply location filter
    if (locations.length > 0) {
      const beforeCount = filtered.length
      filtered = filtered.filter(product => {
        const productLocation = product.location || ''
        const passes = locations.some(loc => productLocation.includes(loc))
        if (!passes) {
          console.log(`❌ Product "${product.name}" filtered out by location: "${productLocation}" (looking for: ${locations.join(', ')})`)
        }
        return passes
      })
      console.log(`📍 Location filter: ${beforeCount} → ${filtered.length} products`)
    }

    // Apply duration filter
    if (durations.length > 0) {
      const beforeCount = filtered.length
      filtered = filtered.filter(product => {
        const productDuration = product.duration || ''
        const passes = durations.some(dur => productDuration.includes(dur))
        if (!passes) {
          console.log(`❌ Product "${product.name}" filtered out by duration: "${productDuration}" (looking for: ${durations.join(', ')})`)
        }
        return passes
      })
      console.log(`⏱️ Duration filter: ${beforeCount} → ${filtered.length} products`)
    }

    // Apply tour type filter
    if (tourTypes.length > 0) {
      const beforeCount = filtered.length
      filtered = filtered.filter(product => {
        const isPrivate = product.isPrivate === true || String(product.activity_type || '').toLowerCase().includes('private')
        const matchesPrivate = tourTypes.includes('Private Tours') ? isPrivate : true
        const matchesShared = tourTypes.includes('Shared Tours') ? !isPrivate : true
        // Customize Tours currently passes through (no dedicated flag yet)
        return matchesPrivate && matchesShared
      })
      console.log(`🎯 Tour type filter: ${beforeCount} → ${filtered.length} products`)
    }

    console.log(`✅ Final filtered products: ${filtered.length}`)
    return filtered
  }, [allProducts, priceRange, minimumRating, locations, durations, tourTypes, isComparisonSelection, compareBaseIds])

  // Sorting
  const visibleProducts = useMemo(() => {
    const list = [...filteredProducts]
    switch (sortBy) {
      case 'Price: Low to High':
        return list.sort((a, b) => {
          const pa = parseInt(String(a.price).match(/\$(\d+)/)?.[1] || '0')
          const pb = parseInt(String(b.price).match(/\$(\d+)/)?.[1] || '0')
          return pa - pb
        })
      case 'Price: High to Low':
        return list.sort((a, b) => {
          const pa = parseInt(String(a.price).match(/\$(\d+)/)?.[1] || '0')
          const pb = parseInt(String(b.price).match(/\$(\d+)/)?.[1] || '0')
          return pb - pa
        })
      case 'Rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'Most Reviews':
        const toCount = (p) => {
          const m = String(p.reviews || '').match(/(\d+(?:\.\d+)?)(k)?/i)
          if (!m) return 0
          const n = parseFloat(m[1])
          return m[2] ? n * 1000 : n
        }
        return list.sort((a, b) => toCount(b) - toCount(a))
      case 'Recommended':
      default:
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
  }, [filteredProducts, sortBy])

  // Handle price range slider
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value)
    setPriceRange([0, value])
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isComparisonSelection && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{comparisonHeading}</p>
              <p className="text-sm text-blue-800/80">
                {comparisonSubheading}
              </p>
            </div>
            <button
              onClick={handleComparisonBack}
              className="inline-flex items-center justify-center rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              Back
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiFilter className="w-5 h-5" />
                  Filters
                </h2>
              </div>
              
              <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Tour Type */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tour Type</h3>
                  <div className="space-y-2">
                    {['Shared Tours', 'Private Tours', 'Customize Tours'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tourTypes.includes(type)}
                          onChange={() => toggleFilter('tourType', type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Locations</h3>
                  <div className="space-y-2">
                    {[
                      'Amsterdam, Netherlands',
                      'Bali, Indonesia',
                      'Bangkok, Thailand',
                      'Barcelona, Spain',
                      'Dubai, UAE',
                      'Kyoto, Japan',
                      'London, UK'
                    ].map((location) => (
                      <label key={location} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={locations.includes(location)}
                          onChange={() => toggleFilter('location', location)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Duration</h3>
                  <div className="space-y-2">
                    {[
                      '10 hours', '3 hours', '4 hours', '5 hours',
                      '6 hours', '7 hours', '8 hours', 'Flexible hours', 'Full Day'
                    ].map((duration) => (
                      <label key={duration} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={durations.includes(duration)}
                          onChange={() => toggleFilter('duration', duration)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{duration}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="10000"
                        value={priceRange[1]}
                        onChange={handlePriceChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h3>
                  <select
                    value={minimumRating}
                    onChange={(e) => setMinimumRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>Any Rating</option>
                    <option>4.5+</option>
                    <option>4.0+</option>
                    <option>3.5+</option>
                    <option>3.0+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Top controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="9">Items Per Page</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="36">36</option>
                </select>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                    <div className="h-56 bg-gray-300"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleProducts.map((product) => {
                  // Ensure we're using the actual MongoDB ObjectId, not a slug
                  const productId = product.id
                  console.log('🔗 Navigating to product:', { id: productId, name: product.name })
                  return (
                    <TourCard 
                      key={product.id} 
                      tour={product}
                      onClick={async () => {
                        if (isComparisonSelection) {
                          console.info('[COMPARE][UI] Selecting comparison candidate', {
                            id: productId,
                            name: product.name,
                            currentLocation: product.location,
                            baseIds: compareBaseIds,
                          })
                          // When picking a product to compare WITH, make sure its
                          // location is resolved and saved so OpenAI is only
                          // called once per product.
                          try {
                            const resolved = await ensureProductLocationResolved({
                              productId,
                              name: product.name,
                              location: product.location,
                            })
                            console.info('[COMPARE][UI] Comparison candidate resolved location:', resolved)
                          } catch (e) {
                            console.warn('[COMPARE][UI] Failed to ensure product location for comparison candidate', e)
                          }
                          const combined = [...compareBaseIds, String(productId)]
                          navigate(`/comparison/detail/${combined.join('&')}`)
                        } else {
                          navigate(`/product-details/${productId}`)
                        }
                      }}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No products found matching your filters
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default SearchResultsPage

