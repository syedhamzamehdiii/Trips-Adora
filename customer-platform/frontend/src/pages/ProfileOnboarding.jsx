import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const ProfileOnboarding = () => {
  const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID

  const initialProfile = useMemo(() => getCachedProfileSync(userId), [userId])
  const [profile, setProfile] = useState(initialProfile)
  const [form, setForm] = useState(initialForm)
  const [isFirstTime, setIsFirstTime] = useState(() => {
    try {
      return localStorage.getItem('customer_profile_complete') !== '1'
    } catch {
      return true
    }
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)
  const navigate = useNavigate()

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

  useEffect(() => {
    if (initialProfile) {
      hydrateForm(initialProfile)
    }
  }, [hydrateForm, initialProfile])

  const fetchProfile = useCallback(async () => {
    setError(null)
    try {
      const data = await getProfile(userId, true)
      setProfile(data)
      hydrateForm(data)
    } catch (err) {
      setError(err?.message || 'Unable to load profile right now.')
    }
  }, [hydrateForm, userId])

  useEffect(() => {
    fetchProfile()
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

    // All visible fields must be filled
    if (
      !form.firstName?.trim() ||
      !form.lastName?.trim() ||
      !form.email?.trim() ||
      !form.phone?.trim() ||
      !form.dateOfBirth?.trim() ||
      !form.street?.trim() ||
      !form.zip?.trim() ||
      !form.country?.trim() ||
      !form.language?.trim()
    ) {
      setSaveError('Please complete all fields before continuing.')
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
      setSaveMessage('Profile saved. You can now continue booking your trip.')

      // Mark profile as completed so future logins can skip this step if desired
      try {
        localStorage.setItem('customer_profile_complete', '1')
        setIsFirstTime(false)
      } catch (_) {}

      // After successfully saving, send the user to their dashboard
      navigate('/dashboard', { replace: true })

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
      setSaveError(err?.message || 'Failed to save your profile. Please try again.')
    } finally {
      setSaving(false)
      setTimeout(() => {
        setSaveMessage(null)
      }, 4000)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-poppins">
      {/* Background image same style as login (Mt Fuji hero) */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/assests/7a69a86aa051f23c28e29bda402f67956fba18bf.png')" }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Header with logo, same as login */}
      <div className="relative z-10 h-20 flex items-center px-6 bg-white">
        <div className="flex items-center">
          <Link to="/dashboard">
            <img
              src="/assests/logo1.png"
              alt="TripsAdora Logo"
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Content wrapper (card) */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 -mt-20">
        <div className="w-full max-w-5xl">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 text-left">
              Complete your profile
            </h1>
            <p className="text-sm text-gray-600 mb-4 text-left">
              These details are used for confirmations, notifications and emergency contact.
            </p>

        <form className="bg-gray-100 rounded-2xl p-6 mb-2" onSubmit={handleSubmit} noValidate>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Personal Information</h3>
          <p className="text-xs text-gray-600 mb-5">
            These details are used for confirmations, notifications and emergency contact.
          </p>

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
                required
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
                required
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
                required
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
                required
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
                required
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
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Language</label>
              <select
                value={form.language}
                onChange={handleChange('language')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
                required
              >
                <option value="en">English</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-[#1f3661] text-white text-sm font-semibold hover:bg-[#182947] transition-colors"
            >
              {saving ? 'Saving…' : (isFirstTime ? 'Save' : 'Save changes!')}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileOnboarding


