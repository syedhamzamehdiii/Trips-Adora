import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail, Phone, MapPin, CalendarDays, ArrowLeft, Heart, Gift } from 'lucide-react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import EditProfileModal from '../components/EditProfileModal'
import { getProfile, updateProfile } from '../services/profileService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="flex-1 min-w-[180px] bg-white rounded-2xl border border-gray-200 shadow p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-[22px] font-bold text-gray-900 leading-none">{value}</div>
      <div className="text-[12px] text-gray-600 mt-1">{label}</div>
    </div>
  </div>
)

const ProgressRow = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between text-[13px] text-gray-800 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
      <div className="h-full bg-blue-600" style={{ width: `${value}%` }} />
    </div>
  </div>
)

const formatCurrency = (value = 0, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(value || 0)
  } catch (err) {
    return `$${Number(value || 0).toFixed(0)}`
  }
}

const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-US', options)
  } catch (err) {
    return ''
  }
}

const formatRelativeTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffMs) < hour) {
    return rtf.format(Math.round(-diffMs / minute), 'minute')
  }
  if (Math.abs(diffMs) < day) {
    return rtf.format(Math.round(-diffMs / hour), 'hour')
  }
  if (Math.abs(diffMs) < week) {
    return rtf.format(Math.round(-diffMs / day), 'day')
  }
  if (Math.abs(diffMs) < month) {
    return rtf.format(Math.round(-diffMs / week), 'week')
  }
  if (Math.abs(diffMs) < year) {
    return rtf.format(Math.round(-diffMs / month), 'month')
  }
  return rtf.format(Math.round(-diffMs / year), 'year')
}

