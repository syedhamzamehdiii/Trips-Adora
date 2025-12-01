import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { getProfile, updateProfile, getCachedProfileSync } from '../services/profileService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  street: '',
  zip: '',
  country: '',
  language: 'en'
}

const TabBar = () => {
  const location = useLocation()
  const tabs = [
    { label: 'Profile', to: '/profile' },
    { label: 'Wallet', to: '/profile/wallet' },
    { label: 'Setting', to: '/profile/settings' },
  ]
  return (
    <div className="mb-6">
      <div className="w-full bg-gray-100 rounded-[14px] p-1 flex items-center justify-between">
        {tabs.map((t) => {
          const active = location.pathname === t.to
          return (
            <Link
              key={t.label}
              to={t.to}
              className={`px-5 py-2 rounded-[10px] text-[13px] text-center flex-1 mx-1 ${
                active ? 'bg-[#1f3661] text-white shadow-sm' : 'text-gray-800'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const ProfileSettings = () => {
  // Compute userId synchronously for initial state
  const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID
  
  // Initialize profile from cache immediately (synchronous, even if expired)
  const initialProfile = getCachedProfileSync(userId)
  const [profile, setProfile] = useState(initialProfile)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)

  const hydrateForm = useCallback((incomingProfile) => {
    const user = incomingProfile?.user || {}

    const explicitFirst = user.first_name?.trim()
    const explicitLast = user.last_name?.trim()

    let derivedFirst = explicitFirst
    let derivedLast = explicitLast

    if (!derivedFirst || !derivedLast) {
      const parts = (user.name || '').trim().split(/\s+/).filter(Boolean)
      if (!derivedFirst) {
        derivedFirst = parts.length > 0 ? parts[0] : ''
      }
      if (!derivedLast) {
        derivedLast = parts.length > 1 ? parts.slice(1).join(' ') : ''
      }
    }

    setForm({
      firstName: derivedFirst || '',
      lastName: derivedLast || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
      street: user.address_line1 || user.location || '',
      zip: user.zip_code || '',
      country: user.country || '',
      language: (user.language || 'en').toLowerCase()
    })
  }, [])

  // Hydrate form from initial cached profile
  useEffect(() => {
    if (initialProfile) {
      hydrateForm(initialProfile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const fetchProfile = useCallback(async () => {
    setError(null)
    try {
      const data = await getProfile(userId, true) // Always returns cached immediately, refreshes in background
      setProfile(data)
      hydrateForm(data)
    } catch (err) {
      // Only show error if we don't have any cached data
      setError(err?.message || 'Unable to load settings right now.')
    }
  }, [hydrateForm, userId])

  useEffect(() => {
    // Always fetch fresh data in background (getProfile returns cached immediately)
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  useEffect(() => {
    const handleProfileUpdated = () => fetchProfile()
    window.addEventListener('customer_profile_updated', handleProfileUpdated)
    return () => window.removeEventListener('customer_profile_updated', handleProfileUpdated)
  }, [fetchProfile])

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? ''
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveError(null)
    setSaveMessage(null)

    if (!form.firstName?.trim() || !form.email?.trim()) {
      setSaveError('First name and email are required to update your profile.')
      return
    }

    const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
    const location = [form.street, form.country].filter(Boolean).join(', ')

    const payloadUser = {
      ...(profile?.user || {}),
      first_name: form.firstName?.trim() || null,
      last_name: form.lastName?.trim() || null,
      name: fullName || null,
      email: form.email?.trim() || null,
      phone: form.phone?.trim() || null,
      date_of_birth: form.dateOfBirth || null,
      address_line1: form.street?.trim() || null,
      zip_code: form.zip?.trim() || null,
      country: form.country?.trim() || null,
      location: location || null,
      language: form.language?.trim() || (profile?.user?.language ?? 'en')
    }

    setSaving(true)
    try {
      const updated = await updateProfile(userId, { user: payloadUser })
      setProfile(updated)
      hydrateForm(updated)
      setSaveMessage('Profile settings updated successfully.')
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
      window.dispatchEvent(new CustomEvent('customer_profile_updated'))
    } catch (err) {
      setSaveError(err?.message || 'Failed to update profile settings.')
    } finally {
      setSaving(false)
      setTimeout(() => {
        setSaveMessage(null)
      }, 4000)
    }
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back link and page title to match My Account layout */}
        <div className="mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <span className="w-4 h-4">←</span>
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
        <p className="text-gray-600 mb-6">Your Profile and Travel Journey</p>

        {/* Tabs */}
        <TabBar />

        {/* Settings section title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Settings</h2>
        <p className="text-sm text-gray-600 mb-6">Manage your account settings and preferences</p>

        {/* Personal Information */}
        <form className="bg-gray-100 rounded-2xl p-6 mb-6" onSubmit={handleSubmit} noValidate>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Personal Information</h3>
          <p className="text-xs text-gray-600 mb-5">Update your personal details and contact information</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {saveError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {saveError}
            </div>
          )}
          {saveMessage && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {saveMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">First name</label>
              <input
                value={form.firstName}
                onChange={handleChange('firstName')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="John"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Last name</label>
              <input
                value={form.lastName}
                onChange={handleChange('lastName')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Doe"
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="john.doe@example.com"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Phone number</label>
              <input
                value={form.phone}
                onChange={handleChange('phone')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="+1 (555) 123-4567"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date of birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Street address</label>
              <input
                value={form.street}
                onChange={handleChange('street')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="123 Main Street"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ZIP code</label>
              <input
                value={form.zip}
                onChange={handleChange('zip')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="10001"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Country</label>
              <input
                value={form.country}
                onChange={handleChange('country')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="United States"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Language</label>
              <select
                value={form.language}
                onChange={handleChange('language')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              >
                <option value="en">English</option>
                <option value="ja">Japanese</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1f3661] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes!'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Change Password</h3>
          <p className="text-xs text-gray-600 mb-5">Update your password to keep your account secure</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Feature coming soon"
                disabled
              />
            </div>
            <div></div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Enter new password (min. 8 characters)"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Confirm your new password"
                disabled
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              className="px-5 py-2 rounded-lg bg-[#1f3661] text-white text-sm opacity-60 cursor-not-allowed"
              type="button"
              disabled
            >
              Update password
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Password Requirements:</h3>
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Includes at least one number</li>
            <li>Contains a special character (@, #, $, etc.)</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfileSettings


