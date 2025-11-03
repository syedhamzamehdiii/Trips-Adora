import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'

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
        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Personal Information</h3>
          <p className="text-xs text-gray-600 mb-5">Update your personal details and contact information</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">First name</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="John" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Last name</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Doe" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Email address</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="john.doe@example.com" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Phone number</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date of birth</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="10/05/1990" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Street address</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="123 Main Street" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ZIP code</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="10001" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Country</label>
              <input className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="United States" />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button className="px-5 py-2 rounded-lg bg-[#1f3661] text-white text-sm">Save changes!</button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Change Password</h3>
          <p className="text-xs text-gray-600 mb-5">Update your password to keep your account secure</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Current Password</label>
              <input type="password" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Enter your current password" />
            </div>
            <div></div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">New Password</label>
              <input type="password" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Enter new password (min. 8 characters)" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Confirm New Password</label>
              <input type="password" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Confirm your new password" />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button className="px-5 py-2 rounded-lg bg-[#1f3661] text-white text-sm">update password!</button>
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


