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
import Footer from '@/components/common/Footer';

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
      <div className="absolute right-0 top-0 w-64 sm:w-72 lg:w-80 bg-[#1d236b]/95 backdrop-blur-md border-l border-[#1d236b]/50 p-3 sm:p-4 text-white z-50 hidden lg:block" style={{top: '-80px', height: 'calc(max(70vh, 800px) + 161px)', paddingTop: '80px'}}>
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
      <div className={`relative h-[60vh] sm:h-[70vh] min-h-[600px] sm:min-h-[800px] overflow-hidden transition-all duration-300 ${(showSettingsDropdown || showNestedDropdown) ? 'blur-sm' : ''}`}>
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
        
        {/* Dashboard Navigation - positioned inside hero - Hidden on mobile */}
        <div className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-8 hidden lg:block">
          <div className="flex justify-center space-x-8 xl:space-x-16">
            <button className="text-black font-bold hover:border-b-2 hover:border-black pb-2 transition-all duration-200 text-sm lg:text-base">
              Dashboard
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowListingsDropdown(!showListingsDropdown)}
                className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 flex items-center transition-all duration-200 text-sm lg:text-base"
              >
              Listings
                <FiChevronDown className="ml-1" size={14} />
              </button>
              
              {/* Listings Dropdown */}
              {showListingsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 lg:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        setShowCreateProduct(true);
                      }}
                      className="w-full text-center px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 font-medium text-sm"
                    >
                      Create new product
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowListingsDropdown(false);
                        navigate('/products');
                      }}
                      className="w-full text-center px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 font-medium text-sm"
                    >
                      Active Product listing
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/availability')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200 text-sm lg:text-base"
            >
              Availability
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200 text-sm lg:text-base"
            >
              Bookings
            </button>
            <button 
              onClick={() => navigate('/insights')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200 text-sm lg:text-base"
            >
              Insights
            </button>
            <button 
              onClick={() => navigate('/finance')}
              className="text-black hover:text-gray-700 hover:border-b-2 hover:border-black font-medium pb-2 transition-all duration-200 text-sm lg:text-base">
              Finance
            </button>
          </div>
        </div>
        
        {/* Hero content with featured image */}
        <div className="relative h-full flex items-start pt-8 sm:pt-12 lg:pt-16">
          <div className="responsive-container w-full">
            <div className="relative">
              {/* Text content positioned to overlap image */}
              <div className="absolute left-0 top-8 sm:top-16 lg:top-28 z-30 max-w-xs sm:max-w-md lg:max-w-2xl">
                <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-tight drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    Grow Your
                    <br />
                    Business with
                </h1>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    THE NEW HORIZON
                  </h2>
              </div>
            </div>

            {/* Featured unblurred image positioned on the right - Hidden on mobile */}
            <div className="absolute right-4 sm:right-6 lg:right-10 top-4 sm:top-6 lg:top-8 z-20 hidden sm:block">
              <div className="relative">
                {/* Rounded corner frame for the image */}
                <div className="w-48 h-60 sm:w-64 sm:h-80 lg:w-80 lg:h-96 xl:w-96 xl:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 bg-white/20">
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
          <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-20">
            <div className="responsive-container">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Total Products Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Total Products</h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">12</p>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Total number of products you have created and listed on the platform.</p>
                </div>

                {/* Cancellation Rate Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Cancellation rate</h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">0%</p>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">The percentage of bookings that were canceled.</p>
                </div>

                {/* Fresh Reviews Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Fresh Reviews</h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-300 mb-1 sm:mb-2">4.8</p>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Booking canceled by you</p>
                </div>

                {/* Today's Balance Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">Today's balance</h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">$760</p>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Amount earned and available for today.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to account for overlapping cards */}
      <div className="h-20 sm:h-32 lg:h-40 bg-white"></div>

      {/* Main Content Area */}
      <div className={`responsive-container py-6 sm:py-8 transition-all duration-300 ${(showSettingsDropdown || showNestedDropdown) ? 'blur-sm' : ''}`}>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Content - takes remaining space */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            {/* Wrap Up Your Product Setup */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Wrap Up Your Product Setup</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200 space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Mount fuji 5th station</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Started on Friday, August 1, 2002</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 relative">
                      <div className="h-2 sm:h-3 rounded-full flex items-center justify-end pr-1 sm:pr-2" style={{ width: '20%', backgroundColor: '#1d236b' }}>
                        <span className="text-white text-xs font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <button className="bg-[#1d236b] hover:bg-[#1a1f5a] text-white px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm touch-button">
                      Continue
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200 space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Mount fuji 4th station</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Started on Friday, August 1, 2002</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 relative">
                      <div className="h-2 sm:h-3 rounded-full flex items-center justify-end pr-1 sm:pr-2" style={{ width: '80%', backgroundColor: '#1d236b' }}>
                        <span className="text-white text-xs font-medium">80%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <button className="bg-[#1d236b] hover:bg-[#1a1f5a] text-white px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm touch-button">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Popular Activities */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Most Popular Activities</h2>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Mount fuji 5th station tour by car with pickup</h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">A highly demanded tour to Mount Fuji's 5th Station by private car with convenient pickup service. This experience has been one of the most popular choices among travelers in recent days.</p>
                      </div>
                      <div className="flex items-center text-green-600 ml-0 sm:ml-6">
                        <FiTrendingUp size={16} className="mr-1 sm:mr-2" />
                        <span className="font-bold text-lg sm:text-xl">14.6%</span>
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
      <Footer />

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