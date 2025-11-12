import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronDown, FiShoppingCart } from 'react-icons/fi'
import SettingsModal from './SettingsModal'
import AttractionsDropdown from './AttractionsDropdown'
import DestinationsDropdown from './DestinationsDropdown'
import ExploreTripsAdoraDropdown from './ExploreTripsAdoraDropdown'
import { getProfile } from '../services/profileService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const MainHeader = () => {
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const profileRef = useRef(null)
  
  // Bottom Navigation Bar State
  const [isAttractionsOpen, setIsAttractionsOpen] = useState(false)
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false)
  const attractionsRef = useRef(null)
  const destinationsRef = useRef(null)
  const exploreRef = useRef(null)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  // Compute userId synchronously for initial state
  const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID

  // Load cached profile immediately on mount (synchronous)
  const [profileSummary, setProfileSummary] = useState(() => {
    try {
      const cached = localStorage.getItem(`customer_profile_cache_${userId}`);
      const timestamp = localStorage.getItem(`customer_profile_cache_ts_${userId}`);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < 5 * 60 * 1000) { // 5 minutes
          return JSON.parse(cached);
        }
      }
    } catch (_) {
      // Ignore cache errors
    }
    return null;
  })
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchProfileSummary = useCallback(async () => {
    // Only show loading if we don't have cached data
    if (!profileSummary) {
      setProfileLoading(true)
    }
    try {
      const data = await getProfile(userId, true) // Use cache
      setProfileSummary(data)
    } catch (_) {
      // Only clear if we don't have cached data
      if (!profileSummary) {
        setProfileSummary(null)
      }
    } finally {
      setProfileLoading(false)
    }
  }, [userId, profileSummary])

  useEffect(() => {
    // If we have cached data, fetch fresh in background
    if (profileSummary) {
      fetchProfileSummary() // This will fetch in background
    } else {
      // No cache, fetch immediately
      fetchProfileSummary()
    }
  }, []) // Only run once on mount

  useEffect(() => {
    const handleProfileUpdated = () => fetchProfileSummary()
    window.addEventListener('customer_profile_updated', handleProfileUpdated)
    return () => window.removeEventListener('customer_profile_updated', handleProfileUpdated)
  }, [fetchProfileSummary])

  const user = profileSummary?.user
  const languageCode = (user?.language || 'en').toUpperCase()
  const displayName = useMemo(() => {
    if (!user) return ''
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    }
    return user.name || ''
  }, [user])

  const initials = useMemo(() => {
    if (displayName) {
      const segments = displayName.split(/\s+/).filter(Boolean)
      if (segments.length === 1) return segments[0][0]?.toUpperCase() || ''
      return (segments[0][0] || '').toUpperCase() + (segments[segments.length - 1][0] || '').toUpperCase()
    }
    const fallback = user?.email || 'TA'
    return fallback.slice(0, 2).toUpperCase()
  }, [displayName, user?.email])

  const avatarUrl = user?.avatar_url

  return (
    <>
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gray-100 rounded-2xl shadow-sm">
            <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center cursor-pointer">
                <img 
                  src="/assests/logo1.png" 
                  alt="TripsAdora Logo" 
                  className="h-14 w-auto object-contain"
                />
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6 flex-shrink-0">
                <Link to="/dashboard" className="text-gray-900 font-medium text-sm hover:opacity-80 transition">Home</Link>
                <Link to="/blogs" className="text-gray-900 font-normal text-sm hover:opacity-80 transition">Blogs</Link>
                <Link to="/about-us" className="text-gray-900 font-normal text-sm hover:opacity-80 transition">About</Link>
                <Link to="/contact" className="text-gray-900 font-normal text-sm hover:opacity-80 transition">Contact</Link>
              </nav>

              {/* Language Selector and Profile */}
              <div className="flex items-center space-x-4 relative flex-shrink-0">
                <div className="flex items-center text-gray-900 cursor-pointer hover:opacity-80">
                  <span className="text-sm font-medium">{languageCode}</span>
                </div>

                <button
                  type="button"
                  ref={profileRef}
                  className="flex items-center gap-2 cursor-pointer transition hover:opacity-85"
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="Open profile menu"
                >
                  {displayName && (
                    <span className="hidden sm:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
                      {displayName}
                    </span>
                  )}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-[#1d236b] text-white text-sm font-semibold"
                    style={{ opacity: profileLoading ? 0.7 : 1 }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName || 'Profile avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold tracking-wide" title={displayName || 'Profile'}>
                        {initials}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between h-12 px-4 sm:px-6">
              {/* Left Side Dropdowns */}
              <div className="flex items-center space-x-8">
                <div 
                  ref={exploreRef}
                  className="flex items-center text-gray-900 cursor-pointer group"
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                >
                  <span className="text-sm font-medium group-hover:opacity-80">Things to do</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:opacity-80" />
                </div>
                <div 
                  ref={attractionsRef}
                  className="flex items-center text-gray-900 cursor-pointer group"
                  onClick={() => setIsAttractionsOpen(!isAttractionsOpen)}
                >
                  <span className="text-sm font-medium group-hover:opacity-80">Top Attractions of Japan</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:opacity-80" />
                </div>
                <div 
                  ref={destinationsRef}
                  className="flex items-center text-gray-900 cursor-pointer group"
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                >
                  <span className="text-sm font-medium group-hover:opacity-80">Trips Inspiration</span>
                  <FiChevronDown className="ml-1 text-xs group-hover:opacity-80" />
                </div>
              </div>

              {/* Right Side Icons - Only 3 icons: Heart, Cart, Calendar */}
              <div className="flex items-center space-x-6">
                <button onClick={() => navigate('/wishlist')} className="text-gray-900 hover:opacity-80 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button onClick={() => navigate('/cart')} className="text-gray-900 hover:opacity-80 transition">
                  <FiShoppingCart className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/bookings')} className="text-gray-900 hover:opacity-80 transition relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg className="w-3 h-3 absolute bottom-0 right-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1d236b' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attractions Dropdown */}
      <AttractionsDropdown 
        isOpen={isAttractionsOpen} 
        onClose={() => setIsAttractionsOpen(false)}
        triggerRef={attractionsRef}
      />

      {/* Destinations Dropdown */}
      <DestinationsDropdown 
        isOpen={isDestinationsOpen}
        onClose={() => setIsDestinationsOpen(false)}
        triggerRef={destinationsRef}
      />

      {/* Explore TripsAdora Dropdown */}
      <ExploreTripsAdoraDropdown 
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        triggerRef={exploreRef}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        profileRef={profileRef}
        profile={profileSummary}
      />
    </>
  )
}

export default MainHeader