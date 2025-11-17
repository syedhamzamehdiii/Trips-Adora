import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import SettingsModal from './SettingsModal'
import { getProfileSummary } from '../services/profileService'
import { useAuth } from '../context/AuthContext'

const HeaderLandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const profileRef = useRef(null)
  
  // Get userId only if authenticated - don't use default
  const userId = isAuthenticated ? (localStorage.getItem('customer_profile_user_id') || null) : null

  // Load cached profile summary immediately on mount (synchronous) - only if authenticated
  const [profileSummary, setProfileSummary] = useState(() => {
    if (!isAuthenticated || !userId) return null
    try {
      const cached = localStorage.getItem(`customer_profile_summary_cache_${userId}`);
      const timestamp = localStorage.getItem(`customer_profile_summary_cache_ts_${userId}`);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < 10 * 60 * 1000) { // 10 minutes for summary
          return JSON.parse(cached);
        }
      }
    } catch (_) {
      // Ignore cache errors
    }
    return null;
  })
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setProfileSummary(null)
      return
    }
    // Only show loading if we don't have cached data
    if (!profileSummary) {
      setProfileLoading(true)
    }
    try {
      // Use lightweight summary endpoint for header
      const data = await getProfileSummary(userId, true) // Use cache
      setProfileSummary(data)
    } catch (_) {
      // Only clear if we don't have cached data
      if (!profileSummary) {
        setProfileSummary(null)
      }
    } finally {
      setProfileLoading(false)
    }
  }, [userId, profileSummary, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && userId) {
      // If we have cached data, fetch fresh in background
      if (profileSummary) {
        fetchProfile() // This will fetch in background
      } else {
        // No cache, fetch immediately
        fetchProfile()
      }
    } else {
      setProfileSummary(null)
    }
  }, [isAuthenticated, userId]) // Run when authentication state or userId changes

  useEffect(() => {
    if (isAuthenticated && userId) {
      const handleProfileUpdated = () => fetchProfile()
      window.addEventListener('customer_profile_updated', handleProfileUpdated)
      return () => window.removeEventListener('customer_profile_updated', handleProfileUpdated)
    }
  }, [fetchProfile, isAuthenticated, userId])

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
      const parts = displayName.split(/\s+/).filter(Boolean)
      if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'TA'
      return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
    }
    const fallback = user?.email || 'TA'
    return fallback.slice(0, 2).toUpperCase()
  }, [displayName, user?.email])

  const avatarUrl = user?.avatar_url

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between h-16 px-6">
              <Link to="/dashboard" className="flex items-center cursor-pointer">
                <img 
                  src="/assests/logo1.png" 
                  alt="TripsAdora Logo" 
                  className="h-14 w-auto object-contain"
                />
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/dashboard" className="text-white font-semibold text-base hover:text-gray-200 transition">Home</Link>
                <Link to="/blogs" className="text-white font-normal text-base hover:text-gray-200 transition">Blogs</Link>
                <Link to="/about-us" className="text-white font-normal text-base hover:text-gray-200 transition">About</Link>
                <Link to="/contact" className="text-white font-normal text-base hover:text-gray-200 transition">Contact</Link>
              </nav>

              <div className="flex items-center space-x-6 relative">
                <div className="flex items-center space-x-1 text-white cursor-pointer hover:text-gray-200">
                  <span className="text-sm font-medium">{languageCode}</span>
                  <FiChevronDown className="text-xs" />
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    ref={profileRef}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition"
                    onClick={() => setIsSettingsOpen(true)}
                    aria-label="Open profile menu"
                  >
                    {displayName && (
                      <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                        {displayName}
                      </span>
                    )}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-blue-600 text-white text-sm font-semibold shadow-lg"
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
                ) : (
                  <button
                    type="button"
                    ref={profileRef}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
                    onClick={() => navigate('/login')}
                    aria-label="Login or Sign up"
                  >
                    Login/Sign up
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        profileRef={profileRef}
        profile={profileSummary}
      />
    </>
  )
}

export default HeaderLandingPage


