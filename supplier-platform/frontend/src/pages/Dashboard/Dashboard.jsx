import { FiCheck, FiTrendingUp, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CreateProductComponent from '@/components/products/CreateProductComponent';
import SettingsDropdown from '@/components/common/SettingsDropdown';
import TravellerSectionModal from '@/components/modals/TravellerSectionModal';
import FromSupplierModal from '@/components/modals/FromSupplierModal';
import RefundPolicyModal from '@/components/modals/RefundPolicyModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNestedDropdown, setShowNestedDropdown] = useState(false);
  const [showTravellerSectionModal, setShowTravellerSectionModal] = useState(false);
  const [showFromSupplierModal, setShowFromSupplierModal] = useState(false);
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const profileRef = useRef(null);

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
    <div className="min-h-screen bg-white relative">
      {/* Blur Overlay */}
      {(showSettingsDropdown || showNestedDropdown) && (
        <div className="fixed inset-0 bg-black/10 z-40 pointer-events-none"></div>
      )}
      {/* Top Navigation Bar */}
      <div className={`bg-white border-b border-gray-200 relative transition-all duration-300 ${(showSettingsDropdown || showNestedDropdown) ? 'blur-sm' : ''}`}>
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
              <button className="text-[#1d236b] font-medium relative">
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              </button>
              <button 
                onClick={() => navigate('/faq')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                FAQs
              </button>
              <button 
                onClick={() => navigate('/support')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Support
              </button>
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
            </div>
          </div>
        </div>
        
              </div>

      {/* Blue Sidebar - starts from top navigation and extends through hero */}
      <div className="absolute right-0 top-0 w-80 bg-[#1d236b]/95 backdrop-blur-md border-l border-[#1d236b]/50 p-4 text-white z-50" style={{top: '-80px', height: 'calc(max(70vh, 800px) + 161px)', paddingTop: '80px'}}>
        {/* Available Balance and Profile */}
        <div className="mb-4 bg-white/10 rounded-lg p-3 relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-white/80">Available Balance</div>
              <div className="text-sm font-bold text-white">$1850</div>
            </div>
            <div className="text-center relative" ref={profileRef}>
              <button 
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="hover:bg-white/10 rounded-lg p-1 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-1">
                  <img 
                    src="/assets/profile-placeholder.jpg" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gray-400 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                    <span className="text-xs font-semibold text-gray-600">EW</span>
                  </div>
                </div>
                <div className="text-xs text-white">ID 00032123</div>
              </button>
              
                {/* Settings Dropdown */}
                <SettingsDropdown 
                  isOpen={showSettingsDropdown}
                  onClose={() => {
                    setShowSettingsDropdown(false);
                    setShowNestedDropdown(false);
                  }}
                  profileRef={profileRef}
                  onNestedDropdownChange={setShowNestedDropdown}
                  onOpenFromTravellerModal={() => {
                    setShowSettingsDropdown(false);
                    setShowNestedDropdown(false);
                    setShowTravellerSectionModal(true);
                  }}
                  onOpenFromSupplierModal={() => {
                    setShowSettingsDropdown(false);
                    setShowNestedDropdown(false);
                    setShowFromSupplierModal(true);
                  }}
                />
            </div>
          </div>
        </div>

        {/* Supplier Mode Toggle */}
        <div className="mb-6 bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Supplier mode</span>
            <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="mb-6 bg-white/10 rounded-lg p-4">
          <div className="mb-4">
            <p className="font-semibold text-white text-sm">Edward William</p>
            <p className="text-xs text-white/80">Notting Hill, London</p>
          </div>
          <div className="flex items-center mb-4">
            <span className="text-xs text-white">Karwan Tours</span>
            <FiCheck className="ml-2 text-green-400" size={12} />
          </div>
          
          {/* Divider */}
          <div className="border-t border-white/20 mb-4"></div>
          
          {/* Booking Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-white/80 mb-2">Today's bookings</div>
              <div className="text-lg font-bold text-white mb-1">18</div>
              <div className="text-xs text-green-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/80 mb-2">Tomorrow's bookings</div>
              <div className="text-lg font-bold text-white mb-1">24</div>
              <div className="text-xs text-green-400">Confirmed</div>
            </div>
          </div>
        </div>

        {/* My Activity Chart */}
        <div className="mb-6 bg-white/10 rounded-xl border border-blue-300/30 p-5">
          <h3 className="font-semibold mb-5 text-white text-sm text-center">My Activity</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Published", value: 50 },
                        { name: "Drafts", value: 15 },
                        { name: "Under review", value: 35 },
                      ]}
                      startAngle={180}
                      endAngle={0}
                      innerRadius={12}
                      outerRadius={24}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="rgba(255,255,255,0.8)" />
                      <Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">50%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-[10px] text-white/60">15%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">35%</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-white/90">Published</span>
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full mr-2"></div>
                <span className="text-xs text-white/80">Drafts</span>
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full mr-2"></div>
                <span className="text-xs text-white/80">Under review</span>
                </div>
              </div>
          </div>
        </div>

        {/* Account Stability Chart */}
        <div className="mb-6 bg-white/10 rounded-xl border border-blue-300/30 p-5">
          <h3 className="font-semibold mb-5 text-white text-sm text-center">Account Stability</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="relative" style={{ width: '80px', height: '50px' }}>
                <svg width="80" height="50" viewBox="0 0 120 70">
                  {(() => {
                    const totalBars = 24;
                    const positiveCount = Math.round(totalBars * 0.70); // 70%
                    const cancellationCount = Math.round(totalBars * 0.18); // 18%
                    const negativeCount = totalBars - positiveCount - cancellationCount; // 12%
                    const bars = [];
                    
                    for (let i = 0; i < totalBars; i++) {
                      const angle = 180 - (i / (totalBars - 1)) * 180;
                      const angleRad = (angle * Math.PI) / 180;
                      
                      let color;
                      if (i < positiveCount) {
                        color = '#22c55e'; // Green
                      } else if (i < positiveCount + cancellationCount) {
                        color = '#eab308'; // Yellow
                      } else {
                        color = '#ef4444'; // Red
                      }
                      
                      const centerX = 60;
                      const centerY = 65;
                      const innerRadius = 25;
                      const outerRadius = 50;
                      
                      const x1 = centerX + innerRadius * Math.cos(angleRad);
                      const y1 = centerY - innerRadius * Math.sin(angleRad);
                      const x2 = centerX + outerRadius * Math.cos(angleRad);
                      const y2 = centerY - outerRadius * Math.sin(angleRad);
                      
                      bars.push(
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={color}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      );
                    }
                    return bars;
                  })()}
                </svg>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">70%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">18%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">12%</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-white/90">Positive rating</span>
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-xs text-white/80">Cancellation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full mr-2"></div>
                <span className="text-xs text-white/80">Negative rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <button 
          onClick={() => navigate('/faq')}
          className="w-full text-white py-4 px-6 rounded-xl transition-colors text-sm font-medium flex items-center justify-center space-x-3 bg-[#1d236b] hover:bg-[#1a1f5a] shadow-lg border border-blue-300/20"
        >
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <FiHelpCircle size={16} />
          </div>
          <span>Help</span>
        </button>
      </div>

      {/* Hero Section with Blurred Background and Featured Image */}
      <div className={`relative h-[70vh] min-h-[800px] overflow-hidden transition-all duration-300 ${(showSettingsDropdown || showNestedDropdown) ? 'blur-sm' : ''}`}>
        {/* Completely Blurred Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat backdrop-blur-xl" 
                style={{
                  backgroundImage: `url('/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg')`,
               backgroundPosition: 'center center',
               filter: 'blur(20px)',
               transform: 'scale(1.1)'
             }}>
              </div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        
        {/* Dashboard Navigation - positioned inside hero */}
        <div className="absolute top-0 left-0 right-0 z-30 px-16 py-8">
          <div className="flex justify-center space-x-16">
            <button className="text-black font-bold hover:border-b-2 hover:border-black pb-2 transition-all duration-200">
              Dashboard
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowListingsDropdown(!showListingsDropdown)}
                className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 flex items-center transition-all duration-200"
              >
              Listings
                <FiChevronDown className="ml-1" size={16} />
              </button>
              
              {/* Listings Dropdown */}
              {showListingsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        setShowCreateProduct(true);
                      }}
                      className="w-full text-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 font-medium"
                    >
                      Create new product
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        navigate('/products');
                      }}
                      className="w-full text-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 font-medium"
                    >
                      Active Product listing
            </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/availability')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200"
            >
              Availability
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200"
            >
              Bookings
            </button>
            <button 
              onClick={() => navigate('/insights')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200"
            >
              Insights
            </button>
            <button 
              onClick={() => navigate('/finance')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200">
              Finance
            </button>
          </div>
        </div>
        
        {/* Hero content with featured image */}
        <div className="relative h-full flex items-start pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="relative">
              {/* Text content positioned to overlap image */}
              <div className="absolute left-0 top-28 z-30 max-w-2xl">
                <div className="space-y-12">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    Grow Your
                    <br />
                    Business with
                </h1>
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    THE NEW HORIZON
                  </h2>
              </div>
            </div>

              {/* Featured unblurred image positioned on the right */}
              <div className="absolute right-10 top-8 z-20">
                <div className="relative">
                  {/* Rounded corner frame for the image */}
                  <div className="w-80 h-96 lg:w-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 bg-white/20">
                    <img 
                      src="/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg" 
                      alt="Person overlooking canyon"
                      className="w-full h-full object-cover"
                      style={{ filter: 'none' }}
                    />
                    </div>
                  </div>
              </div>

            </div>

        </div>

          {/* Stats Cards Overlay - More visible and with proper blur */}
          <div className="absolute bottom-4 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Products Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Total Products</h3>
                  <p className="text-4xl font-bold text-white mb-2">12</p>
                  <p className="text-sm text-white/80 leading-relaxed">Total number of products you have created and listed on the platform.</p>
                </div>

                {/* Cancellation Rate Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Cancellation rate</h3>
                  <p className="text-4xl font-bold text-white mb-2">0%</p>
                  <p className="text-sm text-white/80 leading-relaxed">The percentage of bookings that were canceled.</p>
                </div>

                {/* Fresh Reviews Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Fresh Reviews</h3>
                  <p className="text-4xl font-bold text-orange-300 mb-2">4.8</p>
                  <p className="text-sm text-white/80 leading-relaxed">Booking canceled by you</p>
                </div>

                {/* Today's Balance Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Today's balance</h3>
                  <p className="text-4xl font-bold text-white mb-2">$760</p>
                  <p className="text-sm text-white/80 leading-relaxed">Amount earned and available for today.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to account for overlapping cards */}
      <div className="h-40 bg-white"></div>

      {/* Main Content Area */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${(showSettingsDropdown || showNestedDropdown) ? 'blur-sm' : ''}`}>
        <div className="flex gap-8">
          {/* Left Content - takes remaining space */}
          <div className="flex-1 space-y-8">
            {/* Wrap Up Your Product Setup */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Wrap Up Your Product Setup</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Mount fuji 5th station</h3>
                    <p className="text-sm text-gray-600 mb-4">Started on Friday, August 1, 2002</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                      <div className="h-3 rounded-full flex items-center justify-end pr-2" style={{ width: '20%', backgroundColor: '#1d236b' }}>
                        <span className="text-white text-xs font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <button className="bg-[#1d236b] hover:bg-[#1a1f5a] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Continue
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Mount fuji 4th station</h3>
                    <p className="text-sm text-gray-600 mb-4">Started on Friday, August 1, 2002</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                      <div className="h-3 rounded-full flex items-center justify-end pr-2" style={{ width: '80%', backgroundColor: '#1d236b' }}>
                        <span className="text-white text-xs font-medium">80%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <button className="bg-[#1d236b] hover:bg-[#1a1f5a] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Popular Activities */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Popular Activities</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-3">Mount fuji 5th station tour by car with pickup</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">A highly demanded tour to Mount Fuji's 5th Station by private car with convenient pickup service. This experience has been one of the most popular choices among travelers in recent days.</p>
                      </div>
                      <div className="flex items-center ml-6 text-green-600">
                        <FiTrendingUp size={20} className="mr-2" />
                        <span className="font-bold text-xl">14.6%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1d236b] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Know About us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Know About us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">About us</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Careers</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Explore */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Destinations</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Experiences</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Tours</a></li>
              </ul>
            </div>
            
            {/* Help & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/faq')} className="text-white hover:text-gray-300 transition-colors">FAQ</button></li>
                <li><button onClick={() => navigate('/support')} className="text-white hover:text-gray-300 transition-colors">Contact Support</button></li>
                <li><button onClick={() => navigate('/privacy')} className="text-white hover:text-gray-300 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setIsRefundPolicyOpen(true)} className="text-white hover:text-gray-300 transition-colors">Refund Policy</button></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>

            {/* Payments & Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payments & Settings</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">AMEX</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Master</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Visa</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Apple</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">PayPal</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Google</span>
                </div>
              </div>
            </div>
            
            {/* Stay Connected */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
              <div className="space-y-4">
                <p className="text-white">Get travel deals & inspiration</p>
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
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Follow Us</h4>
                    <div className="flex space-x-3">
                      {/* Instagram */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      {/* LinkedIn */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      {/* Facebook */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      {/* Twitter */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Language</h4>
                    <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">US English</span>
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Currency</h4>
                    <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">$ USD - US Dollar</span>
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer Bar */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-white mb-4 md:mb-0">
                ©2025 TripAdora. All rights reserved.
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
        </div>
      </footer>

      {/* Create Product Component */}
      {showCreateProduct && (
        <CreateProductComponent onClose={() => setShowCreateProduct(false)} />
      )}

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

      {/* Refund Policy Modal */}
      <RefundPolicyModal 
        isOpen={isRefundPolicyOpen}
        onClose={() => setIsRefundPolicyOpen(false)}
      />

    </div>
  );
};

export default Dashboard;