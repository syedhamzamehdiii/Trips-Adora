import React from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare, FiChevronDown } from 'react-icons/fi'

export const SupplierPortalHeader = () => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
          <img
            src="/assests/logo1.png"
            alt="TripsAdora Logo"
            className="h-12 w-auto"
          />
        </div>

        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link
            to="/supplier-registration"
            className="text-[#1d236b] relative cursor-pointer hover:opacity-80 transition-opacity"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]" />
          </Link>
          <Link
            to="/supplier/faq"
            className="text-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
          >
            FAQs
          </Link>
          <Link
            to="/supplier/support"
            className="text-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
          >
            Support
          </Link>
        </nav>

        <div className="flex items-center space-x-6">
          <Link
            to="/chat"
            className="relative p-2 text-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Chat"
          >
            <FiMessageSquare className="w-6 h-6" />
          </Link>

          <button
            type="button"
            className="relative p-2 text-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
            title="Notifications"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <div className="flex items-center space-x-2 text-gray-700">
            <span className="text-sm font-medium">EN</span>
            <FiChevronDown size={14} />
          </div>
        </div>
      </div>
    </div>
  </header>
)

export const SupplierPortalFooter = () => (
  <footer className="bg-[#1d236b] text-white py-16 relative z-60 w-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide">Know About us</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/supplier/about" className="text-white/90 hover:text-white transition-colors">About us</Link></li>
            <li><Link to="/supplier/contact" className="text-white/90 hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/supplier/support" className="text-white/90 hover:text-white transition-colors">Support Center</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#destinations" className="text-white/90 hover:text-white transition-colors">Destinations</a></li>
            <li><a href="#experiences" className="text-white/90 hover:text-white transition-colors">Experiences</a></li>
            <li><a href="#tours" className="text-white/90 hover:text-white transition-colors">Tours</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide">Help & Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/supplier/faq" className="text-white/90 hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/supplier/support" className="text-white/90 hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link to="/supplier/privacy" className="text-white/90 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/supplier/refund-policy" className="text-white/90 hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link to="/supplier/safety-guidelines" className="text-white/90 hover:text-white transition-colors">Safety Guidelines</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide">Payments & Settings</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['AMEX', 'Master', 'Visa', 'Apple', 'PayPal', 'Google'].map(label => (
              <div key={label} className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[#1d236b] font-bold text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-wide">Stay Connected</h3>
            <p className="text-sm text-white/90">Get travel deals & inspiration</p>
          </div>
          <div className="flex max-w-xs">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 bg-gray-400 text-white placeholder-white border border-gray-400 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded-r-lg transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex items-center space-x-3">
              {['instagram','linkedin','facebook','twitter'].map(platform => (
                <div key={platform} className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Language</h4>
              <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2 min-w-[140px]">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span className="text-sm">US English</span>
              </button>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Currency</h4>
              <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2 min-w-[160px]">
                <span className="font-semibold">$</span>
                <span className="text-sm">USD - US Dollar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-white/20 mt-12 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-white mb-4 md:mb-0">
          ©2025 TripsAdora. All rights reserved.
        </div>
        <div className="flex items-center space-x-6 text-sm text-white">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            <span>10M+ Travels</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>+1-800-Travel</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
)

