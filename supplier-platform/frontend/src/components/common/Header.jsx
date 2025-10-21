import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ activePage = '' }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showNotifications || showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showLanguageDropdown]);

  const isActive = (page) => activePage === page;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <img 
              src="/assets/logo.jpg" 
              alt="TripsAdora Logo" 
              className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/dashboard')}
            />
          </div>
          
          {/* Center - Main Site Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`font-medium transition-colors relative ${
                isActive('home') 
                  ? 'text-[#1d236b]' 
                  : 'text-gray-700 hover:text-[#1d236b]'
              }`}
            >
              Home
              {isActive('home') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              )}
            </button>
            <button 
              onClick={() => navigate('/faq')}
              className={`font-medium transition-colors relative ${
                isActive('faq') 
                  ? 'text-[#1d236b]' 
                  : 'text-gray-700 hover:text-[#1d236b]'
              }`}
            >
              FAQs
              {isActive('faq') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              )}
            </button>
            <button 
              onClick={() => navigate('/support')}
              className={`font-medium transition-colors relative ${
                isActive('support') 
                  ? 'text-[#1d236b]' 
                  : 'text-gray-700 hover:text-[#1d236b]'
              }`}
            >
              Support
              {isActive('support') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              )}
            </button>
          </nav>
          
          {/* Right side - User Info Section */}
          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">New booking received</p>
                          <p className="text-xs text-gray-600">Mount Fuji tour - 2 guests</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment received</p>
                          <p className="text-xs text-gray-600">$240 for Tokyo City Tour</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Review received</p>
                          <p className="text-xs text-gray-600">5 stars for Kyoto Temple Tour</p>
                          <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <button className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Language Dropdown */}
            <div className="relative" ref={languageRef}>
              <button 
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span className="text-sm font-medium">EN</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Language Dropdown Menu */}
              {showLanguageDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center space-x-2">
                      <span className="font-medium">EN</span>
                      <span>English</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <span className="font-medium">ES</span>
                      <span>Español</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <span className="font-medium">FR</span>
                      <span>Français</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <span className="font-medium">DE</span>
                      <span>Deutsch</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <span className="font-medium">JA</span>
                      <span>日本語</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-[#1d236b] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[#2a2f7f] transition-colors">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-sm font-medium text-[#1d236b]">EW</span>
              </div>
              <div>
                <div className="text-sm font-medium">Edward William</div>
                <div className="text-xs text-blue-200">ID 00032123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