const ProfilePage = () => {
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)

  // Compute userId synchronously for initial state
  const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID

  const hasLoadedOnceRef = useRef(false)

  // Load cached profile immediately on mount (synchronous)
  const [initialProfile] = useState(() => {
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

  // Set initial profile from cache if available
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      setLoading(false)
      hasLoadedOnceRef.current = true
    }
  }, [initialProfile])

  const fetchProfile = useCallback(async () => {
    // Only show loading if we don't have cached data
    if (!initialProfile && !hasLoadedOnceRef.current) {
      setLoading(true)
    }
    setError(null)
    try {
      const data = await getProfile(userId, true) // Use cache
      setProfile(data)
      try {
        if (data?.user?.name) {
          localStorage.setItem('customer_profile_name', data.user.name)
        }
        if (data?.user?.email) {
          localStorage.setItem('customer_profile_email', data.user.email)
        }
        if (data?.user?.avatar_url) {
          localStorage.setItem('customer_profile_avatar', data.user.avatar_url)
        }
      } catch (_) {}
      hasLoadedOnceRef.current = true
    } catch (err) {
      // Only show error if we don't have cached data
      if (!initialProfile && !hasLoadedOnceRef.current) {
        setError(err?.message || 'Unable to load profile information.')
      }
    } finally {
      setLoading(false)
    }
  }, [userId, initialProfile])

  useEffect(() => {
    // If we have cached data, fetch fresh in background
    if (initialProfile) {
      fetchProfile() // This will fetch in background
    } else {
      // No cache, fetch immediately
      fetchProfile()
    }
  }, []) // Only run once on mount

  const hydrateWishlist = useCallback(async () => {
    try {
      const stored = localStorage.getItem('wishlist')
      const parsed = stored ? JSON.parse(stored) : []
      if (Array.isArray(parsed)) {
        setWishlist(parsed)
      } else {
        setWishlist([])
      }
    } catch (err) {
      setWishlist([])
    }
  }, [])

  useEffect(() => {
    hydrateWishlist()
  }, [hydrateWishlist])

  useEffect(() => {
    const handleProfileRefresh = () => {
      fetchProfile()
    }

    window.addEventListener('customer_profile_updated', handleProfileRefresh)
    window.addEventListener('customer_bookings_updated', handleProfileRefresh)
    window.addEventListener('customer_reviews_updated', handleProfileRefresh)

    return () => {
      window.removeEventListener('customer_profile_updated', handleProfileRefresh)
      window.removeEventListener('customer_bookings_updated', handleProfileRefresh)
      window.removeEventListener('customer_reviews_updated', handleProfileRefresh)
    }
  }, [fetchProfile])

  useEffect(() => {
    const handleWishlistChange = (event) => {
      if (event?.detail && Array.isArray(event.detail)) {
        setWishlist(event.detail)
      } else {
        hydrateWishlist()
      }
    }
    window.addEventListener('wishlist:changed', handleWishlistChange)
    window.addEventListener('storage', hydrateWishlist)
    window.addEventListener('customer_profile_updated', hydrateWishlist)
    window.addEventListener('customer_reviews_updated', hydrateWishlist)

    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChange)
      window.removeEventListener('storage', hydrateWishlist)
      window.removeEventListener('customer_profile_updated', hydrateWishlist)
      window.removeEventListener('customer_reviews_updated', hydrateWishlist)
    }
  }, [hydrateWishlist])

  const handleCopy = useCallback(
    async (code) => {
      if (!code) return
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch (_) {
        setCopied(false)
      }
    },
    []
  )

  const tabs = useMemo(
    () => [
      { label: 'Profile', to: '/profile' },
      { label: 'Wallet', to: '/profile/wallet' },
      { label: 'Setting', to: '/profile/settings' }
    ],
    []
  )

  const user = profile?.user
  const stats = profile?.stats
  const refer = profile?.refer_and_earn
  const upcomingTrips = profile?.upcoming_trips || []
  const travelPreferences = profile?.travel_preferences || []
  const activities = profile?.recent_activity || []
  const visibleActivities = useMemo(
    () => activities.slice(0, 4),
    [activities]
  )
  const memberSince = user?.member_since ? new Date(user.member_since) : null
  const memberSinceLabel = memberSince ? `Member Since ${memberSince.getFullYear()}` : 'Member Since —'
  const avatarUrl = user?.avatar_url || '/assests/richp.jpg'
  const loyaltyCurrency = stats?.currency || 'USD'

  const statCards = [
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      value: stats?.total_bookings ?? 0,
      icon: CalendarDays,
      formatter: (value) => value.toLocaleString()
    },
    {
      id: 'active-bookings',
      label: 'Active Bookings',
      value: stats?.active_bookings ?? 0,
      icon: CalendarDays,
      formatter: (value) => value.toLocaleString()
    },
    {
      id: 'loyalty-points',
      label: 'Loyalty Points',
      value: stats?.loyalty_points ?? 0,
      icon: Gift,
      formatter: (value) => value.toLocaleString()
    },
    {
      id: 'total-spent',
      label: 'Total Spent',
      value: stats?.total_spent ?? 0,
      icon: Gift,
      formatter: (value) => formatCurrency(value, loyaltyCurrency)
    }
  ]

  const statusColors = {
    customized: 'bg-green-100 text-green-700',
    confirmed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-600'
  }

  const activityStyles = {
    booking: { bg: 'bg-blue-50', text: 'text-blue-600' },
    wishlist: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    review: { bg: 'bg-purple-50', text: 'text-purple-600' },
    profile: { bg: 'bg-green-50', text: 'text-green-600' },
    default: { bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  const handleRemoveWishlist = useCallback(
    (itemId) => {
      setWishlist((prev) => {
        const updated = prev.filter((item) => item.id !== itemId)
        try {
          const stored = localStorage.getItem('wishlist')
          const parsed = stored ? JSON.parse(stored) : []
          const finalList = parsed.filter((item) => item.id !== itemId)
          localStorage.setItem('wishlist', JSON.stringify(finalList))
          window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: finalList }))
        } catch (_) {
          // ignore storage errors
        }
        return updated
      })
    },
    []
  )

  const handleEditProfile = () => {
    setIsEditing(true)
    setSaveError(null)
    setSaveMessage(null)
  }

  const handleSaveProfile = async (formValues) => {
    if (!profile?.user) return
    setSavingProfile(true)
    setSaveError(null)
    try {
      const defaultMemberSince = profile.user.member_since || new Date().toISOString()
      const updatedUser = {
        ...profile.user,
        name: formValues.name?.trim() || profile.user.name,
        email: formValues.email?.trim() || profile.user.email,
        phone: formValues.phone?.trim() || '',
        location: formValues.location?.trim() || '',
        // membership_tier is set by admin, not editable by customer
        membership_tier: profile.user.membership_tier || '',
        loyalty_tier: profile.user.loyalty_tier,
        member_since: defaultMemberSince,
        avatar_url: formValues.avatar_url || profile.user.avatar_url || ''
      }

      const updated = await updateProfile(userId, {
        user: updatedUser
      })

      setProfile(updated)
      try {
        if (updated?.user?.name) {
          localStorage.setItem('customer_profile_name', updated.user.name)
        }
        if (updated?.user?.email) {
          localStorage.setItem('customer_profile_email', updated.user.email)
        }
        if (updated?.user?.avatar_url) {
          localStorage.setItem('customer_profile_avatar', updated.user.avatar_url)
        }
      } catch (_) {}
      setIsEditing(false)
      setSaveMessage('Profile updated successfully.')
      window.dispatchEvent(new Event('customer_profile_updated'))
    } catch (err) {
      setSaveError(err?.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
      setTimeout(() => setSaveMessage(null), 4000)
    }
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
        <p className="text-gray-600 mb-6">Your Profile and Travel Journey</p>

        {saveMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 text-sm">
            {saveMessage}
          </div>
        )}
        {saveError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
            {saveError}
          </div>
        )}

        <div className="mb-6">
          <div className="w-full bg-gray-100 rounded-[14px] p-1 flex items-center justify-between">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.to
              return (
                <Link
                  key={tab.label}
                  to={tab.to}
                  className={`px-5 py-2 rounded-[10px] text-[13px] text-center flex-1 mx-1 ${
                    isActive ? 'bg-[#1f3661] text-white shadow-sm' : 'text-gray-800'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            <p className="font-semibold mb-3">We couldn&apos;t load your profile data.</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchProfile}
              className="px-4 py-2 bg-[#1f3661] text-white rounded-lg text-sm"
            >
              Try again
            </button>
          </div>
        ) : loading || !profile ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center text-gray-500">
            Loading your profile...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative">
                  <img src={avatarUrl} alt="profile" className="w-40 h-40 rounded-full object-cover mb-3" />
                  <div className="absolute -bottom-1 right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white text-[12px]">
                    📷
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900">{user?.name || 'Guest Traveller'}</div>
                <div className="text-sm text-gray-600">{user?.membership_tier || 'Member'}</div>
              </div>

              <div className="space-y-3 text-sm text-gray-800">
                {user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-600" /> {user.email}
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-600" /> {user.phone}
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-600" /> {user.location}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-gray-600" /> {memberSinceLabel}
                </div>
              </div>

              <div className="mt-4 w-full">
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold transition"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-6 border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Heart className="w-4 h-4" /> My Wishlist ({wishlist.length})
                  </div>
                  <Link
                    to="/wishlist"
                    className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-50"
                  >
                    View All
                  </Link>
                </div>
                {wishlist.length === 0 ? (
                  <div className="text-sm text-gray-600">No items in wishlist yet</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {wishlist.map((item) => {
                      const priceDisplay =
                        typeof item.price === 'number'
                          ? formatCurrency(item.price, item.currency || 'USD')
                          : item.price || ''
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
                          <img
                            src={item.image || '/assests/place 1.jpg'}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{item.title}</div>
                            {item.location && <div className="text-xs text-gray-600">{item.location}</div>}
                          </div>
                          <div className="text-right min-w-[80px]">
                            {priceDisplay && <div className="text-sm font-bold text-gray-900">{priceDisplay}</div>}
                            <button
                              onClick={() => handleRemoveWishlist(item.id)}
                              className="text-xs text-red-600 hover:underline mt-1"
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t pt-6">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <Gift className="w-4 h-4" /> Refer & Earn
                </div>
                {!refer ? (
                  <div className="text-sm text-gray-600">
                    Referral rewards are not set up yet for this profile.
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-3">
                      Invite friends, get rewards
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={refer?.code || ''}
                        readOnly
                      />
                      <button
                        onClick={() => handleCopy(refer?.code)}
                        className="px-4 py-2 rounded-lg bg-[#1f3661] text-white text-sm min-w-[80px] disabled:opacity-60 disabled:cursor-not-allowed"
                        type="button"
                        disabled={!refer?.code}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex items-center justify-around mt-4 text-center">
                      <div className="border rounded-xl px-7 py-4 bg-white">
                        <div className="w-16 text-center text-sm font-semibold">{refer?.referrals ?? 0}</div>
                        <div className="text-xs text-gray-600">Referrals</div>
                      </div>
                      <div className="rounded-xl px-7 py-4 bg-white border">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm font-semibold">
                            {formatCurrency(refer?.earned ?? 0, refer?.currency || loyaltyCurrency)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">Earned</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap gap-4">
                {statCards.map((card) => (
                  <StatCard
                    key={card.id}
                    value={card.formatter(card.value)}
                    label={card.label}
                    icon={card.icon}
                  />
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b flex items-center gap-2 text-gray-900 font-semibold">
                  Upcoming Trips
                </div>
                <div className="p-4 space-y-3">
                  {upcomingTrips.length === 0 ? (
                    <div className="text-sm text-gray-600">No upcoming trips scheduled yet.</div>
                  ) : (
                    upcomingTrips.map((trip) => {
                      const badgeClass =
                        trip.status_color ||
                        statusColors[trip.status?.toLowerCase()] ||
                        'bg-gray-100 text-gray-700'
                      const dateDisplay = trip.display_date || formatDate(trip.start_date)
                      return (
                        <div
                          key={trip.id}
                          className="rounded-xl border border-[#b7d3ff] bg-[#e8f1ff] p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={trip.thumbnail || '/assests/place 1.jpg'}
                              alt={trip.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <div className="text-gray-900 font-semibold text-sm">{trip.title}</div>
                              <div className="text-xs text-gray-600">{dateDisplay}</div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                            {trip.status_label || trip.status}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="text-gray-900 font-bold mb-4">Travel Preference</div>
                {travelPreferences.length === 0 ? (
                  <div className="text-sm text-gray-600">No travel preferences recorded yet.</div>
                ) : (
                  travelPreferences.map((preference) => (
                    <ProgressRow key={preference.label} label={preference.label} value={preference.value} />
                  ))
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="text-gray-900 font-bold mb-4">Recent Activity</div>
                {activities.length === 0 ? (
                  <div className="text-sm text-gray-600">No recent activity yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {visibleActivities.map((activity) => {
                      const style = activityStyles[activity.category] || activityStyles.default
                      return (
                        <li key={activity.id} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center`}>
                            <span className={`text-base ${style.text}`}>●</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{activity.title}</div>
                            <div className="text-xs text-gray-500">
                              {formatRelativeTime(activity.timestamp)}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSaveProfile}
        profileUser={profile?.user}
        saving={savingProfile}
      />
      <Footer />
    </div>
  )
}

export default ProfilePage

