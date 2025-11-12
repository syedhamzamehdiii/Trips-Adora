import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useSettings } from '@/context/SettingsContext';
import notificationService from '@/services/notificationService';

const Header = ({ activePage = '' }) => {
  const navigate = useNavigate();
  const { profile } = useSettings(); // Use global settings context
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);

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

  // ----- Notifications (Real-time from API + localStorage cache) -----
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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
      console.log('📬 Notifications API response:', response);
      const fetchedNotifications = response?.notifications || [];
      console.log('📬 Fetched notifications:', fetchedNotifications.length, fetchedNotifications);
      
      const newUnreadCount = response?.unread_count || 0;
      
      // Trigger vibration animation if new unread notifications arrived
      if (newUnreadCount > previousUnreadCount) {
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 1000); // Stop after 1 second
      }
      
      // Update state + cache
      persistNotifications(fetchedNotifications);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      // Fallback to cached notifications
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
    // Fetch immediately on mount
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    // Listen for manual refresh events
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('notifications_refresh', handleRefresh);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('notifications_refresh', handleRefresh);
    };
  }, [fetchNotifications]);

  // Initialize previous unread count on mount
  useEffect(() => {
    const cached = localStorage.getItem('notifications') || '[]';
    try {
      const list = JSON.parse(cached);
      setPreviousUnreadCount(list.filter(n => !n.read).length);
    } catch (_) {
      setPreviousUnreadCount(0);
    }
  }, []);

  // Clear notifications cache
  const clearNotificationsCache = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This will remove them from your cache.')) {
      // Clear from localStorage
      localStorage.removeItem('notifications');
      
      // Clear from state
      persistNotifications([]);

      // Close dropdown and modal
      setShowNotifications(false);
      setShowAllNotificationsModal(false);
      
      // Also clear from backend if authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await notificationService.markAllAsRead();
          await fetchNotifications(); // Refresh to sync with backend
        } catch (error) {
          console.error('Error syncing cleared notifications:', error);
        }
      }
    }
  }, [fetchNotifications, persistNotifications]);

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

  const handleMarkAllRead = useCallback(async () => {
    if (!notifications.length) return;
    const token = localStorage.getItem('access_token');
    const updated = notifications.map((n) =>
      n.read ? n : { ...n, read: true, read_at: new Date().toISOString() }
    );
    persistNotifications(updated);

    if (token) {
      try {
        await notificationService.markAllAsRead();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        fetchNotifications();
      }
    }
  }, [notifications, persistNotifications, fetchNotifications]);

  const handleDeleteNotification = useCallback(async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this notification?')) return;

    const token = localStorage.getItem('access_token');
    const updated = notifications.filter((n) => n.id !== id);
    persistNotifications(updated);

    if (token) {
      try {
        await notificationService.deleteNotification(id);
      } catch (error) {
        console.error('Error deleting notification:', error);
        fetchNotifications();
      }
    }
  }, [notifications, persistNotifications, fetchNotifications]);

  // Expose a helper for other parts of the app to push notifications
  if (typeof window !== 'undefined' && !window.addNotification) {
    window.addNotification = (notification) => {
      try {
        const raw = localStorage.getItem('notifications') || '[]';
        const list = JSON.parse(raw);
        const newNotif = {
          id: notification.id || Date.now(),
          type: notification.type || 'system',
          title: notification.title || 'Notification',
          message: notification.message || '',
          createdAt: notification.createdAt || new Date().toISOString(),
          read: false,
        };
        list.push(newNotif);
        persistNotifications(list);
      } catch (_) {}
    };
  }

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
                            clearNotificationsCache();
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Clear all notifications"
                        >
                          <FiX className="w-5 h-5" />
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
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-[#1d236b]">
                    {profile.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{profile.name}</div>
                <div className="text-xs text-blue-200">ID {profile.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Notifications Modal */}
      {showAllNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAllNotificationsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <>
                    <span className="text-sm text-gray-600 font-medium">Unread: {unreadCount}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                    >
                      <FiCheck className="w-4 h-4" />
                      Mark all read
                    </button>
                  </>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotificationsCache();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    title="Clear all notifications"
                  >
                    <FiX className="w-4 h-4" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllNotificationsModal(false);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close modal"
                >
                  <FiX className="w-6 h-6" />
                </button>
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
                          <p className="text-sm font-semibold text-gray-900 pr-6">{n.title}</p>
                          {n.message && (
                            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(n.created_at || n.createdAt).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            {!n.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <FiCheck className="w-4 h-4" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(n.id);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                        {/* Quick delete cross button - top right corner */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(n.id);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Delete notification"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
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

      {/* Vibration Animation CSS */}
      <style>{`
        @keyframes vibrate {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(2deg); }
        }
        .animate-vibrate {
          animation: vibrate 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Header;

