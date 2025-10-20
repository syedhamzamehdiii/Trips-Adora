import React, { useState, useRef, useEffect } from 'react';
import { 
  FiChevronDown, 
  FiBell, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiUsers, 
  FiMessageCircle, 
  FiChevronRight,
  FiMail,
  FiGlobe,
  FiDollarSign,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiMessageSquare,
  FiUserPlus,
  FiMoreVertical,
  FiStar,
  FiClock,
  FiX,
  FiCheck,
  FiHelpCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SettingsDropdown from '@/components/common/SettingsDropdown';
import TravellerSectionModal from '@/components/modals/TravellerSectionModal';
import FromSupplierModal from '@/components/modals/FromSupplierModal';

const InsightsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showTravellerSectionModal, setShowTravellerSectionModal] = useState(false);
  const [showFromSupplierModal, setShowFromSupplierModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [selectedCountryOption, setSelectedCountryOption] = useState('Top 10 Countries');
  const [selectedChartOption, setSelectedChartOption] = useState('Last 6 months');
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('$ USD - US Dollar');
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const profileRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const chartDropdownRef = useRef(null);

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
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setShowChartDropdown(false);
      }
    };

    if (showListingsDropdown || showNotifications || showLanguageDropdown || showCountryDropdown || showChartDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListingsDropdown, showNotifications, showLanguageDropdown, showCountryDropdown, showChartDropdown]);

  const summaryStats = [
    { number: '124', label: 'Booking this month' },
    { number: '1,692', label: 'Total Bookings' },
    { number: '11.4%', label: 'Cancellation Rate' },
    { number: '4.6', label: 'Average Rating' }
  ];

  const countryOptions = [
    'Top 10 Countries',
    'Top 20 Countries',
    'Top 30 Countries',
    'Top 40 Countries',
    'Top 50 Countries'
  ];

  const chartOptions = [
    'Last 6 months',
    'Last 12 months',
    'Last 24 months',
    'All time',
    'Custom range'
  ];

  const countryData = [
    { rank: '01', country: 'Japan', bookings: '1309+', topProduct: 'Mount fuji', usage: 96, color: 'bg-green-500' },
    { rank: '02', country: 'United Kingdom', bookings: '1309+', topProduct: 'Tokyo tour', usage: 94, color: 'bg-green-500' },
    { rank: '03', country: 'United States', bookings: '1208+', topProduct: 'Mount fuji', usage: 89, color: 'bg-green-500' },
    { rank: '04', country: 'France', bookings: '1208+', topProduct: 'Tokyo tour', usage: 89, color: 'bg-green-500' },
    { rank: '05', country: 'UAE', bookings: '1208+', topProduct: 'Mount fuji', usage: 77, color: 'bg-red-500' },
    { rank: '06', country: 'China', bookings: '1208+', topProduct: 'Tokyo tour', usage: 89, color: 'bg-green-500' },
    { rank: '07', country: 'Canada', bookings: '1208+', topProduct: 'Mount fuji', usage: 89, color: 'bg-green-500' },
    { rank: '08', country: 'Germany', bookings: '1208+', topProduct: 'Tokyo tour', usage: 65, color: 'bg-red-500' }
  ];

  const productPerformance = [
    { rank: '01', name: 'Mount Fuji Day Trip', tourType: 'Private tour', revenue: '$23,400', increase: '12.5%', bookings: '156' },
    { rank: '02', name: 'Mount Fuji Day Trip', tourType: 'Private tour', revenue: '$23,400', increase: '11.5%', bookings: '135' },
    { rank: '03', name: 'Mount Fuji Day Trip', tourType: 'Shared tour', revenue: '$23,400', increase: '9.5%', bookings: '116' },
    { rank: '04', name: 'Mount Fuji Day Trip', tourType: 'Group tour', revenue: '$23,400', increase: '8.5%', bookings: '112' }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Blur Overlay */}
      {(showSettingsDropdown) && (
        <div className="fixed inset-0 bg-black/10 z-40 pointer-events-none"></div>
      )}
      {/* Top Navigation Bar */}
      <div className={`bg-white border-b border-gray-200 relative transition-all duration-300 ${showSettingsDropdown ? 'blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <img 
                src="/assets/logo.jpg" 
                alt="TripsAdora Logo" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Center - Main Site Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-[#1d236b] font-medium relative">
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">FAQs</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Support</a>
            </nav>
            
            {/* Right side - Profile Section */}
            <div className="flex items-center space-x-4">
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
                  <span className="text-sm">EN</span>
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

              {/* Profile Section */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="bg-[#1d236b] rounded-lg px-4 py-2 flex items-center space-x-3 hover:bg-[#1d236b]/90 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">EW</span>
                  </div>
                  <div className="text-white">
                    <div className="text-sm font-semibold">Edward William</div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowListingsDropdown(!showListingsDropdown)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center bg-white text-gray-700 hover:bg-gray-100"
              >
                Listings
                <FiChevronDown className="ml-1" size={14} />
              </button>
              
              {/* Listings Dropdown */}
              {showListingsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-100 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        navigate('/products/create');
                      }}
                      className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-200 transition-colors rounded-lg mx-2"
                    >
                      Create new product
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        navigate('/products');
                      }}
                      className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-200 transition-colors rounded-lg mx-2"
                    >
                      Active Product listing
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/availability')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
            >
              Availability
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
            >
              Bookings
            </button>
            <button 
              onClick={() => navigate('/insights')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-blue-600 text-white"
            >
              Insights
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100">
              Finance
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Insights Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Insights</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryStats.map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Overview/Feedback Buttons */}
          <div className="flex space-x-2 mb-8">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Overview</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Feedback</button>
          </div>
        </div>

        {/* Chart and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bookings & Revenue Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bookings & revenue</h3>
                <p className="text-sm text-gray-600">Countries analysis</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Toggle</span>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-blue-600 rounded-full absolute top-0.5 right-0.5 transition-all"></div>
                </div>
                <div className="relative" ref={chartDropdownRef}>
                  <button 
                    onClick={() => setShowChartDropdown(!showChartDropdown)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical size={20} />
                  </button>
                  
                  {/* Chart Options Dropdown */}
                  {showChartDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        {chartOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSelectedChartOption(option);
                              setShowChartDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                              selectedChartOption === option ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className={`w-4 h-4 border-2 rounded ${
                              selectedChartOption === option 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
                            }`}>
                              {selectedChartOption === option && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <span className={selectedChartOption === option ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-96 bg-gray-50 rounded-lg p-8 relative">
              {/* Chart Area */}
              <div className="relative h-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500">
                  <span>$50T</span>
                  <span>$48T</span>
                  <span>$45T</span>
                  <span>$43T</span>
                  <span>$40T</span>
                  <span>$38T</span>
                </div>
                <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500">
                  <span>54</span>
                  <span>47</span>
                  <span>40</span>
                  <span>32</span>
                  <span>27</span>
                  <span>21</span>
                </div>
                
                {/* Chart lines */}
                <div className="absolute inset-8">
                  {/* Revenue line (green) - starts middle, peaks in Feb, dips in Mar, rises in Apr, declines */}
                  <svg className="w-full h-full" viewBox="0 0 200 150">
                    <path
                      d="M10,80 Q50,40 90,60 T170,70"
                      stroke="#10b981"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="none"
                    />
                    {/* Revenue dots */}
                    <circle cx="10" cy="80" r="4" fill="#10b981" />
                    <circle cx="50" cy="40" r="4" fill="#10b981" />
                    <circle cx="90" cy="60" r="4" fill="#10b981" />
                    <circle cx="130" cy="55" r="4" fill="#10b981" />
                    <circle cx="170" cy="70" r="4" fill="#10b981" />
                  </svg>
                  
                  {/* Bookings area (blue) - starts high, dips in Feb, peaks in Apr, declines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 150">
                    <defs>
                      <linearGradient id="bookingsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:0.8}} />
                        <stop offset="100%" style={{stopColor:'#3b82f6', stopOpacity:0.1}} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M10,30 Q50,50 90,40 T170,50 L170,150 L10,150 Z"
                      fill="url(#bookingsGradient)"
                    />
                    <path
                      d="M10,30 Q50,50 90,40 T170,50"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      fill="none"
                    />
                    {/* Bookings dots */}
                    <circle cx="10" cy="30" r="4" fill="#3b82f6" />
                    <circle cx="50" cy="50" r="4" fill="#3b82f6" />
                    <circle cx="90" cy="40" r="4" fill="#3b82f6" />
                    <circle cx="130" cy="45" r="4" fill="#3b82f6" />
                    <circle cx="170" cy="50" r="4" fill="#3b82f6" />
                  </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-8 right-8 flex justify-between text-sm text-gray-500">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>Jul</span>
                  <span>Jun</span>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-8 left-8 flex space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span className="text-gray-600 font-medium">Bookings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                    <span className="text-gray-600 font-medium">Revenue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Country Analytics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Country Analytics</h3>
                  <p className="text-sm text-gray-600">Complete breakdown of booking metrics and product preferences by country.</p>
                </div>
                <div className="relative" ref={countryDropdownRef}>
                  <button 
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical size={20} />
                  </button>
                  
                  {/* Country Options Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        {countryOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSelectedCountryOption(option);
                              setShowCountryDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                              selectedCountryOption === option ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className={`w-4 h-4 border-2 rounded ${
                              selectedCountryOption === option 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
                            }`}>
                              {selectedCountryOption === option && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <span className={selectedCountryOption === option ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Country</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Bookings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Top Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {countryData.map((country, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">#{country.rank}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{country.country}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{country.bookings}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{country.topProduct}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${country.usage >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                          {country.usage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Circular Progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="53, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">3.2%</div>
                    <div className="text-sm text-gray-600">Current Rate</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                To avoid restrictions, maintain cancellation rates below 6% by completing accepted trip requests without skipping them. 3.8% safety margin remaining.
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Price Alignment</div>
                  <div className="text-sm text-gray-600">Competitive pricing vs market average</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">92%</div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Excellent</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Customer Reviews</div>
                  <div className="text-sm text-gray-600">Average rating from 120 reviews</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">4.8/5</div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Excellent</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Response Time</div>
                  <div className="text-sm text-gray-600">Faster than 95% of operators</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">&lt;1 hour</div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Needs Improvement</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Cancellation Rate</div>
                  <div className="text-sm text-gray-600">Well below 6% suspension threshold</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">3.2%</div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Improvement Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Improvement Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Price Alignment (92%)</h4>
                <FiDollarSign className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-600">
                Your pricing is competitive and well-positioned in the market. Consider seasonal pricing adjustments for peak demand periods. Monitor competitor pricing weekly to maintain your edge.
              </p>
            </div>
            <div className="bg-yellow-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Customer Reviews (4.8/5)</h4>
                <FiStar className="text-yellow-600" size={20} />
              </div>
              <p className="text-sm text-gray-600">
                Excellent rating! Continue providing exceptional experiences. Follow up with guests post-experience to encourage more reviews. Respond to all reviews to show engagement and care.
              </p>
            </div>
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Response Time (&lt;2 hours)</h4>
                <FiClock className="text-blue-600" size={20} />
              </div>
              <p className="text-sm text-gray-600">
                Outstanding response times! Keep up the great work! Set up mobile notifications to maintain quick responses. Consider auto-responses for common inquiries.
              </p>
            </div>
            <div className="bg-purple-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Cancellation Rate (3.2%)</h4>
                <FiX className="text-purple-600" size={20} />
              </div>
              <p className="text-sm text-gray-600">
                Exceptional cancellation rate far below danger threshold. Send confirmation reminders 24-48 hours before activities. Maintain clear communication about weather policies.
              </p>
            </div>
          </div>
        </div>

        {/* Overall Performance Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Excellent Performance Across All Metrics!</span> You're operating at a high standard with strong customer satisfaction and efficient operations. Keep up the great work!
            </p>
          </div>
        </div>

        {/* High-Impact Product Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High-Impact Product Performance</h3>
          <div className="space-y-4">
            {productPerformance.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {product.rank}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                      {product.tourType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{product.revenue}</div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <FiTrendingUp size={16} />
                    <span className="text-sm">{product.increase} {product.bookings} bookings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Quality */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Content quality</h3>
          <p className="text-sm text-gray-600 mb-6">Compelling content helps travelers make confident booking decisions and sets clear expectations for their experience.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Craft Clear Detailed Description</h4>
              <p className="text-sm text-gray-600">
                Write vivid descriptions that paint a picture of the experience. Include specific details about what guests will see, do, and learn. Mention any unique features that set your activity apart from others.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Add High-Quality Photos</h4>
              <p className="text-sm text-gray-600">
                Upload bright, high-resolution photos that showcase the best moments of your experience. Include a mix of action shots, scenic views, and group photos to help travelers visualize their adventure.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Keep Information Accurate & Updated</h4>
              <p className="text-sm text-gray-600">
                Regularly review and update your listing details including meeting points, duration, difficulty level, and what's included. Accurate information builds trust and reduces customer confusion.
              </p>
            </div>
          </div>
        </div>

        {/* Availability Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability Management</h3>
          <p className="text-sm text-gray-600 mb-6">Consistent availability, especially during peak times, ensures you never miss out on potential bookings.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Open Key Dates Early</h4>
              <p className="text-sm text-gray-600">
                Release availability for holidays, weekends, and popular travel periods well in advance. Travelers often plan special trips months ahead and early availability captures more bookings.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Maintain Regular Schedule</h4>
              <p className="text-sm text-gray-600">
                Keep a consistent weekly schedule when possible. Regular availability makes it easier for travelers to plan and helps build customer confidence in your reliability.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Update Availability Promptly</h4>
              <p className="text-sm text-gray-600">
                Keep your calendar current by promptly blocking unavailable dates and opening up new slots. Quick updates help prevent double bookings and disappointed customers.
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancellation Management</h3>
          <p className="text-sm text-gray-600 mb-6">Low cancellation rates build trust with travelers and improve your ranking in search results.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Communicate Early & Often</h4>
              <p className="text-sm text-gray-600">
                Send confirmation emails and helpful reminders prior to your experience. Clear communication about meeting points, what to bring and weather policies reduces no-shows.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Offer Flexible Alternatives</h4>
              <p className="text-sm text-gray-600">
                When weather or circumstances require changes, re-list dates or modified experiences. When possible, flexibility turns potential cancellations into rescheduled bookings.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Set Clear Expectations</h4>
              <p className="text-sm text-gray-600">
                Be upfront about physical demands, and group size minimums. Clear expectations help guests book experiences that truly fit their needs.
              </p>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Performance</h3>
          <p className="text-sm text-gray-600 mb-6">Outstanding customer experiences lead to great reviews, repeat bookings, and word-of-mouth referrals.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Deliver Memorable Experiences</h4>
              <p className="text-sm text-gray-600">
                Go beyond expectations by adding personal touches, sharing local insights, or providing small surprises. Memorable moments create enthusiastic reviews and loyal customers.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Actively Seek Feedback</h4>
              <p className="text-sm text-gray-600">
                Follow up with guests after their experience to gather feedback and encourage reviews. Positive reviews boost your visibility, while constructive feedback helps you improve.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Respond to All Reviews</h4>
              <p className="text-sm text-gray-600">
                Thank guests for positive reviews and address any concerns in negative feedback professionally. Responsive hosts show they care about customer satisfaction and continuous improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Keep Growing Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-lg p-8 text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiRefreshCw size={48} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Keep growing with fresh insights</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're constantly analyzing market trends and best practices to bring you new recommendations. Check back regularly for fresh insights that can help take your business to the next level.
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <button className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <FiMessageSquare size={16} />
              <span>Contact Support</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiUserPlus size={16} />
              <span>Join Community</span>
            </button>
          </div>
          <p className="text-sm text-gray-500">
            New insights added weekly • Personalized recommendations coming soon. Questions? Our success team is here to help you succeed.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1d236b] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            
            {/* Column 1 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Know About us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">About us</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Careers</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-300">Destinations</a></li>
                <li><a href="#" className="hover:text-blue-300">Experiences</a></li>
                <li><a href="#" className="hover:text-blue-300">Tours</a></li>
                <li><a href="#" className="hover:text-blue-300">Activities</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold mb-4">Help & Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-300">FAQ</a></li>
                <li><a href="#" className="hover:text-blue-300">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-300">Refund Policy</a></li>
                <li><a href="#" className="hover:text-blue-300">Safety Guidelines</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-semibold mb-4">Stay Connected</h4>
              <p className="text-sm mb-4">Get travel deals & inspiration.</p>
              <div className="flex mb-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 rounded-l-lg text-gray-900 text-sm"
                />
                <button className="px-3 py-2 bg-blue-700 rounded-r-lg hover:bg-blue-600">
                  <FiMail size={16} />
                </button>
              </div>
              <p className="text-sm mb-3">Follow Us</p>
              <div className="flex space-x-3">
                <FiLinkedin size={20} className="hover:text-blue-300 cursor-pointer" />
                <FiInstagram size={20} className="hover:text-blue-300 cursor-pointer" />
                <FiFacebook size={20} className="hover:text-blue-300 cursor-pointer" />
                <FiTwitter size={20} className="hover:text-blue-300 cursor-pointer" />
              </div>
            </div>

            {/* Column 5 */}
            <div>
              <h4 className="font-semibold mb-4">Payments & Settings</h4>
              <div className="mb-4">
                <p className="text-sm mb-2">Payment Methods</p>
                <div className="flex space-x-2">
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">AE</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">MC</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">V</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">AP</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">PP</div>
                  <div className="w-8 h-6 bg-white rounded flex items-center justify-center text-xs text-gray-600">GP</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FiGlobe size={16} />
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-sm border-none outline-none"
                  >
                    <option value="US English">US English</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <FiDollarSign size={16} />
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent text-sm border-none outline-none"
                  >
                    <option value="$ USD - US Dollar">$ USD - US Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm">© 2023 Tripsdova. All rights reserved.</p>
              <div className="flex items-center space-x-6 text-sm text-white">
                <span className="flex items-center space-x-1">
                  <span>🔒</span>
                  <span>Secure Booking</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>👥</span>
                  <span>B2B Travels</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>📞</span>
                  <span>+1-000-Travel</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>24/7 Support</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
};

export default InsightsPage;