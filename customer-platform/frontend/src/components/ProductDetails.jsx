
import React, { useState } from 'react'
import {Check ,ChevronDown, Instagram, Linkedin, Facebook, Twitter, Globe, DollarSign, ShieldCheck, UsersRound, Phone, Headphones, Star, MessageCircle, MessageSquareText, MapPin, Clock, Droplet, UserPlus, Heart, ArrowUpRight, GitBranch, Map, ChevronLeft, ChevronRight } from 'lucide-react'
import Itinerary from "../components/Itinerary"
import maine from "../../assests/main.png";
import heroimage  from "../../assests/hero-image-side.png";
import heroimage2 from "../../assests/hero-image-side2.png";
import heroimage3 from "../../assests/hero-image-side3.png";
import share from "../../assests/share.png";
import branch from "../../assests/middle.png";
import Footer from './Footer'
import { Link } from 'react-router-dom'
import MainHeader from './MainHeader'

const ProductDetails = () => {
  const [selectedTab, setSelectedTab] = useState('oneDay')
  const [reviewText, setReviewText] = useState('')
  const images = [maine, heroimage, heroimage2, heroimage3]
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const openGalleryAt = (index) => { setCurrentIndex(index); setIsGalleryOpen(true) }
  const closeGallery = () => setIsGalleryOpen(false)

  
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

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Product Header */}
            <div className="mb-6">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">Product ID: 685928</p>
              
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-3">
                Mount Fuji Highlights & English guided Tour
              </h1>
              
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
              <p className="text-black text-sm sm:text-base lg:text-lg mb-3">
                Experience the best of Mount Fuji, Japan
              </p>
              
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
                    src={maine} 
                    alt="Mount Fuji tour main image"
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(0)}
                  />
                </div>
                <div className="sm:col-span-1 grid grid-cols-3 sm:grid-cols-1 gap-2">
                  <img 
                    src={heroimage}
                    alt="Mount Fuji tour thumbnail 1"
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(1)}
                  />
                  <img 
                    src={heroimage2}
                    alt="Mount Fuji tour thumbnail 2"
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => openGalleryAt(2)}
                  />
                  <img 
                    src={heroimage3}
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
              <p className="text-black leading-relaxed text-sm sm:text-base">
                Discover the magic of Tokyo, Japan with our comprehensive tour experience. 
                This carefully curated journey takes you through the most iconic landmarks and hidden gems, 
                offering a perfect blend of culture, history, and adventure. Our expert guides will ensure 
                you have an unforgettable experience filled with memorable moments and fascinating insights.
              </p>
            </div>
            
            {/* Trip Highlights */}
            <div className="mb-6 sm:mb-8">
              <div className="border border-[#302E2E] rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#302E2E] mb-3 sm:mb-4">Trip Highlights</h2>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                    <span className="text-[#302E2E] text-sm sm:text-base">Visit the most iconic landmarks and hidden gems</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                    <span className="text-[#302E2E] text-sm sm:text-base">Small group size for personalized experience</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                    <span className="text-[#302E2E] text-sm sm:text-base">Complimentary refreshments and snacks</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                    <span className="text-[#302E2E] text-sm sm:text-base">Expert local guide with insider knowledge</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                    <span className="text-[#302E2E] text-sm sm:text-base">All entrance fees and transportation included</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                      <span className="text-[#302E2E] text-sm">✓</span>
                    </div>
                    <span className="text-[#302E2E] text-sm sm:text-base">Photo opportunities at scenic viewpoints</span>
                  </li>
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
                  <div>
                    <p className="text-black font-bold text-sm sm:text-base">Lexus LS 500h</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Up to 2 Passengers</p>
                  </div>
                  <div>
                    <p className="text-black font-bold text-sm sm:text-base">Mercedes-Benz S-Class</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Up to 2 Passengers</p>
                  </div>
                  <div>
                    <p className="text-black font-bold text-sm sm:text-base">BMW 7 Series</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Up to 3 Passengers</p>
                  </div>
                  <div>
                    <p className="text-black font-bold text-sm sm:text-base">Toyota Alphard</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Up to 4 Passengers</p>
                  </div>
                  <div>
                    <p className="text-black font-bold text-sm sm:text-base">Toyota Vellfire</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Up to 8 Passengers</p>
                  </div>
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
                  <h3 className="text-base sm:text-lg font-bold text-black">Karwaan Tours</h3>
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
                  <button className="bg-white border border-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
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
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900">
                    <img src={branch} alt="Branch" className="w-5 h-5" />
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
                    <span className="text-black text-sm sm:text-base">Tokyo city, Japan</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-black text-sm sm:text-base">8 hours</span>
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
                <button className="bg-[#34A853] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base whitespace-nowrap shadow-md">
                  Check Availability
                </button>
                <button className="bg-white border border-gray-300 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base whitespace-nowrap shadow">
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

        {/* Meeting Points - Full width */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2">Meeting Points</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-4">Choose your convenient pickup location</p>
          <div className="rounded-lg p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0E1DC4] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-sm sm:text-base">Main Hotel Lobby</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">123 Main Street Tokyo, Japan</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">8:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0E1DC4] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-sm sm:text-base">Central Station</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">456 Station Plaza Tokyo, Japan</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">8:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#284078] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-sm sm:text-base">City Hall Square</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">789 Square Ave Tokyo, Japan</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">8:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#284078] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-sm sm:text-base">Tokyo Skytree</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">Sumida City, Tokyo, Japan</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">8:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Pickup Banner */}
          <div className="bg-[#E5EDFF75] rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
            <h3 className="font-bold text-black text-sm sm:text-base mb-2">Hotel Pickup Available:</h3>
            <p className="text-black text-sm sm:text-base">
              We offer complimentary pickup from most hotels in Fira, Oia, and Kamari areas. 
              Please confirm your location when booking.
            </p>
          </div>
        </div>

        <Itinerary />

        {/* Customer Reviews */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="max-w-4xl mx-auto p-6 bg-white">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">438 Reviews</h3>

              {/* Add Review Input */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border-[3px] border-[#284078] flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-[#284078]">U</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg"> 🙂</span>
                    <input
                      type="text"
                      placeholder="Add your review"
                      className="flex-1 text-sm text-gray-500 outline-none border-b border-gray-300 pb-1 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800">
                      Cancel
                    </button>
                    <button className="px-4 py-1.5 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
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
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <button className="text-[#284078] font-bold text-sm hover:text-[#284078]">
              See more
            </button>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-black">Recommended Tours</h2>
            <p className="text-gray-500 text-sm mt-1">Discover more amazing experiences around the world</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {img:'/assests/place1.jpg', title:'Mount Fuji Highlights & Hidden Gems Tour'},
              {img:'/assests/place2.jpg', title:'Hakoney Highlights & Hidden Gems Tour'},
              {img:'/assests/place3.jpg', title:'Tokyo Highlights & Hidden Gems Tour'},
              {img:'/assests/place1.jpg', title:'Burj Khalifa Highlights & Hidden Gems Tour'}
            ].map((t,idx)=> (
              <Link key={idx} to={`/tour/${idx + 1}`}>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow h-full flex flex-col">
                  <div className="relative">
                    <img src={t.img} alt={t.title} className="w-full h-52 object-cover" />
                    <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-[11px] text-gray-500 mb-1 flex">
                      <MapPin className="w-4 h-4 text-gray-700" />
                      Tokyo, Japan
                    </div>
                    <h3 className="text-sm font-semibold text-black leading-snug line-clamp-2 mb-2">{t.title}</h3>
                    <div className="flex items-center text-[11px] text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className='font-semibold'>(4.8)</span>
                      </div>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>8h</span>
                      </div>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1">
                        <UsersRound className="w-3 h-3" />
                        <span>Up to 12</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="text-sm">
                        <span className="text-[#808080] line-through mr-1">$829</span>
                        <span className="font-bold text-[#808080]">$719</span>
                        <span className="text-[11px] text-gray-500 ml-1">/person</span>
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-[#808080] text-white text-sm">Book Now</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider above footer */}
        <div className="mt-12 border-t border-gray-200"></div>
      </div>

      {/* Footer */}
      <footer className="bg-[#284078] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li><a href="#">About us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Articles</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Partner With Us</h4>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li><a href="#">Become a Partner</a></li>
                <li><a href="#">Join as an Affiliate</a></li>
                <li><a href="#">Partner Login</a></li>
                <li><a href="#">Collaboration Inquiries</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Explore</h4>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li><a href="#">Product Features</a></li>
                <li><a href="#">Case Studies</a></li>
                <li><a href="#">Resources</a></li>
                <li><a href="#">Customer Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Instagram size={18} className="text-[#284078]"/>
                </div>
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Linkedin size={18} className="text-[#284078]"/>
                </div>
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Facebook size={18} className="text-[#284078]"/>
                </div>
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Twitter size={18} className="text-[#284078]"/>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Language</h4>
                <button className="w-full bg-white text-[#284078] rounded-lg px-3 py-2 text-sm flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-2"><Globe size={16}/> US English</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Currency</h4>
                <button className="w-full bg-white text-[#284078] rounded-lg px-3 py-2 text-sm flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-2"><DollarSign size={16}/> USD - US Dollar</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {['mc','gpay','visa','apple','paypal','discover'].map((k,i)=> (
              <div key={i} className="w-14 h-9 bg-white rounded flex items-center justify-center">
                <span className="text-xs text-gray-700">{k.toUpperCase()}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/30 pt-4 flex flex-wrap items-center justify-between text-gray-200 text-xs">
            <div>© 2025 TripAdora. All rights reserved.</div>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2"><ShieldCheck size={16}/> Secure Booking</div>
              <div className="flex items-center gap-2"><UsersRound size={16}/> 10M+ Travels</div>
              <div className="flex items-center gap-2"><Phone size={16}/> +1-800-Travel</div>
              <div className="flex items-center gap-2"><Headphones size={16}/> 24/7 Support</div>
            </div>
          </div>
        </div>
      </footer>
      <Footer />
    </div>
  )
}

export default ProductDetails