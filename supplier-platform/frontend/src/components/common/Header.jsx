import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ activePage = '' }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  
  // Real-time profile from account settings
  const [profile, setProfile] = useState({ name: 'Edward William', id: '00032123', photo: null });

  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem('account_settings') || sessionStorage.getItem('account_settings');
        if (saved) {
          const data = JSON.parse(saved);
          const name = data?.editableInfo?.publicName || 'Edward William';
          const id = data?.profileData?.contactValue || '00032123';
          const photo = data?.globalUserPhoto || null;
          setProfile({ name, id, photo });
        }
      } catch (_) {}
    };
    loadProfile();
    // Listen for global updates
    window.addEventListener('account_settings_updated', loadProfile);
    window.addEventListener('accountSettingsUpdated', loadProfile);
    window.addEventListener('storage', loadProfile);
    return () => {
      window.removeEventListener('account_settings_updated', loadProfile);
      window.removeEventListener('accountSettingsUpdated', loadProfile);
      window.removeEventListener('storage', loadProfile);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowAllNotifications(false);
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

  // ----- Notifications (Realtime via localStorage + events) -----
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const raw = localStorage.getItem('notifications') || sessionStorage.getItem('notifications');
        const list = raw ? JSON.parse(raw) : [];
        const sorted = list
          .map(n => ({ ...n }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sorted);
      } catch (_) {
        setNotifications([]);
      }
    };

    // Initialize if missing
    if (!localStorage.getItem('notifications') && !sessionStorage.getItem('notifications')) {
      const seed = [];
      localStorage.setItem('notifications', JSON.stringify(seed));
    }

    loadNotifications();
    window.addEventListener('notifications_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    // Allow other parts of the app to push via event
    const handleNew = (e) => {
      try {
        const payload = e.detail || {};
        window.addNotification(payload);
      } catch(_) {}
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
    </div>
  );
};

export default Header;

