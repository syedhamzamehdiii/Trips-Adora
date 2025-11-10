
import React, { useEffect, useMemo, useState } from 'react'
import {Check ,ChevronDown, Instagram, Linkedin, Facebook, Twitter, Globe, DollarSign, ShieldCheck, UsersRound, Phone, Headphones, Star, MessageCircle, MessageSquareText, MapPin, Clock, Droplet, UserPlus, Heart, ArrowUpRight, GitBranch, Map, ChevronLeft, ChevronRight } from 'lucide-react'
import Itinerary from "../components/Itinerary"
import maine from "../../assests/main.png";
import heroimage  from "../../assests/hero-image-side.png";
import heroimage2 from "../../assests/hero-image-side2.png";
import heroimage3 from "../../assests/hero-image-side3.png";
import share from "../../assests/share.png";
import branch from "../../assests/middle.png";
import Footer from './Footer'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MainHeader from './MainHeader'
import helicopter from "../../assests/helicopter.jpg";
import sunshine from "../../assests/sun-shine.jpg";
import house from "../../assests/house.jpg";
import mountfuj from "../../assests/mount-fuj.jpg";
import TourCard from './TourCard'
import ClimateWidget from './ClimateWidget'
import { getPublishedProducts, transformProductForFrontend, addRecentlyViewed, recordProductClick, getProductClicks, getProductById, getCachedPublishedProductsSync } from '../services/productService'

