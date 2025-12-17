import React, { useEffect, useState } from 'react';
import KPICards from './KPICards';
import RevenueChart from './RevenueChart';
import SupplierPerformanceTable from './SupplierPerformanceTable';
import NotificationsModal from './NotificationsModal';
import NotificationsPopover from './NotificationsPopover';
import NotificationsModalFull from './NotificationsModalFull';
import MessagesModal from './MessagesModal';
import MessagesPopover from './MessagesPopover';
import UserMenuPopover from './UserMenuPopover';
import ManageTours from './ManageTours';
import Feedbacks from './Feedbacks';
import MessagesContact from './MessagesContact';
import SupplierDetail from './SupplierDetail';
import SupplierprofileDetail from './SupplierprofileDetail';
import AllSuppliersManage from './AllSuppliersManage';
import ManageAllCustomers from './ManageAllCustomers';
import Settings from './Settings';
import Finance from './Finance';
import { messageService } from '../services/messageService';

const AdminDashboard = () => {
  const menuItems = [
    'Dashboard Overview',
    'Products Management',
    'Suppliers',
    'Customers',
    'Reviews & Feedbacks',
    'Finance',
    'Massages & contact',
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifAnchorRect, setNotifAnchorRect] = useState(null);
  const [useModal, setUseModal] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [msgAnchorRect, setMsgAnchorRect] = useState(null);
  const [notifHasNew, setNotifHasNew] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userAnchorRect, setUserAnchorRect] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hash, setHash] = useState(window.location.hash);
  const [initialMessageTarget, setInitialMessageTarget] = useState(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // React to hash-based deep links (supplier profile, jump-to-messages, etc.)
  useEffect(() => {
    if (!hash) return;

    if (hash.startsWith('#supplier-profile')) {
      // Supplier profile handled in render branch below
      return;
    }

    if (hash.startsWith('#message-supplier=')) {
      const [, rest] = hash.split('=');
      const [supplierIdPart, namePart] = (rest || '').split('&name=');
      const supplierId = decodeURIComponent(supplierIdPart || '');
      const supplierName = namePart ? decodeURIComponent(namePart) : '';

      setInitialMessageTarget({
        type: 'supplier',
        id: supplierId,
        name: supplierName,
      });
      setActiveIndex(menuItems.indexOf('Massages & contact'));

      // Clear hash so back/forward works cleanly
      if (window && window.location) {
        window.location.hash = '';
      }
    }
  }, [hash]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Poll unread messages to trigger notification dot
  useEffect(() => {
    let timer;
    const fetchUnread = async () => {
      try {
        const conversations = await messageService.getConversations();
        const unreadTotal = Array.isArray(conversations)
          ? conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
          : 0;
        setUnreadCount(unreadTotal);
        setNotifHasNew(unreadTotal > 0);
      } catch (e) {
        // silent fail for network errors (backend might be starting up)
        if (e.code !== 'ERR_NETWORK' && e.message !== 'Network Error') {
          // Only log non-network errors
          console.warn('Failed to fetch unread messages:', e);
        }
      } finally {
        timer = setTimeout(fetchUnread, 10000); // 10s poll
      }
    };
    fetchUnread();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2E3F74] text-white flex flex-col">
        {/* Branding */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight">Trips Adora</h1>
          <p className="text-xs text-green-400 mt-1 font-semibold">Admin</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 text-sm">
          <ul className="space-y-3">
            {menuItems.map((label, idx) => {
              const isActive = idx === activeIndex && !showSettings;
              const base = 'block w-[250px] text-left ps-4 py-3 rounded-full transition-colors duration-150';
              const inactive = 'text-white/90 hover:bg-white/10';
              const active = 'bg-white text-[#1e2a4a] font-medium shadow-sm';
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => {
                      if (window && window.location) window.location.hash = '';
                      setActiveIndex(idx);
                      setShowSettings(false);
                    }}
                    className={`${base} ${isActive ? active : inactive}`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div className="h-px bg-white/90" />
          <ul className="space-y-1 px-4 py-4 text-sm">
            <li>
              <button 
                type="button" 
                onClick={() => {
                  if (window && window.location) window.location.hash = '';
                  setShowSettings(true);
                  setActiveIndex(-1); // Reset active index when opening settings
                }}
                className={`w-full text-left px-4 py-2 rounded-full hover:bg-white/10 ${
                  showSettings ? 'bg-white/10 text-white' : 'text-white/90'
                }`}
              >
                Settings
              </button>
            </li>
            <li>
              <button type="button" className="w-full text-left px-4 py-2 rounded-full hover:bg-white/10 text-white/90">
                Logout
              </button>
            </li>
          </ul>
          <div className="h-0.5 bg-red-500/60" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#2C7A49] leading-tight">Welcome back!</h2>
            <p className="text-sm text-[#2C7A49]/80 mt-1" id="admin-greeting">{greeting}, Zubair Ahmad</p>
          </div>
          <div className="flex items-center space-x-8">
            <button
              className="relative text-black"
              onClick={(e) => {
                setUseModal(false);
                const rect = e.currentTarget.getBoundingClientRect();
                setNotifAnchorRect(rect);
                setIsNotificationsOpen(true);
                setNotifHasNew(false);
                // Navigate to messages & contact when clicking notifications
                setActiveIndex(menuItems.indexOf('Massages & contact'));
              }}
              aria-label="Notifications"
            >
              {/* Bell icon (bold outline + base dash) */}
              <svg className={`w-7 h-7 ${notifHasNew ? 'animate-ring' : ''}`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M24 23H8c.8-1.03 1.33-2.3 1.33-3.67V15a6.67 6.67 0 1 1 13.34 0v4.33c0 1.37.53 2.64 1.33 3.67Z"/>
                <path d="M12.5 26h7"/>
              </svg>
              {notifHasNew && <span className="absolute -top-1 right-0 w-3.5 h-3.5 bg-red-500 rounded-full"></span>}
            </button>

            <button
              className="text-black"
              onClick={(e) => { setUserAnchorRect(e.currentTarget.getBoundingClientRect()); setIsUserMenuOpen(true); }}
              aria-label="User menu"
            >
              {/* User in grey square */}
              <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="28" height="28" rx="1.8" stroke="#9CA3AF" strokeWidth="2.4"/>
                <circle cx="26" cy="16" r="0" fill="none"/>
                <circle cx="26" cy="26" r="0" fill="none"/>
                <circle cx="20" cy="17" r="5.2" stroke="#000" strokeWidth="2.6"/>
                <path d="M12.5 28.5c2.3-3.2 5.1-4.8 7.5-4.8s5.2 1.6 7.5 4.8" stroke="#000" strokeWidth="2.6"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {hash.startsWith('#supplier-profile') ? (
            <SupplierprofileDetail supplierId={hash.split('id=')[1]?.split('&')[0]} />
          ) : showSettings ? (
            <Settings />
          ) : (
            <>
              {menuItems[activeIndex] === 'Products Management' && <ManageTours />}
              {menuItems[activeIndex] === 'Suppliers' && <AllSuppliersManage />}
              {menuItems[activeIndex] === 'Customers' && <ManageAllCustomers />}
              {menuItems[activeIndex] === 'Reviews & Feedbacks' && <Feedbacks />}
              {menuItems[activeIndex] === 'Massages & contact' && (
                <MessagesContact initialTarget={initialMessageTarget} />
              )}
              {menuItems[activeIndex] === 'Finance' && <Finance />}
              {menuItems[activeIndex] !== 'Products Management' &&
               menuItems[activeIndex] !== 'Suppliers' &&
               menuItems[activeIndex] !== 'Customers' &&
               menuItems[activeIndex] !== 'Reviews & Feedbacks' &&
               menuItems[activeIndex] !== 'Massages & contact' &&
               menuItems[activeIndex] !== 'Finance' && (
                <>
                  <KPICards />
                  <div className="mt-6">
                    <RevenueChart />
                  </div>
                  <div className="mt-6">
                    <SupplierPerformanceTable />
                  </div>
                  
                </>
              )}
            </>
          )}
        </main>
      </div>
      {useModal ? (
        <NotificationsModalFull isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      ) : (
        <NotificationsPopover isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} anchorRect={notifAnchorRect} />
      )}
      <MessagesPopover isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)} anchorRect={msgAnchorRect} />
      <UserMenuPopover
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        anchorRect={userAnchorRect}
        onSettings={() => {
          setIsUserMenuOpen(false);
          if (window && window.location) window.location.hash = '';
          setShowSettings(true);
          setActiveIndex(-1);
        }}
        onSignout={() => {
          setIsUserMenuOpen(false);
          setShowSignOutModal(true);
        }}
      />

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowSignOutModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-[260px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-black mb-5">Sign out</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="w-full h-11 px-4 rounded-2xl text-black font-medium border-2 border-gray-200 bg-white hover:bg-gray-50 transition"
              >
                Cancel to go back
              </button>
              <button
                onClick={() => {
                  // Handle sign out logic here
                  setShowSignOutModal(false);
                  // Add your sign out logic (e.g., clear tokens, redirect to login, etc.)
                  console.log('User signed out');
                }}
                className="w-full h-11 px-4 rounded-2xl text-white font-medium bg-[#FF6B6B] hover:bg-[#ff5252] transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

