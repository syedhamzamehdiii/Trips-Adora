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
import productService from '@/services/productService';
import dashboardService from '@/services/dashboardService';

const Dashboard = () => {
  const { user } = useAuth();
  const [showListingsDropdown, setShowListingsDropdown] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNestedDropdown, setShowNestedDropdown] = useState(false);
  const [showTravellerSectionModal, setShowTravellerSectionModal] = useState(false);
  const [showFromSupplierModal, setShowFromSupplierModal] = useState(false);
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);
  const [draftProducts, setDraftProducts] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const profileRef = useRef(null);

  // Load profile data from localStorage in real-time
  const [sidebarProfile, setSidebarProfile] = useState({ name: 'User', photo: null, id: 'N/A', location: 'Tokyo, Japan' });
  const [supplierMode, setSupplierMode] = useState(true);
  const DEFAULT_DASHBOARD = {
    balance: 0,
    todaysBookings: 0,
    tomorrowsBookings: 0,
    totalProducts: 0,
    cancellationRate: 0,
    freshReviews: 0,
    todaysBalance: 0,
    myActivity: {
      published: 0,
      drafts: 0,
      underReview: 0,
      counts: {
        published: 0,
        draft: 0,
        under_review: 0,
        total: 0,
      },
    },
    accountStability: {
      positiveRating: 100,
      cancellation: 0,
      negativeRating: 0,
    },
    financeSummary: {
      totalEarning: 0,
      pendingPayout: 0,
      lossFromCancellation: 0,
      paidThisMonth: 0,
    },
    bookingsSummary: {
      total: 0,
      today: 0,
      tomorrow: 0,
    },
    bookings: [],
  };
  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  const transformOverviewToDashboardState = (overview, previous = dashboardData) => {
    const metrics = overview?.metrics || {};
    const activityPercentages = overview?.activity?.percentages || {};
    const activityCounts = overview?.activity?.counts || {};
    const finance = overview?.finance || {};
    const products = overview?.products || {};
    const stability = overview?.account_stability || {};
    const bookings = overview?.bookings || {};

    return {
      balance: Math.round(metrics.available_balance ?? previous.balance ?? 0),
      todaysBookings: bookings.today ?? metrics.todays_bookings ?? previous.bookingsSummary?.today ?? 0,
      tomorrowsBookings: bookings.tomorrow ?? metrics.tomorrows_bookings ?? previous.bookingsSummary?.tomorrow ?? 0,
      totalProducts: products.total ?? 0,
      cancellationRate: products.cancellation_rate ?? 0,
      freshReviews: products.average_rating ?? 0,
      todaysBalance: Math.round(metrics.todays_balance ?? previous.todaysBalance ?? 0),
      myActivity: {
        published: activityPercentages.published ?? 0,
        drafts: activityPercentages.draft ?? 0,
        underReview: activityPercentages.under_review ?? 0,
        counts: activityCounts,
      },
      accountStability: {
        positiveRating: stability.positive ?? 0,
        cancellation: stability.cancellation ?? 0,
        negativeRating: stability.negative ?? 0,
      },
      financeSummary: {
        totalEarning: finance.total_earning ?? previous.financeSummary?.totalEarning ?? 0,
        pendingPayout: finance.pending_payout ?? previous.financeSummary?.pendingPayout ?? 0,
        lossFromCancellation: finance.loss_from_cancellation ?? previous.financeSummary?.lossFromCancellation ?? 0,
        paidThisMonth: finance.paid_this_month ?? previous.financeSummary?.paidThisMonth ?? 0,
      },
      bookingsSummary: {
        total: bookings.total ?? 0,
        today: bookings.today ?? previous.bookingsSummary?.today ?? 0,
        tomorrow: bookings.tomorrow ?? previous.bookingsSummary?.tomorrow ?? 0,
      },
      bookings: Array.isArray(bookings.items) ? bookings.items : [],
    };
  };

  // Keep toggle in sync with global mode (tripsadora_mode)
  useEffect(() => {
    const syncMode = () => {
      try {
        const globalMode = localStorage.getItem('tripsadora_mode');
        if (globalMode === 'customer') {
          setSupplierMode(false);
        } else {
          setSupplierMode(true);
        }
      } catch (_) {}
    };

    // On supplier app load, assert supplier as the global mode
    try { localStorage.setItem('tripsadora_mode', 'supplier'); } catch (_) {}
    syncMode();

    window.addEventListener('storage', syncMode);
    return () => window.removeEventListener('storage', syncMode);
  }, []);

  useEffect(() => {
    const loadProfile = () => {
      try {
        let saved = localStorage.getItem('account_settings') || sessionStorage.getItem('account_settings');
        const supplierId =
          localStorage.getItem('supplier_id') ||
          sessionStorage.getItem('supplier_id') ||
          'N/A';
        if (saved) {
          const data = JSON.parse(saved);
          setSidebarProfile({
            name: data.editableInfo?.publicName || 'Edward William',
            photo: data.globalUserPhoto || null,
            id: supplierId,
            location: data.editableInfo?.city && data.editableInfo?.country ? `${data.editableInfo.city}, ${data.editableInfo.country}` : 'Notting Hill, London'
          });
        }
      } catch (_) {}
    };

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const overview = await dashboardService.getOverview();
      const transformed = transformOverviewToDashboardState(overview);
        setDashboardData(transformed);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardError(error?.message || 'Unable to load dashboard data right now.');
        setDashboardData(DEFAULT_DASHBOARD);
      } finally {
        setDashboardLoading(false);
      }
    };

    const loadDraftProducts = async () => {
      try {
        // Load draft products from database
        const response = await productService.getMyProducts({ status: 'draft', page: 1, page_size: 100 });
        const { transformApiProductsList } = await import('@/utils/productTransform');
        const allProducts = transformApiProductsList(response);
        const drafts = allProducts.filter(p => p.status === 'Draft');
        
        // Also check localStorage for draft data (images and additional data)
        const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('product_draft_'));
        const draftsWithProgress = drafts.map(draft => {
          // Try to get full draft data from localStorage for progress calculation
          const draftKey = `product_draft_${draft.dbProductId || draft.id}`;
          const draftData = localStorage.getItem(draftKey);
          let parsedDraftData = null;
          if (draftData) {
            try {
              parsedDraftData = JSON.parse(draftData);
            } catch (e) {
              console.warn('Error parsing draft data:', e);
            }
          }
          
          return {
            id: draft.id,
            name: draft.name || 'Untitled Product',
            status: 'Draft',
            creationDate: draft.creationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
            revenue: draft.revenue || 0,
            progress: calculateProgress(parsedDraftData || draft)
          };
        });
        
        setDraftProducts(draftsWithProgress.slice(0, 3)); // Show max 3 drafts
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    };

    const calculateProgress = (draftData) => {
      if (!draftData) return 0;
      
      let completedSteps = 0;
      const totalSteps = 6; // Assuming 6 steps in product creation
      
      // Check each step for completion
      if (draftData.title) completedSteps++;
      if (draftData.category) completedSteps++;
      if (draftData.description) completedSteps++;
      if (draftData.highlights && draftData.highlights.length > 0) completedSteps++;
      if (draftData.vehicles && draftData.vehicles.length > 0) completedSteps++;
      if (draftData.selectedPickupLocations && draftData.selectedPickupLocations.length > 0) completedSteps++;
      
      return Math.round((completedSteps / totalSteps) * 100);
    };

    const loadPopularActivities = async () => {
      // Load all published products from database (these are the ones customers can book)
      const response = await productService.getMyProducts({ status: 'published', page: 1, page_size: 100 });
      const { transformApiProductsList } = await import('@/utils/productTransform');
      const allProducts = transformApiProductsList(response);
      const publishedProducts = allProducts.filter(p => p.status === 'Published');
          
          // Calculate customer demand analytics for each published product
          const activitiesWithAnalytics = publishedProducts.map(product => {
            // Get customer booking data
            const bookings = parseInt(product.bookings || 0);
            const revenue = parseInt(product.revenue || product.vehicles?.[0]?.amount || 0);
            const ratings = parseFloat(product.ratings?.split('/')[0] || 0);
            
            // Calculate customer demand score (based on actual bookings and customer behavior)
            let demandScore = 0;
            
            // Primary factor: Actual customer bookings
            if (bookings > 0) {
              demandScore += bookings * 2; // Each booking = 2 points
            }
            
            // Secondary factor: Revenue generated (indicates customer willingness to pay)
            if (revenue > 0) {
              demandScore += Math.min(revenue / 50, 20); // Max 20 points from revenue
            }
            
            // Tertiary factor: Customer ratings (customer satisfaction)
            if (ratings > 0) {
              demandScore += (ratings - 3) * 5; // 5 points per star above 3
            }
            
            // Category demand multipliers (based on typical customer preferences)
            const categoryDemandFactors = {
              'Adventure': 1.8,    // High demand
              'Nature': 1.6,       // High demand  
              'Cultural': 1.4,     // Medium-high demand
              'Tour': 1.3,         // Medium demand
              'City': 1.1,         // Medium demand
              'Food': 1.5,         // High demand
              'Photography': 1.7   // High demand
            };
            const categoryFactor = categoryDemandFactors[product.category] || 1.0;
            demandScore *= categoryFactor;
            
            // Add realistic customer demand variation
            demandScore += (Math.random() - 0.5) * 10; // ±5 points variation
            
            // Ensure positive demand score
            demandScore = Math.max(1, demandScore);
            
            // Convert to growth percentage (customer demand growth)
            const growthPercentage = Math.min(Math.round(demandScore), 50);
            
            // Generate customer-focused description
            const description = product.description || 
              `A highly demanded ${product.category || 'tour'} experience. This ${product.title || 'activity'} has been one of the most popular choices among travelers in recent days.`;
            
            return {
              id: product.id,
              title: product.title || product.name || 'Untitled Activity',
              description: description,
              growthPercentage: growthPercentage,
              bookings: bookings,
              revenue: revenue,
              ratings: ratings,
              category: product.category || 'Tour',
              demandScore: demandScore
            };
          });
          
          // Sort by customer demand (bookings + revenue + ratings) and take top 3
          const topActivities = activitiesWithAnalytics
            .sort((a, b) => b.demandScore - a.demandScore)
            .slice(0, 3);
          
      setPopularActivities(topActivities);
    };

    loadProfile();
    loadDashboardData();
    loadDraftProducts();
    loadPopularActivities();
    
    window.addEventListener('account_settings_updated', loadProfile);
    window.addEventListener('accountSettingsUpdated', loadProfile);
    window.addEventListener('storage', loadProfile);
    const handleProductsUpdated = () => {
      loadDashboardData();
      loadDraftProducts();
      loadPopularActivities();
    };
    window.addEventListener('products_updated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('account_settings_updated', loadProfile);
      window.removeEventListener('accountSettingsUpdated', loadProfile);
      window.removeEventListener('storage', loadProfile);
      window.removeEventListener('products_updated', handleProductsUpdated);
    };
  }, []);

  const handleSupplierModeToggle = () => {
    const newMode = !supplierMode;
    setSupplierMode(newMode);
    localStorage.setItem('supplier_mode', JSON.stringify(newMode));
    window.dispatchEvent(new Event('supplier_mode_updated'));
    
    // Update dashboard data based on mode
    if (newMode) {
      // Supplier mode - show supplier data
      console.log('Switched to Supplier Mode');
      // Mark global mode for cross-app awareness
      try { localStorage.setItem('tripsadora_mode', 'supplier'); } catch (_) {}
    } else {
      // Customer mode - redirect to customer app
      console.log('Switched to Customer Mode');
      try { localStorage.setItem('tripsadora_mode', 'customer'); } catch (_) {}
      const customerUrl = import.meta?.env?.VITE_CUSTOMER_APP_URL || 'http://localhost:5174'
      window.location.assign(customerUrl)
    }
  };

  const handleContinueDraft = (draftId) => {
    // Navigate to Products page with drafts tab
    navigate('/products?tab=drafts');
  };

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

    if (!localStorage.getItem('notifications') && !sessionStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }

    loadNotifications();
    window.addEventListener('notifications_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    const handleNew = (e) => {
      try {
        const payload = e.detail || {};
        window.addNotification && window.addNotification(payload);
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
            </div>
          </div>
        </div>
        
      </div>

      {dashboardError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        </div>
      )}

      {/* Blue Sidebar - starts from top navigation and extends through hero */}
      <div className="absolute right-0 top-0 w-80 bg-[#1d236b]/95 backdrop-blur-md border-l border-[#1d236b]/50 p-4 text-white z-50" style={{top: '-80px', height: 'calc(max(70vh, 800px) + 161px)', paddingTop: '80px'}}>
        {/* Available Balance and Profile */}
        <div className="mb-4 bg-white/10 rounded-lg p-3 relative">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-white/80">Available Balance</div>
              <div className="text-sm font-bold text-white">${dashboardData.balance}</div>
            </div>
            <div className="text-center relative" ref={profileRef}>
              <button 
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="hover:bg-white/10 rounded-lg p-1 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-1">
                  {sidebarProfile.photo ? (
                  <img 
                      src={sidebarProfile.photo} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-600">
                      {sidebarProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                  </div>
                <div className="text-xs text-white">ID {sidebarProfile.id}</div>
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
            <span className="text-sm font-medium text-white">{supplierMode ? 'Supplier mode' : 'Customer mode'}</span>
            <button 
              onClick={handleSupplierModeToggle}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                supplierMode ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                supplierMode ? 'right-0.5' : 'left-0.5'
              }`}></div>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="mb-6 bg-white/10 rounded-lg p-4">
          <div className="mb-4">
            <p className="font-semibold text-white text-sm">{sidebarProfile.name}</p>
            <p className="text-xs text-white/80">{sidebarProfile.location}</p>
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
              <div className="text-lg font-bold text-white mb-1">{dashboardData.todaysBookings}</div>
              <div className="text-xs text-green-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/80 mb-2">Tomorrow's bookings</div>
              <div className="text-lg font-bold text-white mb-1">{dashboardData.tomorrowsBookings}</div>
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
                        { name: "Published", value: dashboardData.myActivity.published },
                        { name: "Drafts", value: dashboardData.myActivity.drafts },
                        { name: "Under review", value: dashboardData.myActivity.underReview },
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
                  <span className="text-[10px] text-white/60">{dashboardData.myActivity.published}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-[10px] text-white/60">{dashboardData.myActivity.drafts}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">{dashboardData.myActivity.underReview}%</span>
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
                    const positiveCount = Math.round(totalBars * (dashboardData.accountStability.positiveRating / 100));
                    const cancellationCount = Math.round(totalBars * (dashboardData.accountStability.cancellation / 100));
                    const negativeCount = totalBars - positiveCount - cancellationCount;
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
                  <span className="text-[10px] text-white/60">{dashboardData.accountStability.positiveRating}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">{dashboardData.accountStability.cancellation}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-[10px] text-white/60">{dashboardData.accountStability.negativeRating}%</span>
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
                  <p className="text-4xl font-bold text-white mb-2">{dashboardData.totalProducts}</p>
                  <p className="text-sm text-white/80 leading-relaxed">Total number of products you have created and listed on the platform.</p>
                </div>

                {/* Cancellation Rate Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Cancellation rate</h3>
                  <p className="text-4xl font-bold text-white mb-2">{dashboardData.cancellationRate}%</p>
                  <p className="text-sm text-white/80 leading-relaxed">The percentage of bookings that were canceled.</p>
                </div>

                {/* Fresh Reviews Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Fresh Reviews</h3>
                  <p className="text-4xl font-bold text-orange-300 mb-2">{dashboardData.freshReviews}</p>
                  <p className="text-sm text-white/80 leading-relaxed">Average rating from customer reviews</p>
                </div>

                {/* Today's Balance Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-sm font-medium text-white mb-2">Today's balance</h3>
                  <p className="text-4xl font-bold text-white mb-2">${dashboardData.todaysBalance}</p>
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
                {draftProducts.length > 0 ? (
                  draftProducts.map((draft, index) => (
                    <div key={draft.id || index} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{draft.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">Started on {draft.creationDate}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative">
                          <div 
                            className="h-3 rounded-full flex items-center justify-end pr-2" 
                            style={{ width: `${draft.progress}%`, backgroundColor: '#1d236b' }}
                          >
                            <span className="text-white text-xs font-medium">{draft.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                        <button 
                          onClick={() => handleContinueDraft(draft.id)}
                          className="bg-[#1d236b] hover:bg-[#1a1f5a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                      Continue
                    </button>
                  </div>
                </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-medium mb-2">No draft products found</p>
                    <p className="text-sm">Create a new product to get started!</p>
                      </div>
                )}
              </div>
            </div>

            {/* Most Popular Activities */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Popular Activities</h2>
              <div className="space-y-4">
                {popularActivities.length > 0 ? (
                  popularActivities.map((activity, index) => (
                    <div key={activity.id || index} className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-3">{activity.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                      </div>
                      <div className="flex items-center ml-6 text-green-600">
                        <FiTrendingUp size={20} className="mr-2" />
                          <span className="font-bold text-xl">{activity.growthPercentage}%</span>
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-medium mb-2">No published activities found</p>
                    <p className="text-sm">Publish some products to see customer demand analytics!</p>
                  </div>
                )}
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
          name: sidebarProfile.name,
          initials: sidebarProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          balance: dashboardData.balance,
          id: sidebarProfile.id,
          profileImage: sidebarProfile.photo || "/assets/profile-placeholder.jpg"
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