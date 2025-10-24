import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiTrendingUp, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import SettingsDropdown from '@/components/common/SettingsDropdown';
import TravellerSectionModal from '@/components/modals/TravellerSectionModal';
import FromSupplierModal from '@/components/modals/FromSupplierModal';
import CreateProductComponent from '@/components/products/CreateProductComponent';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showTravellerSectionModal, setShowTravellerSectionModal] = useState(false);
  const [showFromSupplierModal, setShowFromSupplierModal] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const profileRef = useRef(null);

  const isProductsPage = location.pathname.includes('/products');
  const isInsightsPage = location.pathname === '/insights';
  const isBookingsPage = location.pathname === '/bookings';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowListingsDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showListingsDropdown || showNotifications || showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListingsDropdown, showNotifications, showLanguageDropdown]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="responsive-container">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <img 
                src="/assets/logo.jpg" 
                alt="TripsAdora Logo" 
                className="h-8 sm:h-10 lg:h-12 w-auto"
              />
            </div>
            
            {/* Center - Main Site Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-[#1d236b] font-medium relative hover:text-[#1a1f5a] transition-colors"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              </button>
              <button 
                onClick={() => navigate('/faq')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                FAQs
              </button>
              <button 
                onClick={() => navigate('/support')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Support
              </button>
            </nav>
            
            {/* Right side - Profile Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notification Bell - Hidden on very small screens */}
              <div className="relative hidden sm:block" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors touch-target"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">New booking received</p>
                            <p className="text-xs text-gray-600">Mount Fuji tour - 2 guests</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Payment received</p>
                            <p className="text-xs text-gray-600">$240 for Tokyo City Tour</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Review received</p>
                            <p className="text-xs text-gray-600">5 stars for Kyoto Temple Tour</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium touch-button">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Language Dropdown - Hidden on mobile */}
              <div className="relative hidden sm:block" ref={languageRef}>
                <button 
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 transition-colors touch-target"
                >
                  <span className="text-xs sm:text-sm">EN</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Language Dropdown Menu */}
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 hover:bg-gray-100 flex items-center space-x-2 touch-button">
                        <span className="font-medium">EN</span>
                        <span className="truncate">English</span>
                      </button>
                      <button className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 touch-button">
                        <span className="font-medium">ES</span>
                        <span className="truncate">Español</span>
                      </button>
                      <button className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 touch-button">
                        <span className="font-medium">FR</span>
                        <span className="truncate">Français</span>
                      </button>
                      <button className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 touch-button">
                        <span className="font-medium">DE</span>
                        <span className="truncate">Deutsch</span>
                      </button>
                      <button className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 touch-button">
                        <span className="font-medium">JA</span>
                        <span className="truncate">日本語</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Section */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="bg-[#1d236b] rounded-lg px-2 sm:px-4 py-2 flex items-center space-x-2 sm:space-x-3 hover:bg-[#1d236b]/90 transition-colors touch-button"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600">EW</span>
                  </div>
                  <div className="text-white hidden sm:block">
                    <div className="text-xs sm:text-sm font-semibold truncate">Edward William</div>
                    <div className="text-xs text-gray-300">ID 00032123</div>
                  </div>
                </button>
                
                {/* Settings Dropdown */}
                <SettingsDropdown 
                  isOpen={showSettingsDropdown}
                  onClose={() => setShowSettingsDropdown(false)}
                  profileRef={profileRef}
                  onOpenFromTravellerModal={() => {
                    setShowSettingsDropdown(false);
                    setShowTravellerSectionModal(true);
                  }}
                  onOpenFromSupplierModal={() => {
                    setShowSettingsDropdown(false);
                    setShowFromSupplierModal(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="responsive-container">
          <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 py-3 sm:py-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-button ${
                !isProductsPage && !isInsightsPage && !isBookingsPage
                  ? 'bg-gray-200 text-gray-900' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowListingsDropdown(!showListingsDropdown)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center touch-button ${
                  isProductsPage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">Listings</span>
                <span className="sm:hidden">List</span>
                <FiChevronDown className="ml-1" size={12} />
              </button>
              
              {/* Listings Dropdown */}
              {showListingsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        setShowCreateProduct(true);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hover:bg-gray-100 transition-colors touch-button"
                    >
                      Create new product
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        navigate('/products');
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hover:bg-gray-100 transition-colors touch-button"
                    >
                      Active Product listing
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/availability')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-button ${
                location.pathname === '/availability'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Availability</span>
              <span className="sm:hidden">Avail</span>
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-button ${
                isBookingsPage
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Bookings</span>
              <span className="sm:hidden">Book</span>
            </button>
            <button 
              onClick={() => navigate('/insights')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-button ${
                isInsightsPage
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Insights</span>
              <span className="sm:hidden">Insight</span>
            </button>
            <button 
              onClick={() => navigate('/finance')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-button ${
                location.pathname === '/finance'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Finance</span>
              <span className="sm:hidden">Finance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Traveller Section Modal */}
      <TravellerSectionModal 
        isOpen={showTravellerSectionModal}
        onClose={() => setShowTravellerSectionModal(false)}
        userProfile={{
          name: "Edward William",
          initials: "EW",
          balance: 1850,
          id: "00032123", 
          profileImage: "/assets/profile-placeholder.jpg"
        }}
      />

      {/* From Supplier Modal */}
      <FromSupplierModal 
        isOpen={showFromSupplierModal}
        onClose={() => setShowFromSupplierModal(false)}
      />

      {/* Create Product Component */}
      {showCreateProduct && (
        <CreateProductComponent onClose={() => setShowCreateProduct(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