const ProductDetails = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  // Instant render from cached list (no spinner)
  const initialFromCache = (() => {
    try {
      const cache = getCachedPublishedProductsSync().map(transformProductForFrontend)
      const normalize = (name) => String(name || '').toLowerCase().replace(/\s+/g,'-')
      return cache.find(p => normalize(p.name) === String((slug || '')).toLowerCase() || String(p.id) === String(slug)) || null
    } catch {
      return null
    }
  })()
  const [product, setProduct] = useState(initialFromCache)
  const [loading, setLoading] = useState(true)
  const [recommended, setRecommended] = useState([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClimateOpen, setIsClimateOpen] = useState(false)

  const images = useMemo(() => {
    if (!product) return []
    const imgs = Array.isArray(product.images) ? product.images : []
    const main = product.image ? [product.image] : []
    // de-dup main
    const others = imgs.filter(src => src !== product.image)
    return [...main, ...others]
  }, [product])

  const openGalleryAt = (index) => { setCurrentIndex(index); setIsGalleryOpen(true) }
  const closeGallery = () => setIsGalleryOpen(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        // Try to find by slug in published list
        const data = await getPublishedProducts({ page: 1, page_size: 50 })
        const list = (data.products || []).map(transformProductForFrontend)
        const normalize = (name) => String(name || '').toLowerCase().replace(/\s+/g,'-')
        let found = list.find(p => normalize(p.name) === String(slug || '').toLowerCase())
        if (!found) {
          // fallback: maybe slug is id
          const byId = await getProductById(String(slug))
          if (byId) found = transformProductForFrontend(byId)
        }
        if (!cancelled) {
          setProduct(found || null)
          if (found) addRecentlyViewed(found)
        }
        // Recommended from explore (most clicked)
        const clicks = getProductClicks()
        const sorted = list
          .map(p => ({ ...p, clicks: clicks[p.id] || 0 }))
          .filter(p => !found || p.id !== found.id)
          .sort((a,b) => b.clicks - a.clicks)
          .slice(0,4)
        if (!cancelled) setRecommended(sorted)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    // Reduced network chatter: no visibility or global refresh listeners here
    return () => { cancelled = true }
  }, [slug])

  
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

  if (loading && !product) {
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
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#77FF90AD] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Best Seller
                </span>
                <span className="bg-[#C42121] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Live
                </span>
              </div>
              
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
            
            {/* Image Gallery */}
            <div className="mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="sm:col-span-3">
                  <img 
                    src={images[0] || maine} 
                    alt="Mount Fuji tour main image"
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(0)}
                  />
                </div>
                <div className="sm:col-span-1 grid grid-cols-3 sm:grid-cols-1 gap-2">
                  <img 
                    src={images[1] || heroimage}
                    alt="Mount Fuji tour thumbnail 1"
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(1)}
                  />
                  <img 
                    src={images[2] || heroimage2}
                    alt="Mount Fuji tour thumbnail 2"
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(2)}
                  />
                  <img 
                    src={images[3] || heroimage3}
                    alt="Mount Fuji tour thumbnail 3"
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(3)}
                  />
                </div>
              </div>
            </div>

            {/* Gallery Modal */}
            {isGalleryOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4" onClick={closeGallery}>
                <div className="relative w-full max-w-5xl" onClick={(e)=>e.stopPropagation()}>
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={images[currentIndex]} alt="gallery" className="w-full max-h-[70vh] object-contain" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-2 py-2">
                      {images.map((src, idx)=> (
                        <img
                          key={idx}
                          src={src}
                          alt={`thumb-${idx}`}
                          onClick={()=> setCurrentIndex(idx)}
                          className={`h-12 w-16 object-cover rounded-md cursor-pointer border ${currentIndex===idx? 'border-[#284078] ring-2 ring-[#E1E3FF]':'border-white'} `}
                        />
                      ))}
                    </div>
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

            {/* Trip Highlights */}
            <div className="mb-6 sm:mb-8">
              <div className="border border-[#302E2E] rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#302E2E] mb-3 sm:mb-4">Trip Highlights</h2>
                <ul className="space-y-2 sm:space-y-3">
                  {(product.highlights && product.highlights.length ? product.highlights : [
                    { text: 'Visit the most iconic landmarks and hidden gems' },
                    { text: 'Small group size for personalized experience' },
                    { text: 'Complimentary refreshments and snacks' },
                    { text: 'Expert local guide with insider knowledge' },
                    { text: 'All entrance fees and transportation included' },
                    { text: 'Photo opportunities at scenic viewpoints' }
                  ]).slice(0,6).map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                      <span className="text-[#302E2E] text-sm sm:text-base">{h.text || h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What's Included and Vehicles Available */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* What's Included */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">What's Included</h2>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">Professional tour guide</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">Transportation in air-conditioned vehicle</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">All entrance tickets and fees</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">Lunch at local restaurant</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">Bottled water and snacks</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">Hotel pickup and drop-off</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                    </div>
                    <span className="text-black text-sm sm:text-base">Travel insurance</span>
                  </li>
                </ul>
              </div>

              {/* Vehicles Available */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">Vehicles available</h2>
                <div className="space-y-3 sm:space-y-4">
                  {(product.vehicles || []).length > 0 ? (
                    product.vehicles.map((v, idx) => (
                      <div key={idx}>
                        <p className="text-black font-bold text-sm sm:text-base">{v.model || v.type || 'Vehicle'}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">{v.capacity ? `Up to ${v.capacity} Passengers` : ''}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No vehicles listed</p>
                  )}
                </div>
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
                  <button className="bg-white border border-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
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
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MessageSquareText className="w-4 h-4 text-gray-600" />
                  <span className="text-black text-sm sm:text-base">English, Japanese</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-black text-sm sm:text-base">{product.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-black text-sm sm:text-base">{product.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Droplet className="w-4 h-4 text-gray-600" />
                    <span className="text-black text-sm sm:text-base">Customised/Private</span>
                  </div>
                  
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

        {/* Meeting Points - Full width */}
        {Array.isArray(product.meetingPoints) && product.meetingPoints.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2">Meeting Points</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-4">Choose your convenient pickup location</p>
            <div className="rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {product.meetingPoints.map((loc, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#0E1DC4] mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-black text-sm sm:text-base">{typeof loc === 'string' ? loc : (loc.name || 'Pickup Location')}</h3>
                        {typeof loc === 'object' && loc.address && (
                          <p className="text-gray-500 text-xs sm:text-sm">{loc.address}</p>
                        )}
                      </div>
                      {(product.pickupTime || (typeof loc === 'object' && loc.time)) && (
                        <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">{(typeof loc === 'object' && loc.time) || product.pickupTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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

        <Itinerary items={Array.isArray(product.itineraries) ? product.itineraries.map(it => ({
          title: it.title || it.name,
          time: it.time,
          description: it.description,
          ticket: it.ticket,
          activities: it.activities || []
        })) : []} />

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
    </div>
  )
}

export default ProductDetails