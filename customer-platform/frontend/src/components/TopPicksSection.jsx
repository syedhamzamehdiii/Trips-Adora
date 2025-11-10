import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import TourCard from './TourCard'
import { getTopPicks, transformProductForFrontend, recordProductClick, addRecentlyViewed } from '../services/productService'

const TopPicksSection = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const fetchTopPicks = async () => {
      try {
        setLoading(true)
        const data = await getTopPicks(4)
        if (!cancelled) {
          if (data && Array.isArray(data)) {
            const transformed = data.map(transformProductForFrontend)
            setProducts(transformed)
          } else {
            setProducts([])
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching top picks:', error)
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTopPicks()
    // Revalidate only when tab becomes visible for a smoother feel
    const onVisible = () => { if (document.visibilityState === 'visible') fetchTopPicks() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  return (
    <section className="py-16 bg-gray-200">
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
            {products.map((product) => (
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
