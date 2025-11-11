import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiTrendingUp, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import SettingsDropdown from '@/components/common/SettingsDropdown';
import TravellerSectionModal from '@/components/modals/TravellerSectionModal';
import FromSupplierModal from '@/components/modals/FromSupplierModal';
import CreateProductComponent from '@/components/products/CreateProductComponent';
import { settingsService } from '@/services/settingsService';
import dashboardService from '@/services/dashboardService';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showTravellerSectionModal, setShowTravellerSectionModal] = useState(false);
  const [showFromSupplierModal, setShowFromSupplierModal] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [profileSummary, setProfileSummary] = useState({
    name: 'User',
    id: 'N/A',
    photo: null,
    balance: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const profileRef = useRef(null);

  const isProductsPage = location.pathname.includes('/products');
  const isInsightsPage = location.pathname === '/insights';
  const isBookingsPage = location.pathname === '/bookings';
  const profileInitials = useMemo(() => {
    if (!profileSummary?.name) return 'US';
    const parts = profileSummary.name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [profileSummary?.name]);

  const loadProfileFromCache = useCallback(() => {
    try {
      const saved =
        localStorage.getItem('account_settings') ||
        sessionStorage.getItem('account_settings');
      if (saved) {
        const data = JSON.parse(saved);
        const name =
          data?.editableInfo?.publicName?.trim() ||
          data?.profileData?.publicName?.trim() ||
          'User';
        const id =
          data?.profileData?.supplierCode ||
          data?.profileData?.contactValue ||
          localStorage.getItem('supplier_id') ||
          sessionStorage.getItem('supplier_id') ||
          'N/A';
        const photo = data?.globalUserPhoto || null;
        return { name, id, photo, balance: 0 };
      }
    } catch (error) {
      console.warn('Failed to load cached supplier profile', error);
    }
    return { name: 'User', id: 'N/A', photo: null, balance: 0 };
  }, []);

  const fetchProfile = useCallback(async () => {
    const cached = loadProfileFromCache();
    let balance = cached.balance ?? 0;
    try {
      const overview = await dashboardService.getOverview();
      balance = Math.round(overview?.metrics?.available_balance ?? 0);
    } catch (error) {
      console.error('Failed to fetch dashboard overview for layout', error);
    }
    try {
      const response = await settingsService.getSettings();
      const settings = response?.settings || {};
      if (Object.keys(settings).length > 0) {
        const name =
          settings?.editableInfo?.publicName?.trim() ||
          settings?.profileData?.publicName?.trim() ||
          'User';
        const id =
          settings?.profileData?.supplierCode ||
          settings?.profileData?.contactValue ||
          localStorage.getItem('supplier_id') ||
          sessionStorage.getItem('supplier_id') ||
          'N/A';
        const photo = settings?.globalUserPhoto || null;
        setProfileSummary({ name, id, photo, balance });
        return;
      }
    } catch (error) {
      console.error('Failed to fetch supplier profile settings', error);
    }

    setProfileSummary({ ...cached, balance });
  }, [loadProfileFromCache]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowListingsDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowAllNotifications(false);
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

  // Realtime notifications
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const raw = localStorage.getItem('notifications') || sessionStorage.getItem('notifications');
        const list = raw ? JSON.parse(raw) : [];
        const sorted = list.map(n => ({ ...n })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sorted);
      } catch (_) {
        setNotifications([]);
      }
    };
    if (!localStorage.getItem('notifications') && !sessionStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
    loadNotifications();
    window.addEventListener('notifications_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    const handleNew = (e) => {
      try { window.addNotification && window.addNotification(e.detail || {}); } catch(_) {}
    };
    window.addEventListener('new_notification', handleNew);
    return () => {
      window.removeEventListener('notifications_updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('new_notification', handleNew);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const persistNotifications = (list) => {
    localStorage.setItem('notifications', JSON.stringify(list));
    sessionStorage.setItem('notifications', JSON.stringify(list));
    window.dispatchEvent(new Event('notifications_updated'));
  };
  const markAsRead = (id) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n));
    persistNotifications(updated);
  };

  // Listen for profile updates from Account Settings
  useEffect(() => {
    fetchProfile();
    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('account_settings_updated', handleProfileUpdate);
    window.addEventListener('accountSettingsUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('account_settings_updated', handleProfileUpdate);
      window.removeEventListener('accountSettingsUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [fetchProfile]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-[#1d236b] font-medium relative"
              >
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
                  onClick={() => { setShowNotifications(!showNotifications); setShowAllNotifications(false);} }
                  className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>)}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {((showAllNotifications ? notifications : notifications.filter(n => !n.read).slice(0, 5))).length === 0 ? (
                          <div className="text-center text-sm text-gray-500 py-6">No notifications</div>
                        ) : (
                        (showAllNotifications ? notifications : notifications.filter(n => !n.read).slice(0, 5)).map((n) => {
                          const typeColor = n.type === 'booking' ? 'bg-blue-500' : n.type === 'payment' ? 'bg-green-500' : n.type === 'review' ? 'bg-yellow-500' : 'bg-gray-400';
                          const bgColor = n.type === 'booking' ? 'bg-blue-50' : n.type === 'payment' ? 'bg-green-50' : n.type === 'review' ? 'bg-yellow-50' : 'bg-gray-50';
                          return (
                            <div key={n.id} className={`flex items-start space-x-3 p-3 rounded-lg ${bgColor} ${n.read ? 'opacity-70' : ''}`} onClick={() => markAsRead(n.id)}>
                              <div className={`w-2 h-2 ${typeColor} rounded-full mt-2`}></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                {n.message && (<p className="text-xs text-gray-600">{n.message}</p>)}
                                <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        }))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <button onClick={() => setShowAllNotifications(!showAllNotifications)} className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400" disabled={notifications.length === 0}>
                          {showAllNotifications ? 'Show recent' : 'View all notifications'}
                        </button>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">Unread: {unreadCount}</span>
                        )}
                      </div>
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
                  <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                    {profileSummary.photo ? (
                      <img src={profileSummary.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600">{profileInitials}</span>
                    )}
                  </div>
                  <div className="text-white">
                    <div className="text-sm font-semibold">{profileSummary.name}</div>
                    <div className="text-xs text-gray-300">ID {profileSummary.id}</div>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  isProductsPage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
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
                        setShowCreateProduct(true);
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === '/availability'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Availability
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isBookingsPage
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bookings
            </button>
            <button 
              onClick={() => navigate('/insights')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isInsightsPage
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Insights
            </button>
            <button 
              onClick={() => navigate('/finance')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === '/finance'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Finance
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
          name: profileSummary.name,
          initials: profileInitials,
          balance: profileSummary.balance ?? 0,
          id: profileSummary.id,
          profileImage: profileSummary.photo || '/assets/profile-placeholder.jpg'
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
