import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TourCard from './TourCard'
import ExperienceCard from './ExperienceCard'
import StatsBanner from './StatsBanner'
import ConsultationBanner from './ConsultationBanner'
import { getPublishedProducts, transformProductForFrontend, getProductClicks, recordProductClick, addRecentlyViewed, getRecentlyViewed } from '../services/productService'

const ToursSection = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState([])

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [sortKey, setSortKey] = useState('most_clicked')
  const sortRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getPublishedProducts({ page: 1, page_size: 8 })
        const list = (data.products || []).map(transformProductForFrontend)
        setProducts(list)
        setRecent(getRecentlyViewed())
      } catch (e) {
        setError('Failed to load tours')
        setProducts([])
        setRecent(getRecentlyViewed())
      } finally {
        setLoading(false)
      }
    }
    load()
    // Realtime updates within the same tab
    const handler = () => {
      setProducts(prev => [...prev]) // trigger re-sort with latest clicks
      setRecent(getRecentlyViewed())
    }
    window.addEventListener('realtime-products-update', handler)
    return () => window.removeEventListener('realtime-products-update', handler)
  }, [])

  const tours = useMemo(() => {
    const clicks = getProductClicks()
    const parsed = products.map(t => ({
      ...t,
      priceValue: Number((String(t.price).match(/\$(\d+)/) || [])[1]) || 0,
      updatedAt: t.id,
      clicks: clicks[t.id] || 0
    }))
    switch (sortKey) {
      case 'price_asc':
        return [...parsed].sort((a, b) => a.priceValue - b.priceValue)
      case 'date_new':
        return [...parsed].sort((a, b) => b.updatedAt - a.updatedAt)
      case 'date_old':
        return [...parsed].sort((a, b) => a.updatedAt - b.updatedAt)
      case 'price_desc':
        return [...parsed].sort((a, b) => b.priceValue - a.priceValue)
      case 'most_clicked':
      default:
        return [...parsed].sort((a, b) => b.clicks - a.clicks)
    }
  }, [products, sortKey])

  const handleCardClick = (tour) => {
    recordProductClick(tour.id)
    // Resort immediately based on updated clicks
    setProducts(prev => [...prev])
    // Update recently viewed list
    const updated = addRecentlyViewed(tour)
    setRecent(updated)
    // Navigate to product detail if available
    if (tour.id) {
      navigate(`/tours/${encodeURIComponent(tour.name?.toLowerCase().replace(/\s+/g,'-'))}`)
    }
  }

  return (
    <section className="py-16 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Explore our tours</h2>
          <div className="relative">
            <button
              ref={sortRef}
              onClick={() => setIsSortOpen(!isSortOpen)}
              aria-label="Sort"
              className="w-9 h-9 rounded-full border border-gray-300 bg-white shadow flex items-center justify-center hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-custom-blue"
              >
                <path d="M8 19V5" />
                <path d="M8 19l-3-3" />
                <path d="M8 19l3-3" />
                <path d="M16 5v14" />
                <path d="M16 5l-3 3" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-10">
                {[
                  { key: 'most_clicked', label: 'Most Clicked (Realtime)' },
                  { key: 'price_desc', label: 'Price ( High to Low )' },
                  { key: 'price_asc', label: 'Price ( Low to High )' },
                  { key: 'date_new', label: 'Date Updated ( new )' },
                  { key: 'date_old', label: 'Date Updated ( old )' }
                ].map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setIsSortOpen(false) }}
                    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-gray-50 ${sortKey === opt.key ? 'bg-gray-50' : ''}`}
                  >
                    <span className="text-sm text-gray-800">{opt.label}</span>
                    <span className={`w-3 h-3 rounded-full border ${sortKey === opt.key ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <div className="col-span-4 text-center text-gray-600">Loading tours...</div>
          ) : error ? (
            <div className="col-span-4 text-center text-red-600">{error}</div>
          ) : tours.length === 0 ? (
            <div className="col-span-4 text-center text-gray-600">No tours available</div>
          ) : (
            tours.slice(0,4).map((t) => (
              <TourCard key={t.id} tour={t} onClick={() => handleCardClick(t)} />
            ))
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Recently Viewed</h3>
          <Link to="/search" className="text-sm text-gray-600 hover:text-gray-800">See more</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.slice(0,4).map((t) => (
            <TourCard key={`recent-${t.id}`} tour={t} onClick={() => handleCardClick(t)} />
          ))}
        </div>
        <div className="flex items-center gap-6 my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <Link to="/search" className="text-sm font-medium text-custom-blue hover:underline">View all</Link>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        <StatsBanner />
        <h3 className="text-2xl font-semibold text-gray-900 mt-10 mb-6">You Might Like These</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map((t, idx) => (
            <ExperienceCard key={`exp-${t.id}`} image={t.image} title={t.name} price={t.price} liked={idx % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ToursSection


