import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import TourCard from './TourCard'
import { getTopPicks, transformProductForFrontend, recordProductClick, addRecentlyViewed, getCachedPublishedProductsSync } from '../services/productService'

const TopPicksSection = () => {
  // Load from cache immediately (synchronous)
  const initialProducts = (() => {
    try {
      const cached = getCachedPublishedProductsSync()
      if (cached && cached.length > 0) {
        return cached.slice(0, 4).map(transformProductForFrontend)
      }
    } catch (_) {}
    return []
  })()
  
  const [products, setProducts] = useState(initialProducts)
  const hasLoadedOnceRef = useRef(false)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const navigate = useNavigate()

  useEffect(() => {
    // If we have cached data, set loaded state immediately
    if (initialProducts.length > 0) {
      hasLoadedOnceRef.current = true
      setLoading(false)
    }
    
    let cancelled = false
    const fetchTopPicks = async () => {
      try {
        // Only show loading if we don't have cached data
        if (initialProducts.length === 0 && !hasLoadedOnceRef.current) {
          setLoading(true)
        }
        
        const data = await getTopPicks(4, true) // Use cache
        if (!cancelled) {
          if (data && Array.isArray(data)) {
            const transformed = data.map(transformProductForFrontend)
            setProducts(transformed)
            hasLoadedOnceRef.current = true
          } else {
            setProducts([])
          }
        }
      } catch (error) {
        // Don't log abort errors - they're expected when components unmount
        const isAbortError = error?.name === 'AbortError' || 
                            error?.message?.includes('aborted') ||
                            error?.message?.includes('signal is aborted');
        
        if (!cancelled && !isAbortError) {
          console.error('Error fetching top picks:', error)
          if (initialProducts.length === 0) {
            setProducts([])
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // If we have cached data, fetch fresh in background
    if (initialProducts.length > 0) {
      fetchTopPicks() // Background refresh
    } else {
      fetchTopPicks() // Immediate fetch
    }
    
    return () => { cancelled = true }
  }, [])

  return (
    <section id="top-picks" className="py-16 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Top picks for you...</h2>
          <Link to="/search" className="text-custom-blue hover:text-blue-600 font-medium">
            View All
          </Link>
        </div>
        
        {/* Destinations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-56 bg-gray-300"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              // Only show products that are currently available for customers
              .filter(product => product.isAvailableForCustomer)
              .map((product) => (
                <TourCard key={product.id} tour={product} onClick={() => {
                  recordProductClick(product.id)
                  addRecentlyViewed(product)
                  navigate(`/tours/${encodeURIComponent(product.name?.toLowerCase().replace(/\s+/g,'-'))}`)
                }} />
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products available at the moment
          </div>
        )}
      </div>
    </section>
  )
}

export default TopPicksSection
