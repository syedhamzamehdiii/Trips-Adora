import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiTrendingUp, FiHelpCircle, FiChevronDown, FiX, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import SettingsDropdown from '@/components/common/SettingsDropdown';
import TravellerSectionModal from '@/components/modals/TravellerSectionModal';
import FromSupplierModal from '@/components/modals/FromSupplierModal';
import CreateProductComponent from '@/components/products/CreateProductComponent';
import dashboardService from '@/services/dashboardService';
import notificationService from '@/services/notificationService';
import { getUnreadCount as getChatUnreadCount } from '@/services/chatService';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const { profile } = useSettings(); // Use global settings context
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [isVibrating, setIsVibrating] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [showTravellerSectionModal, setShowTravellerSectionModal] = useState(false);
  const [showFromSupplierModal, setShowFromSupplierModal] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const profileRef = useRef(null);
  const hasLoadedBalanceRef = useRef(false);

  const isProductsPage = location.pathname.includes('/products');
  const isInsightsPage = location.pathname === '/insights';
  const isBookingsPage = location.pathname === '/bookings';
  const profileInitials = useMemo(() => {
    if (!profile?.name) return 'US';
    const parts = profile.name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [profile?.name]);

  // Fetch balance in background (non-blocking)
  useEffect(() => {
    const fetchBalance = async () => {
      if (hasLoadedBalanceRef.current) return; // Only fetch once
      try {
        const overview = await dashboardService.getOverview();
        const newBalance = Math.round(overview?.metrics?.available_balance ?? 0);
        setBalance(newBalance);
        hasLoadedBalanceRef.current = true;
      } catch (error) {
        console.error('Failed to fetch balance', error);
      }
    };
    fetchBalance();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadUnread = async () => {
      try {
        const data = await getChatUnreadCount();
        if (isMounted) {
          setChatUnreadCount(data?.unread_count || 0);
        }
      } catch (_) {
        if (isMounted) setChatUnreadCount(0);
      }
    };
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const profileSummary = useMemo(() => ({
    name: profile?.name || 'User',
    id: profile?.id || 'N/A',
    photo: profile?.photo || null,
    balance,
  }), [profile, balance]);

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

  // Notifications - same as Header component
  const persistNotifications = useCallback((list) => {
    setNotifications(list);
    const newUnread = list.filter((n) => !n.read).length;
    setUnreadCount(newUnread);
    setPreviousUnreadCount(newUnread);
    try {
      localStorage.setItem('notifications', JSON.stringify(list));
    } catch (_) {
      // Ignore storage errors (e.g. private mode)
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Fallback to localStorage if not authenticated
      try {
        const raw = localStorage.getItem('notifications') || '[]';
        const list = JSON.parse(raw);
        persistNotifications(list);
      } catch (_) {
        persistNotifications([]);
      }
      return;
    }

    try {
      setLoadingNotifications(true);
      const response = await notificationService.getNotifications({ limit: 50 });
      const fetchedNotifications = response?.notifications || [];
      
      const newUnreadCount = response?.unread_count || 0;
      
      // Trigger vibration animation if new unread notifications arrived
      if (newUnreadCount > previousUnreadCount) {
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 1000);
      }
      
      persistNotifications(fetchedNotifications);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      try {
        const raw = localStorage.getItem('notifications') || '[]';
        const list = JSON.parse(raw);
        persistNotifications(list);
      } catch (_) {
        persistNotifications([]);
      }
    } finally {
      setLoadingNotifications(false);
    }
  }, [persistNotifications, previousUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('notifications_refresh', handleRefresh);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('notifications_refresh', handleRefresh);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const cached = localStorage.getItem('notifications') || '[]';
    try {
      const list = JSON.parse(cached);
      setPreviousUnreadCount(list.filter(n => !n.read).length);
    } catch (_) {
      setPreviousUnreadCount(0);
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!notifications.length) return;
    const token = localStorage.getItem('access_token');
    
    // Clear all notifications (mark as read and remove them)
    persistNotifications([]);

    if (token) {
      try {
        await notificationService.markAllAsRead();
        for (const notification of notifications) {
          try {
            await notificationService.deleteNotification(notification.id);
          } catch (error) {
            console.error('Error deleting notification:', error);
          }
        }
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
    
    setShowAllNotificationsModal(false);
    setShowNotifications(false);
  }, [notifications, persistNotifications]);

  const markAsRead = useCallback(async (id) => {
    if (!id) return;
    const token = localStorage.getItem('access_token');

    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
    );
    persistNotifications(updated);

    if (token) {
      try {
        await notificationService.markAsRead(id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        fetchNotifications();
      }
    }
  }, [notifications, fetchNotifications, persistNotifications]);

  // Profile is now managed by SettingsContext - no need to fetch here

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
              {/* Chat Icon */}
              <div className="relative">
                <button 
                  onClick={() => navigate('/chat')}
                  className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
                  title="Messages"
                >
                  <FiMessageSquare className="w-6 h-6" />
                  {chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                      {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setShowAllNotificationsModal(false);} }
                  className={`relative p-2 text-gray-700 hover:text-gray-900 transition-colors ${isVibrating ? 'animate-vibrate' : ''}`}
                  style={isVibrating ? {
                    animation: 'vibrate 0.5s ease-in-out infinite'
                  } : {}}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>)}
                </button>
                
                {/* Notifications Dropdown - Show only 3 recent */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAllRead();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          >
                            <FiCheck className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {notifications.slice(0, 3).length === 0 ? (
                          <div className="text-center text-sm text-gray-500 py-6">No recent notifications</div>
                        ) : (
                          notifications.slice(0, 3).map((n) => {
                            const typeColor = n.type === 'booking' ? 'bg-blue-500' : n.type === 'cancellation' ? 'bg-red-500' : n.type === 'payment' ? 'bg-green-500' : n.type === 'review' ? 'bg-yellow-500' : 'bg-gray-400';
                            const bgColor = n.type === 'booking' ? 'bg-blue-50' : n.type === 'cancellation' ? 'bg-red-50' : n.type === 'payment' ? 'bg-green-50' : n.type === 'review' ? 'bg-yellow-50' : 'bg-gray-50';
                            return (
                              <div key={n.id} className={`flex items-start space-x-3 p-3 rounded-lg ${bgColor} ${n.read ? 'opacity-70' : ''} cursor-pointer hover:opacity-90 transition-opacity`} onClick={() => markAsRead(n.id)}>
                                <div className={`w-2 h-2 ${typeColor} rounded-full mt-2 flex-shrink-0`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                  {n.message && (<p className="text-xs text-gray-600 mt-1">{n.message}</p>)}
                                  <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at || n.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          {unreadCount > 0 ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAllRead();
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Mark all as read
                              </button>
                              <span className="text-xs text-gray-500">Unread: {unreadCount}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">All caught up</span>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            setShowNotifications(false);
                            setShowAllNotificationsModal(true);
                          }} 
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400" 
                          disabled={notifications.length === 0}
                        >
                          View all notifications
                        </button>
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

      {/* All Notifications Modal */}
      {showAllNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAllNotificationsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAllRead();
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    <FiCheck className="w-4 h-4" />
                    Mark as read
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent notifications</h3>
                  <p className="text-sm text-gray-600">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => {
                    const typeColor = n.type === 'booking' ? 'bg-blue-500' : n.type === 'cancellation' ? 'bg-red-500' : n.type === 'payment' ? 'bg-green-500' : n.type === 'review' ? 'bg-yellow-500' : 'bg-gray-400';
                    const bgColor = n.type === 'booking' ? 'bg-blue-50' : n.type === 'cancellation' ? 'bg-red-50' : n.type === 'payment' ? 'bg-green-50' : n.type === 'review' ? 'bg-yellow-50' : 'bg-gray-50';
                    return (
                      <div 
                        key={n.id} 
                        className={`relative flex items-start space-x-3 p-4 rounded-lg ${bgColor} ${n.read ? 'opacity-70' : ''} transition-opacity border border-gray-100 ${!n.read ? 'cursor-pointer hover:opacity-90' : ''}`}
                        onClick={() => {
                          if (!n.read) {
                            markAsRead(n.id);
                          }
                        }}
                      >
                        <div className={`w-3 h-3 ${typeColor} rounded-full mt-2 flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          {n.message && (
                            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(n.created_at || n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
