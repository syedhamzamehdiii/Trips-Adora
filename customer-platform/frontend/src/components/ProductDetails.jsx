
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import {Check ,ChevronDown, Instagram, Linkedin, Facebook, Twitter, Globe, DollarSign, ShieldCheck, UsersRound, Phone, Headphones, Star, MessageCircle, MessageSquareText, MapPin, Clock, Droplet, UserPlus, Heart, ArrowUpRight, GitBranch, Map, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Itinerary from "../components/Itinerary"
import share from "../../assests/share.png";
import branch from "../../assests/middle.png";
import Footer from './Footer'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MainHeader from './MainHeader'
import TourCard from './TourCard'
import ClimateWidget from './ClimateWidget'
import SupplierChatModal from './SupplierChatModal'
import { getPublishedProducts, transformProductForFrontend, addRecentlyViewed, recordProductClick, getProductClicks, getProductById, getCachedPublishedProductsSync } from '../services/productService'

const ProductDetails = () => {
  const navigate = useNavigate()
  const { slug, id } = useParams()
  // Get identifier from either slug (for /tours/:slug) or id (for /product-details/:id)
  const identifier = slug || id
  
  // Instant render from cached list (no spinner)
  const initialFromCache = (() => {
    try {
      const cache = getCachedPublishedProductsSync().map(transformProductForFrontend)
      const normalize = (name) => String(name || '').toLowerCase().replace(/\s+/g,'-')
      return cache.find(p => normalize(p.name) === String((identifier || '')).toLowerCase() || String(p.id) === String(identifier)) || null
    } catch {
      return null
    }
  })()
  const [product, setProduct] = useState(initialFromCache)
  const hasLoadedOnceRef = useRef(false)
  const [loading, setLoading] = useState(!initialFromCache) // Only show loading if no cached data
  const [recommended, setRecommended] = useState([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClimateOpen, setIsClimateOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [imagesLoaded, setImagesLoaded] = useState(new Set())
  const [showAllImages, setShowAllImages] = useState(false)

  const images = useMemo(() => {
    if (!product) return []
    // Only use images from product data - no fallback images
    const imgs = Array.isArray(product.images) ? product.images : []
    const main = product.image ? [product.image] : []
    // de-dup main
    const others = imgs.filter(src => src !== product.image)
    const allImages = [...main, ...others].filter(img => img && img.trim() !== '')
    return allImages
  }, [product])

  const openGalleryAt = (index) => { setCurrentIndex(index); setIsGalleryOpen(true) }
  const closeGallery = () => setIsGalleryOpen(false)

  // Reset image errors when product changes
  useEffect(() => {
    setImageErrors(new Set())
    setImagesLoaded(new Set())
  }, [product?.id])

  const fetchProduct = useCallback(async () => {
    let cancelled = false
    try {
      // Only show loading if we don't have cached product and haven't loaded once
      if (!initialFromCache && !hasLoadedOnceRef.current) {
        setLoading(true)
      }
      
      if (!identifier) {
        if (!cancelled) setProduct(null)
        return
      }
      
      // IMPORTANT: Always fetch full product details by ID for detail page
      // The /published endpoint uses LIST_PROJECTION which excludes detail fields
      // We need to use /products/{id} endpoint to get all fields
      let found = null;
      
      // First, try to fetch by ID directly (this gets ALL fields)
      // Check if identifier looks like an ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(identifier));
      
      if (isObjectId) {
        // It's an ID, fetch directly (use cache)
        const byId = await getProductById(String(identifier), true);
        if (byId) {
          found = transformProductForFrontend(byId);
        }
      } else {
        // It's a slug, try to find in list first to get ID, then fetch full details
        const data = await getPublishedProducts({ page: 1, page_size: 50 }, true); // Use cache
        const list = (data.products || []).map(transformProductForFrontend);
        const normalize = (name) => String(name || '').toLowerCase().replace(/\s+/g,'-');
        
        // Find by slug
        const listProduct = list.find(p => normalize(p.name) === String(identifier).toLowerCase());
        
        if (listProduct && listProduct.id) {
          // Found in list, now fetch full details by ID (use cache)
          const byId = await getProductById(String(listProduct.id), true);
          if (byId) {
            found = transformProductForFrontend(byId);
          } else {
            // Fallback to list product if API fails
            found = listProduct;
          }
        } else {
          // Not found in list, try direct fetch anyway (use cache)
          const byId = await getProductById(String(identifier), true);
          if (byId) found = transformProductForFrontend(byId);
        }
      }
      
      if (!cancelled) {
        setProduct(found || null)
        if (found) addRecentlyViewed(found)
        hasLoadedOnceRef.current = true
      }
      
      // Recommended from explore (most clicked) - use list for recommendations
      const data = await getPublishedProducts({ page: 1, page_size: 50 })
      const list = (data.products || []).map(transformProductForFrontend)
      const clicks = getProductClicks()
      const sorted = list
        .map(p => ({ ...p, clicks: clicks[p.id] || 0 }))
        .filter(p => !found || p.id !== found.id)
        .sort((a,b) => b.clicks - a.clicks)
        .slice(0,4)
      if (!cancelled) setRecommended(sorted)
    } catch (error) {
      console.error('Error fetching product:', error)
      if (!cancelled && !initialFromCache) {
        setProduct(null)
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }, [identifier, initialFromCache])

  useEffect(() => {
    // If we have cached data, fetch fresh in background
    if (initialFromCache) {
      hasLoadedOnceRef.current = true
      setLoading(false)
      fetchProduct() // Fetch fresh data in background
    } else {
      // No cache, fetch immediately
      fetchProduct()
    }
  }, [identifier, fetchProduct]) // Include fetchProduct in dependencies

  
  // Ratings data for the Customer Reviews block
  const averageRating = 4.9
  const totalReviews = 347
  const ratingData = [
    { stars: 5, percentage: 75, count: 287 },
    { stars: 4, percentage: 40, count: 142 },
    { stars: 3, percentage: 33, count: 42 },
    { stars: 2, percentage: 16, count: 8 },
    { stars: 1, percentage: 0, count: 0 },
  ]

  if (loading && !product && !hasLoadedOnceRef.current) {
    return (
      <div className="min-h-screen bg-white font-poppins">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-600">Loading...</div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-poppins">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-600">Product not found</div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Product Header */}
            <div className="mb-6">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">Product ID: {product.id}</p>
              
              {/* Main Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-3">{product.name}</h1>
              
              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Hiking
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Adventure
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Nature
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Food
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Photography
                </span>
              </div>
              
              {/* Description */}
              <p className="text-black text-sm sm:text-base lg:text-lg mb-3">{product.tagline || product.description}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-black text-sm sm:text-base">4.8 (342 reviews)</span>
              </div>
            </div>
            
            {/* Image Gallery - Improved layout with better spacing */}
            {images.length > 0 && (
              <div className="mb-6 sm:mb-8">
                {!showAllImages ? (
                  // Compact view: Main image + 3 thumbnails with minimal gap and bottom alignment
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-1.5 overflow-hidden rounded-lg">
                    <div className="sm:col-span-3 h-48 sm:h-64 lg:h-80 xl:h-96">
                      {images[0] && !imageErrors.has(images[0]) && (
                        <img 
                          src={images[0]} 
                          alt={product.name || "Product image"}
                          className="w-full h-full object-cover cursor-pointer rounded-lg hover:opacity-95 transition-opacity"
                          onClick={() => openGalleryAt(0)}
                          onError={(e) => {
                            setImageErrors(prev => new Set([...prev, images[0]]))
                            e.target.style.display = 'none'
                          }}
                          onLoad={() => setImagesLoaded(prev => new Set([...prev, images[0]]))}
                          loading="eager"
                        />
                      )}
                    </div>
                    <div className="sm:col-span-1 h-48 sm:h-64 lg:h-80 xl:h-96 flex flex-col justify-end gap-1 sm:gap-1.5">
                      {images.slice(1, 4).map((img, idx) => {
                        // Calculate thumbnail height to fill space evenly
                        const thumbnailCount = images.length > 4 ? 3 : images.slice(1, 4).length
                        const gapCount = thumbnailCount - 1
                        const totalGaps = gapCount * 4 // gap-1 = 4px, gap-1.5 = 6px (using 4px for calculation)
                        // For responsive, we'll use flex-1 to distribute space
                        return (
                          img && !imageErrors.has(img) && (
                            <img 
                              key={idx + 1}
                              src={img}
                              alt={`${product.name || "Product"} thumbnail ${idx + 1}`}
                              className="w-full flex-1 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity min-h-0"
                              onClick={() => openGalleryAt(idx + 1)}
                              onError={(e) => {
                                setImageErrors(prev => new Set([...prev, img]))
                                e.target.style.display = 'none'
                              }}
                              onLoad={() => setImagesLoaded(prev => new Set([...prev, img]))}
                              loading="lazy"
                            />
                          )
                        )
                      })}
                      {images.length > 4 && (
                        <button
                          onClick={() => setShowAllImages(true)}
                          className="w-full flex-1 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-lg flex items-center justify-center text-sm sm:text-base font-semibold transition-colors min-h-0"
                        >
                          +{images.length - 4} More
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Expanded view: Grid of all images
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-bold text-black">All Photos ({images.length})</h3>
                      <button
                        onClick={() => setShowAllImages(false)}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                      >
                        Show Less
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {images.map((img, idx) => (
                        img && !imageErrors.has(img) && (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img 
                              src={img}
                              alt={`${product.name || "Product"} image ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                              onClick={() => openGalleryAt(idx)}
                              onError={(e) => {
                                setImageErrors(prev => new Set([...prev, img]))
                                e.target.style.display = 'none'
                              }}
                              onLoad={() => setImagesLoaded(prev => new Set([...prev, img]))}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gallery Modal - Only show if images exist */}
            {isGalleryOpen && images.length > 0 && images[currentIndex] && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4" onClick={closeGallery}>
                <div className="relative w-full max-w-6xl" onClick={(e)=>e.stopPropagation()}>
                  {/* Close button */}
                  <button
                    onClick={closeGallery}
                    className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg"
                    aria-label="Close gallery"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <img 
                      src={images[currentIndex]} 
                      alt={`${product.name || "Product"} gallery image ${currentIndex + 1}`} 
                      className="w-full max-h-[80vh] object-contain mx-auto" 
                    />
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
                        {images.map((src, idx)=> (
                          <img
                            key={idx}
                            src={src}
                            alt={`thumb-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentIndex(idx)
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                            className={`h-14 w-20 object-cover rounded-md cursor-pointer border-2 transition-all ${
                              currentIndex === idx 
                                ? 'border-[#284078] ring-2 ring-[#E1E3FF] scale-110' 
                                : 'border-white/50 hover:border-white'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* About this Experience */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">About this Experience</h2>
              <p className="text-black leading-relaxed text-sm sm:text-base">{product.description || 'Experience an unforgettable tour.'}</p>
            </div>
            
            {/* Climate content is shown in a modal, not inline */}

            {/* Trip Highlights - Added by supplier */}
            {Array.isArray(product.highlights) && product.highlights.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="border border-[#302E2E] rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#302E2E] mb-3 sm:mb-4">Trip Highlights</h2>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3">Added by supplier named: Highlights</p>
                  <ul className="space-y-2 sm:space-y-3">
                    {product.highlights.map((h, idx) => {
                      const text = typeof h === 'string' ? h : (h.text || '');
                      return text ? (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                            <span className="text-[#302E2E] text-sm">✓</span>
                          </div>
                          <span className="text-[#302E2E] text-sm sm:text-base">{text}</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* What's Included and What's Excluded - Added by supplier */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* What's Included */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">What's Included</h2>
                <p className="text-gray-500 text-xs sm:text-sm mb-3">Added by supplier</p>
                {Array.isArray(product.includedItems) && product.includedItems.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {product.includedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                        </div>
                        <span className="text-black text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No items listed</p>
                )}
              </div>

              {/* What's Excluded */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">What's Excluded</h2>
                <p className="text-gray-500 text-xs sm:text-sm mb-3">Added by supplier</p>
                {Array.isArray(product.excludedItems) && product.excludedItems.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {product.excludedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border border-red-300 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-red-500 text-xs">✗</span>
                        </div>
                        <span className="text-black text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No items listed</p>
                )}
              </div>

              {/* Vehicles Available */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">Vehicles available</h2>
                <div className="space-y-3 sm:space-y-4">
                  {(product.vehicles || []).length > 0 ? (
                    product.vehicles.map((v, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <p className="text-black font-bold text-sm sm:text-base mb-1">
                          {v.model || v.type || 'Vehicle'} {v.year ? `(${v.year})` : ''}
                        </p>
                        {v.capacity && (
                          <p className="text-gray-500 text-xs sm:text-sm">Up to {v.capacity} Passengers</p>
                        )}
                        {v.type && v.type !== v.model && (
                          <p className="text-gray-500 text-xs sm:text-sm">Type: {v.type}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No vehicles listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Details Section - Guide Type, Things to Carry, Accessibility */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">Trip Details</h2>
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                {/* Guide Type */}
                {product.guideType && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">Guide Type</h3>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base ml-6">{product.guideType}</p>
                  </div>
                )}

                {/* Things to Carry */}
                {product.thingsToCarry && product.thingsToCarry.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">Things to Carry</h3>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {product.thingsToCarry.map((item, idx) => (
                        <li key={idx} className="text-gray-700 text-sm sm:text-base">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accessibility */}
                {product.accessibility && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">Accessibility</h3>
                    </div>
                    <div className="ml-6 space-y-2">
                      {product.accessibility.wheelchair_accessible && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Wheelchair accessible
                        </p>
                      )}
                      {product.accessibility.service_animals_allowed && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Service animals allowed
                        </p>
                      )}
                      {product.accessibility.infant_seat_available && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Infant seat available
                        </p>
                      )}
                      {product.accessibility.stroller_friendly && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Stroller friendly
                        </p>
                      )}
                      {!product.accessibility.wheelchair_accessible && 
                       !product.accessibility.service_animals_allowed && 
                       !product.accessibility.infant_seat_available && 
                       !product.accessibility.stroller_friendly && (
                        <p className="text-gray-500 text-sm">No accessibility features listed</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-6">
              {/* Tour Provider */}
              <div className="mb-4 sm:mb-6 bg-[#F0F4FE] p-3 sm:p-4 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-black">{product.host || 'TripsAdora'}</h3>
                  <span className="bg-[#00A63E] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-black font-bold text-sm sm:text-base">4.8</span>
                </div>
                
                <p className="text-gray-600 text-xs sm:text-sm mb-1">2,840 followers</p>
                <p className="text-gray-600 text-xs sm:text-sm mb-4">156 Tours completed</p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="bg-[#C5FFD0] text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    Following
                  </button>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="bg-white border border-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  >
                    Chat
                  </button>
                  <button
                    className="bg-white border border-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    onClick={() => setIsClimateOpen(true)}
                  >
                    Climate
                  </button>
                </div>
              </div>

              {/* Icons pill container */}
              <div className="mb-6">
                <div className="bg-[#F0F4FE] border border-gray-200 rounded-full px-6 py-2 flex items-center justify-between shadow-md">
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900 hover:text-red-500">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-900">
                    <img src={share} alt="Share" className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate('/comparison')}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <img src={branch} alt="Compare" className="w-5 h-5" />
                  </button>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900">
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Tour Details */}
              <div className="mb-4 sm:mb-6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Languages - from product data */}
                  {product.languages && product.languages.length > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MessageSquareText className="w-4 h-4 text-gray-600" />
                      <span className="text-black text-sm sm:text-base">{product.languages.join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-black text-sm sm:text-base">{product.location}</span>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-black text-sm sm:text-base">{product.duration}</span>
                  </div>
                  
                  {/* Activity Type - from product data */}
                  {product.activity_type && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Droplet className="w-4 h-4 text-gray-600" />
                      <span className="text-black text-sm sm:text-base">{product.activity_type}</span>
                    </div>
                  )}
                  
                  {/* Guide Type - from product data */}
                  {product.guideType && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <UserPlus className="w-4 h-4 text-gray-600" />
                      <span className="text-black text-sm sm:text-base">Guide: {product.guideType}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <UserPlus className="w-4 h-4 text-gray-600" />
                    <span className="text-[#34A853] text-sm sm:text-base font-bold">Free cancellation</span>
                  </div>
                  
                  <div className="pt-2">
                    <a href="#" className="text-gray-500 underline text-xs sm:text-sm">
                      See all the visiting places in Tokyo
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Pricing */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline justify-start">
                  <span className="text-black font-bold text-sm sm:text-base">Total</span>
                  <div className="flex items-baseline gap-2 ml-2">
                    <span className="text-xl sm:text-2xl font-bold text-[#00A63E]">$258</span>
                    <span className="text-gray-600 text-xs sm:text-sm">Per Person</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <button 
                  onClick={() => navigate('/check-availability', { 
                    state: { 
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      location: product.location,
                      rating: product.rating,
                      duration: product.duration
                    } 
                  })}
                  className="bg-[#34A853] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base whitespace-nowrap shadow-md hover:bg-[#2d8f47] transition"
                >
                  Check Availability
                </button>
                <button 
                  onClick={() => {
                    // Get or initialize cart from localStorage
                    const savedCart = localStorage.getItem('cart')
                    const cart = savedCart ? JSON.parse(savedCart) : []
                    
                    // Create cart item object
                    const cartItem = {
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      price: product.price,
                      rating: product.rating,
                      reviews: String(product.reviewsCount || '0'),
                      tags: product.tags || [],
                      host: product.host || 'TripsAdora',
                      duration: product.duration,
                      groupSize: product.groupSize || 'Up to 12',
                      location: product.location
                    }
                    
                    // Check if item is already in cart
                    const isInCart = cart.some(item => item.id === cartItem.id)
                    
                    if (!isInCart) {
                      // Add to cart
                      const updatedCart = [...cart, cartItem]
                      localStorage.setItem('cart', JSON.stringify(updatedCart))
                    }
                    
                    // Navigate to cart page
                    navigate('/cart')
                  }}
                  className="bg-white border border-gray-300 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base whitespace-nowrap shadow hover:bg-gray-50 transition"
                >
                  Add to Cart
                </button>
              </div>
              
              {/* Quick Detail */}
              <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3">
                  Quick Detail
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 border border-[#34A853] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 text-[#34A853]" />
                    </div>
                    <span className="text-black text-xs sm:text-sm font-bold">
                      Free cancellation up to 24 hours
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 border border-[#34A853] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 text-[#34A853]" />
                    </div>
                    <span className="text-black text-xs sm:text-sm">
                      Instant confirmation
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 border border-[#34A853] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 text-[#34A853]" />
                    </div>
                    <span className="text-black text-xs sm:text-sm">
                      Mobile ticket accepted
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Modal */}
        {isClimateOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4" onClick={() => setIsClimateOpen(false)}>
            <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              {/* Borderless container with floating close button */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <button
                  aria-label="Close"
                  className="absolute right-3 top-3 z-10 bg-white/90 hover:bg-white text-gray-900 px-3 py-1 rounded-full text-sm"
                  onClick={() => setIsClimateOpen(false)}
                >
                  Close
                </button>
                <ClimateWidget productName={product.name} productLocation={product.location} />
              </div>
            </div>
          </div>
        )}

        {/* Meeting Points - Full width - Matching supplier design */}
        {Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2">Meeting Points</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-4">Choose your convenient pickup location</p>
            <div className="rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {product.meetingPoints.map((loc, idx) => {
                  const locationName = typeof loc === 'string' ? loc : (loc.name || loc || 'Pickup Location');
                  const address = typeof loc === 'object' ? (loc.address || '') : '';
                  const time = product.pickupTime || (typeof loc === 'object' ? loc.time : '') || '8:00 AM';
                  
                  return (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MapPin className="w-5 h-5 text-[#0E1DC4] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-black text-sm sm:text-base mb-1">{locationName}</h3>
                            {address && (
                              <p className="text-gray-500 text-xs sm:text-sm">{address}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 flex-shrink-0">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700 text-xs sm:text-sm font-medium">{time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hotel Pickup Banner */}
        <div className="bg-[#E5EDFF75] rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="font-bold text-black text-sm sm:text-base mb-2">Hotel Pickup Available:</h3>
          <p className="text-black text-sm sm:text-base">
            We offer complimentary pickup from most hotels in Fira, Oia, and Kamari areas. 
            Please confirm your location when booking.
          </p>
        </div>

        {/* Tour Itinerary - Matching supplier design */}
        {Array.isArray(product.itineraries) && product.itineraries.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Tour Itinerary</h2>
            <p className="text-gray-500 mb-6">Your personalized travel plan at a glance</p>
            
            {/* Tour Type Bar */}
            <div className="mb-8">
              <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 relative">
                  <Clock className="w-5 h-5 text-white" />
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-600"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-black">One day Tour</h3>
                  <p className="text-sm text-gray-600">(06:00 - 23:15)</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-300"></div>

              {/* Pick-up Location */}
              {Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0 && (
                <div className="flex items-start mb-8 relative">
                  <div className="w-8 h-8 border-2 border-green-700 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                    <MapPin className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Pick-up</h3>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {product.meetingPoints.slice(0, 3).map((loc, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {typeof loc === 'string' ? loc : (loc.name || loc)}
                        </span>
                      ))}
                    </div>
                    {product.pickupTime && (
                      <p className="text-sm text-gray-600">Time: {product.pickupTime}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Itinerary Stops */}
              {product.itineraries.map((item, index) => {
                const location = item.location || item.title || item.name || `Stop ${index + 1}`;
                const description = item.description || '';
                const timeSpent = item.timeSpent || '';
                const isFree = item.isFree !== false;
                const photo = item.photo || null;
                const attractionType = item.attractionType || '';
                const activities = item.activities || [];
                
                return (
                  <div key={index} className="flex items-start mb-8 relative">
                    <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10 overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={location} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-sm font-semibold text-gray-800">
                          {location[0]?.toUpperCase() || String(index + 1)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">{location}</h3>
                      {description && (
                        <p className="text-gray-600 mb-3">{description}</p>
                      )}
                      
                      {/* Activities */}
                      {(attractionType || activities.length > 0) && (
                        <div className="mb-3">
                          <p className="text-gray-600 font-bold mb-2">Activities:</p>
                          <div className="flex flex-wrap gap-2">
                            {attractionType && (
                              <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{attractionType}</span>
                            )}
                            {activities.map((act, idx) => (
                              <span key={idx} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{act}</span>
                            ))}
                            {!attractionType && activities.length === 0 && (
                              <>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Sightseeing & Photography</span>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Food & Drink</span>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Cultural visit</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Time and Ticket Info */}
                      <div className="flex items-center gap-2">
                        {isFree && (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                            Ticket: Free
                          </span>
                        )}
                        {timeSpent && (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                            {timeSpent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Finished - Return */}
              <div className="flex items-start mb-8 relative">
                <div className="w-8 h-8 border-2 border-blue-700 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                  <ArrowUpRight className="w-4 h-4 text-blue-700 rotate-180" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-black">Finished - Return</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="max-w-6xl mx-auto p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>

            {/* Reviews Overview Box */}
            <div className="flex gap-6 mb-6">
              {/* Left Side - Overall Rating with Background */}
              <div className="bg-[#F4F7FF] rounded-lg px-6 py-10 flex flex-col items-center justify-center w-15 h-28 mt-28">
                <div className="text-5xl font-bold text-[#3B69E2] mb-3">{averageRating}</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : star === Math.ceil(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-none text-gray-900 stroke-2'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{totalReviews} Reviews</p>
              </div>

              {/* Right Side - Rating Breakdown with White Background */}
              <div className="flex-1 bg-white rounded-lg p-6 space-y-3">
                {ratingData.map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-11">
                      <span className="text-sm font-medium text-gray-700">{rating.stars}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>

                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3B69E2] rounded-full transition-all"
                        style={{ width: `${rating.percentage}%` }}
                      ></div>
                    </div>

                    <span className="text-sm font-medium text-gray-700 w-8 text-right">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6 mt-8">
              {[1, 2, 3, 4, 5].map((review) => (
                <div key={review} className="flex gap-4 bg-white shadow-md rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#3B69E2]">S</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Sarah Jhonson</h4>
                        <p className="text-xs text-gray-500">August 2025</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((s) => (
                          <Star key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        ))}
                        <Star className="w-4 h-4 text-gray-900" fill="none" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Absolutely incredible experience! Our guide Maria was knowledgeable and the sunset views were breathtaking. The small group size made it feel very personal and intimate.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Tours */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-black">Recommended Tours</h2>
            <p className="text-gray-500 text-sm mt-1">Discover more amazing experiences around the world</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommended.map((t) => (
              <TourCard key={t.id} tour={t} onClick={() => { recordProductClick(t.id); navigate(`/tours/${encodeURIComponent(t.name?.toLowerCase().replace(/\s+/g,'-'))}`) }} />
            ))}
          </div>
        </div>

        {/* Divider above footer */}
        <div className="mt-12 border-t border-gray-200"></div>
      </div>

      <Footer />

      {/* Supplier Chat Modal */}
      <SupplierChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        supplierName={product?.supplierBusinessName || product?.supplier_business_name}
        supplierId={product?.supplierId || product?.supplier_id}
        supplierRating={product?.rating || 4.8}
        supplierReviews={product?.reviewsCount || 342}
        supplierFollowers={2840}
        supplierVerified={true}
        productId={product?.id}
        customerId={localStorage.getItem('customer_profile_user_id') || 'default-customer'}
      />
    </div>
  )
}

export default ProductDetails