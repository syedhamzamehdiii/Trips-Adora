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
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/common/Footer';
import BookingRevenueChart from '@/components/dashboard/BookingRevenueChart';
import FeedbackReviewChart from '@/components/dashboard/FeedbackReviewChart';
import ResponseInsightsChart from '@/components/dashboard/ResponseInsightsChart';
import bookingService from '@/services/bookingService';
import productService from '@/services/productService';

const InsightsPage = () => {
  const navigate = useNavigate();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [selectedCountryOption, setSelectedCountryOption] = useState('Top 10 Countries');
  const [selectedChartOption, setSelectedChartOption] = useState('Last 6 months');
  const [language, setLanguage] = useState('US English');
  const [currency, setCurrency] = useState('$ USD - US Dollar');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'feedback'
  const countryDropdownRef = useRef(null);
  const chartDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setShowChartDropdown(false);
      }
    };

    if (showCountryDropdown || showChartDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown, showChartDropdown]);

  // Real-time stats (use snapshot from localStorage for instant load)
  const [summaryStats, setSummaryStats] = useState([
    { number: '00', label: 'Booking this month' },
    { number: '00', label: 'Total Bookings' },
    { number: '0.0%', label: 'Cancellation Rate' },
    { number: '0.0', label: 'Average Rating' }
  ]);

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

  const [countryData, setCountryData] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [cancellationRate, setCancellationRate] = useState(0);
  const [safetyMargin, setSafetyMargin] = useState(50);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    priceAlignment: { value: 0, status: 'Needs Improvement', description: '$ Competitive pricing vs market average' },
    customerReviews: { value: '0.0', count: 0, status: 'Needs Improvement', description: 'Average rating from 0 reviews' },
    responseTime: { value: '<2 hours', status: 'Needs Improvement', description: 'Faster than 80% of operators' },
    cancellationRate: { value: '0.0', status: 'Excellent', description: 'Well below 60% suspension threshold' }
  });

  // Load last insights snapshot synchronously for instant render
  useEffect(() => {
    try {
      const raw = localStorage.getItem('insights_snapshot_v1');
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (Array.isArray(snap.summaryStats)) setSummaryStats(snap.summaryStats);
      if (Array.isArray(snap.countryData)) setCountryData(snap.countryData);
      if (Array.isArray(snap.productPerformance)) setProductPerformance(snap.productPerformance);
      if (typeof snap.cancellationRate === 'number') setCancellationRate(snap.cancellationRate);
      if (typeof snap.safetyMargin === 'number') setSafetyMargin(snap.safetyMargin);
      if (snap.performanceMetrics) setPerformanceMetrics(prev => ({ ...prev, ...snap.performanceMetrics }));
    } catch (_) {
      // Ignore snapshot errors and fall back to defaults
    }
  }, []);

  // Helper to parse numbers from currency strings
  const parseAmountNumber = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
    return 0;
  };

  // Load real-time data from backend (bookings + products)
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch bookings and products from backend APIs
        const [bookingsResp, productsResp] = await Promise.all([
          bookingService.getBookings({ limit: 500, skip: 0 }),
          productService.getMyProducts({ summary: true }),
        ]);

        const rawBookings = Array.isArray(bookingsResp?.bookings) ? bookingsResp.bookings : [];
        const bookingStats = bookingsResp?.stats || {};
        const bookings = rawBookings.map((booking) => ({
          id: booking.id,
          productId: booking.product_id,
          booking: booking.title || booking.tour_name || 'Booking',
          customerEmail: booking.customer_email || '',
          bookedOn: booking.created_at || null,
          travelDate: booking.start_date || null,
          status: booking.status || 'pending',
          amount: booking.total_amount || 0,
          currency: booking.currency || 'USD',
          rating: booking.metadata?.rating || null,
          reviewScore: booking.metadata?.reviewScore || null,
          metadata: booking.metadata || {},
        }));

        const products = Array.isArray(productsResp?.products)
          ? productsResp.products
          : Array.isArray(productsResp?.items)
          ? productsResp.items
          : Array.isArray(productsResp)
          ? productsResp
          : [];

        // Summary: total bookings (prefer backend stats for consistency)
        const totalBookings = typeof bookingStats.total === 'number'
          ? bookingStats.total
          : (Array.isArray(bookings) ? bookings.length : 0);

        // Summary: bookings this month (by travelDate or bookedOn)
        const now = new Date();
        const isSameMonth = (d) => d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        const parseDate = (s) => {
          if (!s) return null;
          const d = new Date(s);
          if (!isNaN(d)) return d;
          // Try formats like "Jan 13, 2024"
          try { return new Date(Date.parse(s)); } catch { return null; }
        };
        const bookingsThisMonth = (bookings || []).filter(b => {
          const td = parseDate(b.travelDate);
          const bd = parseDate(b.bookedOn);
          return isSameMonth(td || bd || null);
        }).length;

        // Summary: cancellation rate (use backend stats so it matches supplier bookings)
        const cancelledFromStats =
          (bookingStats.by_status && (bookingStats.by_status.cancelled ?? bookingStats.by_status.canceled)) || 0;
        const cancellationRate = totalBookings > 0 ? ((cancelledFromStats / totalBookings) * 100) : 0;

        // Summary: average rating from multiple real-time sources
        const ratings = [];
        // 1) all_products ratings if present
        (products || []).forEach(p => {
          const n = parseFloat(p.ratings);
          if (!isNaN(n) && n > 0) ratings.push(n);
        });
        // 2) product_full_* and product_draft_* payloads that may contain ratings
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            if (k.startsWith('product_full_') || k.startsWith('product_draft_')) {
              const raw = localStorage.getItem(k);
              if (!raw) continue;
              const obj = JSON.parse(raw);
              const n = parseFloat(obj?.ratings || obj?.averageRating || obj?.rating);
              if (!isNaN(n) && n > 0) ratings.push(n);
            }
          }
        } catch (_) {}
        // 3) bookings reviews if stored as rating per booking or metadata from customer reviews
        (bookings || []).forEach(b => {
          const n = parseFloat(
            b.rating ||
            b.reviewScore ||
            (b.metadata && (b.metadata.avg_rating || b.metadata.averageRating || b.metadata.rating))
          );
          if (!isNaN(n) && n > 0) ratings.push(n);
        });
        const avgRating = ratings.length > 0 ? (ratings.reduce((a,b)=>a+b,0)/ratings.length) : 0.0;

        setSummaryStats([
          { number: String(bookingsThisMonth), label: 'Booking this month' },
          { number: String(totalBookings), label: 'Total Bookings' },
          { number: `${cancellationRate.toFixed(1)}%`, label: 'Cancellation Rate' },
          { number: avgRating.toFixed(1), label: 'Average Rating' }
        ]);

        // Calculate country analytics from bookings
        const countryMap = new Map(); // country -> { bookings: [], productCounts: Map }
        (bookings || []).forEach(b => {
          const email = (b.customerEmail || '').toLowerCase();
          let country = 'Unknown';
          if (email.includes('jp') || email.includes('japan')) country = 'Japan';
          else if (email.includes('uk') || email.includes('co.uk')) country = 'United Kingdom';
          else if (email.includes('us') || email.includes('.com')) country = 'United States';
          else if (email.includes('in') || email.includes('india')) country = 'India';
          else if (email.includes('fr') || email.includes('france')) country = 'France';
          else if (email.includes('de') || email.includes('germany')) country = 'Germany';
          else if (email.includes('ca') || email.includes('canada')) country = 'Canada';
          else if (email.includes('cn') || email.includes('china')) country = 'China';
          else if (email.includes('ae') || email.includes('uae')) country = 'UAE';
          else country = 'United States'; // Default fallback
          
          const entry = countryMap.get(country) || { bookings: 0, productCounts: new Map() };
          entry.bookings += 1;
          const productName = b.booking || b.productId || 'Unknown Product';
          const prodCount = entry.productCounts.get(productName) || 0;
          entry.productCounts.set(productName, prodCount + 1);
          countryMap.set(country, entry);
        });
        // Get top product for each country and calculate usage
        const totalBookingCount = (bookings || []).length;
        const countryList = Array.from(countryMap.entries())
          .map(([country, data]) => {
            const topProduct = Array.from(data.productCounts.entries())
              .sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
            const usage = totalBookingCount > 0 ? Math.round((data.bookings / totalBookingCount) * 100) : 0;
            return {
              country,
              bookings: data.bookings,
              topProduct,
              usage
            };
          })
          .sort((a,b) => b.bookings - a.bookings)
          .slice(0, parseInt(selectedCountryOption.replace(/[^0-9]/g, '') || '10', 10))
          .map((item, idx) => ({
            rank: String(idx + 1).padStart(2, '0'),
            country: item.country,
            bookings: `${item.bookings}+`,
            topProduct: item.topProduct,
            usage: item.usage,
            color: item.usage >= 80 ? 'text-green-600' : 'text-red-600'
          }));
        setCountryData(countryList);

        // Product performance - Top 4 by revenue or bookings
        const productIdToAgg = new Map();
        (bookings || []).forEach(b => {
          const key = b.productId || b.booking;
          const current = productIdToAgg.get(key) || { name: b.booking, count: 0, revenue: 0 };
          current.count += 1;
          current.revenue += parseAmountNumber(b.amount);
          productIdToAgg.set(key, current);
        });
        // Merge with products revenue if present
        (products || []).forEach(p => {
          const key = p.id || p.referenceCode || p.name;
          const current = productIdToAgg.get(key) || { name: p.name || p.title, count: 0, revenue: 0 };
          current.revenue += parseAmountNumber(p.revenue);
          current.name = current.name || p.name || p.title;
          current.tourType = p.tourType || p.details?.split(' > ')[1] || 'Private tour';
          productIdToAgg.set(key, current);
        });
        const top = Array.from(productIdToAgg.values())
          .sort((a,b) => b.revenue - a.revenue || b.count - a.count)
          .slice(0,4)
          .map((item, idx) => ({
            rank: String(idx+1).padStart(2,'0'),
            name: item.name || `Product #${idx+1}`,
            tourType: item.tourType || 'Private tour',
            revenue: `$${Math.round(item.revenue).toLocaleString()}`,
            increase: `${(Math.min(25, item.count * 1.2)).toFixed(1)}%`,
            bookings: String(item.count)
          }));
        setProductPerformance(top);

        // Calculate cancellation rate for circular progress
        const cancelledCount = (bookings || []).filter(b => {
          const s = (b.status || '').toLowerCase();
          return s === 'canceled' || s === 'cancelled' || s === 'refund/dispute' || s === 'refund' || s === 'refunded';
        }).length;
        const bookingCount = (bookings || []).length;
        const currentRate = bookingCount > 0 ? ((cancelledCount / bookingCount) * 100) : 0;
        const safetyMarginRemaining = Math.max(0, 50 - currentRate);
        setCancellationRate(currentRate);
        setSafetyMargin(safetyMarginRemaining);

        // Calculate Performance Metrics
        // 1. Price Alignment (mock calculation - would need market data, using product pricing diversity)
        const productPrices = (products || []).map(p => parseAmountNumber(p.revenue || p.price || 0)).filter(p => p > 0);
        const avgPrice = productPrices.length > 0 ? productPrices.reduce((a,b)=>a+b,0)/productPrices.length : 0;
        const priceVariance = productPrices.length > 0 
          ? productPrices.reduce((sum, p) => sum + Math.abs(p - avgPrice), 0) / productPrices.length 
          : 0;
        const priceAlignment = avgPrice > 0 ? Math.max(0, Math.min(100, 100 - (priceVariance / avgPrice * 100))) : 92;
        const priceStatus = priceAlignment >= 90 ? 'Excellent' : priceAlignment >= 75 ? 'Good' : 'Needs Improvement';

        // 2. Customer Reviews
        const reviewCount = ratings.length; // Already calculated above
        const reviewValue = avgRating > 0 ? avgRating.toFixed(1) : '0.0';
        const reviewStatus = avgRating >= 4.5 ? 'Excellent' : avgRating >= 4.0 ? 'Good' : avgRating >= 3.0 ? 'Fair' : 'Needs Improvement';

        // 3. Response Time (calculate based on booking completion rate)
        const completedBookings = (bookings || []).filter(b => b.status === 'Completed' || b.status === 'Confirmed').length;
        const responseTimeValue = bookingCount > 0 && (completedBookings / bookingCount) >= 0.8 ? '<1 hour' : '<2 hours';
        const responseTimeStatus = bookingCount > 0 && (completedBookings / bookingCount) >= 0.8 ? 'Excellent' : bookingCount > 0 && (completedBookings / bookingCount) >= 0.5 ? 'Good' : 'Needs Improvement';

        // 4. Cancellation Rate (already calculated)
        const cancelStatus = currentRate <= 3 ? 'Excellent' : currentRate <= 10 ? 'Good' : currentRate <= 30 ? 'Fair' : 'Needs Improvement';

        const newPerformanceMetrics = {
          priceAlignment: {
            value: Math.round(priceAlignment),
            status: priceStatus,
            description: '$ Competitive pricing vs market average'
          },
          customerReviews: {
            value: reviewValue,
            count: reviewCount,
            status: reviewStatus,
            description: `Average rating from ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`
          },
          responseTime: {
            value: responseTimeValue,
            status: responseTimeStatus,
            description: 'Faster than 80% of operators'
          },
          cancellationRate: {
            value: currentRate.toFixed(1),
            status: cancelStatus,
            description: 'Well below 60% suspension threshold'
          }
        };
        setPerformanceMetrics(newPerformanceMetrics);

        // Persist snapshot for instant loads next time
        try {
          const snapshot = {
            summaryStats: [
              { number: String(bookingsThisMonth), label: 'Booking this month' },
              { number: String(totalBookings), label: 'Total Bookings' },
              { number: `${cancellationRate.toFixed(1)}%`, label: 'Cancellation Rate' },
              { number: avgRating.toFixed(1), label: 'Average Rating' }
            ],
            countryData: countryList,
            productPerformance: top,
            cancellationRate: currentRate,
            safetyMargin: safetyMarginRemaining,
            performanceMetrics: newPerformanceMetrics,
          };
          localStorage.setItem('insights_snapshot_v1', JSON.stringify(snapshot));
        } catch (_) {
          // Non-fatal if snapshot fails
        }

        // Persist normalized bookings and products for charts that still read from storage
        // (e.g., BookingRevenueChart). This keeps them real-time but backed by the DB.
        try {
          localStorage.setItem('bookings', JSON.stringify(bookings));
          localStorage.setItem('all_products', JSON.stringify(products));
          window.dispatchEvent(new Event('bookings_updated'));
          window.dispatchEvent(new Event('products_updated'));
        } catch (e) {
          // Non-fatal if storage fails
        }
      } catch (e) {
        // Fallbacks are already set
      }
    };

    load();

    const handleRefresh = () => {
      load();
    };

    window.addEventListener('storage', handleRefresh);
    window.addEventListener('bookings_updated', handleRefresh);
    window.addEventListener('products_updated', handleRefresh);
    window.addEventListener('reviews_updated', handleRefresh);
    window.addEventListener('supplier_bookings_updated', handleRefresh);
    return () => {
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('bookings_updated', handleRefresh);
      window.removeEventListener('products_updated', handleRefresh);
      window.removeEventListener('reviews_updated', handleRefresh);
      window.removeEventListener('supplier_bookings_updated', handleRefresh);
    };
  }, [selectedCountryOption]);

  return (
    <div className="min-h-screen bg-white relative">
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
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-[#1d236b] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'feedback' 
                  ? 'bg-[#1d236b] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Chart and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Chart - Changes based on active tab */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            {activeTab === 'overview' ? (
              <BookingRevenueChart />
            ) : (
              <FeedbackReviewChart />
            )}
          </div>

          {/* Right Chart - Changes based on active tab */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            {activeTab === 'overview' ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Detailed Country Analytics
                      </h3>
                      <p className="text-sm text-gray-600">
                        Complete breakdown of booking metrics and product preferences by country.
                      </p>
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
                                  selectedCountryOption === option ? 'bg-[#1d236b]/10' : ''
                                }`}
                              >
                                <div className={`w-4 h-4 border-2 rounded ${
                                  selectedCountryOption === option 
                                    ? 'bg-[#1d236b] border-[#1d236b]' 
                                    : 'border-gray-300'
                                }`}>
                                  {selectedCountryOption === option && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                                <span className={selectedCountryOption === option ? 'text-[#1d236b] font-medium' : 'text-gray-700'}>
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
                            <span className={`text-sm font-medium ${country.color || (country.usage >= 80 ? 'text-green-600' : 'text-red-600')}`}>
                              {country.usage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <ResponseInsightsChart />
            )}
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Circular Progress */}
          <div className="bg-stone-50 border border-gray-200 rounded-lg p-6">
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
                    className="text-[#1d236b]"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${cancellationRate * 2}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{cancellationRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Current Rate</div>
              <p className="text-sm text-gray-600">
                To avoid restrictions, maintain cancellation rates below 50% by completing accepted trip requests without skipping them.
              </p>
              <p className="text-sm text-green-600 font-medium mt-2">
                {safetyMargin.toFixed(1)}% safety margin remaining
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-stone-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Price Alignment</div>
                  <div className="text-sm text-gray-600">{performanceMetrics.priceAlignment.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{performanceMetrics.priceAlignment.value}%</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    performanceMetrics.priceAlignment.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                    performanceMetrics.priceAlignment.status === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{performanceMetrics.priceAlignment.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Customer Reviews</div>
                  <div className="text-sm text-gray-600">{performanceMetrics.customerReviews.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{performanceMetrics.customerReviews.value}/5</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    performanceMetrics.customerReviews.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                    performanceMetrics.customerReviews.status === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{performanceMetrics.customerReviews.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Response Time</div>
                  <div className="text-sm text-gray-600">{performanceMetrics.responseTime.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{performanceMetrics.responseTime.value}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    performanceMetrics.responseTime.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                    performanceMetrics.responseTime.status === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{performanceMetrics.responseTime.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Cancellation Rate</div>
                  <div className="text-sm text-gray-600">{performanceMetrics.cancellationRate.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{performanceMetrics.cancellationRate.value}%</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    performanceMetrics.cancellationRate.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                    performanceMetrics.cancellationRate.status === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{performanceMetrics.cancellationRate.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Improvement Recommendations */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Improvement Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`border border-gray-200 rounded-lg p-4 ${
              performanceMetrics.priceAlignment.status === 'Excellent' ? 'bg-green-50' :
              performanceMetrics.priceAlignment.status === 'Good' ? 'bg-yellow-50' :
              'bg-[#1d236b]/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Price Alignment ({performanceMetrics.priceAlignment.value}%)</h4>
                <FiDollarSign className={`${
                  performanceMetrics.priceAlignment.status === 'Excellent' ? 'text-green-600' :
                  performanceMetrics.priceAlignment.status === 'Good' ? 'text-yellow-600' :
                  'text-[#1d236b]'
                }`} size={20} />
              </div>
              <p className="text-sm text-gray-600">
                {performanceMetrics.priceAlignment.status === 'Excellent' 
                  ? 'Your pricing is competitive and well-positioned in the market. Consider seasonal pricing adjustments for peak demand periods. Monitor competitor pricing weekly to maintain your edge.'
                  : performanceMetrics.priceAlignment.status === 'Good'
                  ? 'Your pricing is good but could be more competitive. Analyze market trends and adjust prices to match competitor offerings while maintaining profitability.'
                  : 'Your pricing may need adjustment. Research competitor pricing and market rates to improve your price alignment and attract more bookings.'}
              </p>
            </div>
            <div className={`border border-gray-200 rounded-lg p-4 ${
              performanceMetrics.customerReviews.status === 'Excellent' ? 'bg-yellow-50' :
              performanceMetrics.customerReviews.status === 'Good' ? 'bg-green-50' :
              'bg-[#1d236b]/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Customer Reviews ({performanceMetrics.customerReviews.value}/5)</h4>
                <FiStar className={`${
                  performanceMetrics.customerReviews.status === 'Excellent' ? 'text-yellow-600' :
                  performanceMetrics.customerReviews.status === 'Good' ? 'text-green-600' :
                  'text-[#1d236b]'
                }`} size={20} />
              </div>
              <p className="text-sm text-gray-600">
                {performanceMetrics.customerReviews.status === 'Excellent' 
                  ? 'Excellent rating! Continue providing exceptional experiences. Follow up with guests post-experience to encourage more reviews. Respond to all reviews to show engagement and care.'
                  : performanceMetrics.customerReviews.status === 'Good'
                  ? 'Good rating! Focus on consistent quality and customer satisfaction. Encourage satisfied customers to leave reviews and address any negative feedback promptly.'
                  : 'Work on improving customer experience. Gather feedback actively, address concerns quickly, and enhance service quality to boost your ratings.'}
              </p>
            </div>
            <div className={`border border-gray-200 rounded-lg p-4 ${
              performanceMetrics.responseTime.status === 'Excellent' ? 'bg-[#1d236b]/10' :
              performanceMetrics.responseTime.status === 'Good' ? 'bg-green-50' :
              'bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Response Time ({performanceMetrics.responseTime.value})</h4>
                <FiClock className={`${
                  performanceMetrics.responseTime.status === 'Excellent' ? 'text-[#1d236b]' :
                  performanceMetrics.responseTime.status === 'Good' ? 'text-green-600' :
                  'text-red-600'
                }`} size={20} />
              </div>
              <p className="text-sm text-gray-600">
                {performanceMetrics.responseTime.status === 'Excellent' 
                  ? 'Outstanding response times! Keep up the great work! Set up mobile notifications to maintain quick responses. Consider auto-responses for common inquiries.'
                  : performanceMetrics.responseTime.status === 'Good'
                  ? 'Good response time! Continue monitoring and aim to respond even faster. Set up automated responses for frequently asked questions to improve efficiency.'
                  : 'Response time needs improvement. Prioritize quick responses to customer inquiries. Set up mobile notifications and consider automated responses for common questions.'}
              </p>
            </div>
            <div className={`border border-gray-200 rounded-lg p-4 ${
              performanceMetrics.cancellationRate.status === 'Excellent' ? 'bg-purple-50' :
              performanceMetrics.cancellationRate.status === 'Good' ? 'bg-green-50' :
              'bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Cancellation Rate ({performanceMetrics.cancellationRate.value}%)</h4>
                <FiX className={`${
                  performanceMetrics.cancellationRate.status === 'Excellent' ? 'text-purple-600' :
                  performanceMetrics.cancellationRate.status === 'Good' ? 'text-green-600' :
                  'text-red-600'
                }`} size={20} />
              </div>
              <p className="text-sm text-gray-600">
                {performanceMetrics.cancellationRate.status === 'Excellent' 
                  ? 'Exceptional cancellation rate far below danger threshold. Send confirmation reminders 24-48 hours before activities. Maintain clear communication about weather policies.'
                  : performanceMetrics.cancellationRate.status === 'Good'
                  ? 'Good cancellation rate! Continue maintaining reliable service. Implement confirmation reminders and clear policies to minimize cancellations further.'
                  : 'Cancellation rate is higher than ideal. Focus on improving service reliability, clear communication, and flexible rescheduling options to reduce cancellations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Performance Status */}
        {(() => {
          const excellentCount = [
            performanceMetrics.priceAlignment.status === 'Excellent',
            performanceMetrics.customerReviews.status === 'Excellent',
            performanceMetrics.responseTime.status === 'Excellent',
            performanceMetrics.cancellationRate.status === 'Excellent'
          ].filter(Boolean).length;
          const goodCount = [
            performanceMetrics.priceAlignment.status === 'Good',
            performanceMetrics.customerReviews.status === 'Good',
            performanceMetrics.responseTime.status === 'Good',
            performanceMetrics.cancellationRate.status === 'Good'
          ].filter(Boolean).length;
          const needsImprovement = [
            performanceMetrics.priceAlignment.status === 'Needs Improvement',
            performanceMetrics.customerReviews.status === 'Needs Improvement',
            performanceMetrics.responseTime.status === 'Needs Improvement',
            performanceMetrics.cancellationRate.status === 'Needs Improvement'
          ].filter(Boolean).length;
          
          const isExcellent = excellentCount >= 3 && needsImprovement === 0;
          const isGood = (excellentCount + goodCount) >= 3 && needsImprovement === 0;
          
          if (isExcellent) {
            return (
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
            );
          } else if (isGood) {
            return (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Good Performance!</span> Most of your metrics are performing well. Focus on areas that need improvement to reach excellent status across all metrics.
                  </p>
                </div>
              </div>
            );
          } else {
            return (
              <div className="bg-[#1d236b]/10 border border-[#1d236b]/30 rounded-lg p-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#1d236b] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Room for Improvement</span> Some metrics need attention. Review the recommendations below and take action to improve your performance across all areas.
                  </p>
                </div>
              </div>
            );
          }
        })()}

        {/* High-Impact Product Performance */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High-Impact Product Performance</h3>
          <div className="space-y-4">
            {productPerformance.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#1d236b]/20 text-[#1d236b] rounded-full flex items-center justify-center text-sm font-bold">
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
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Craft Clear Detailed Description</h4>
              <p className="text-sm text-gray-600">
                Write vivid descriptions that paint a picture of the experience. Include specific details about what guests will see, do, and learn. Mention any unique features that set your activity apart from others.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Add High-Quality Photos</h4>
              <p className="text-sm text-gray-600">
                Upload bright, high-resolution photos that showcase the best moments of your experience. Include a mix of action shots, scenic views, and group photos to help travelers visualize their adventure.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
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
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Open Key Dates Early</h4>
              <p className="text-sm text-gray-600">
                Release availability for holidays, weekends, and popular travel periods well in advance. Travelers often plan special trips months ahead and early availability captures more bookings.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Maintain Regular Schedule</h4>
              <p className="text-sm text-gray-600">
                Keep a consistent weekly schedule when possible. Regular availability makes it easier for travelers to plan and helps build customer confidence in your reliability.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
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
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Communicate Early & Often</h4>
              <p className="text-sm text-gray-600">
                Send confirmation emails and helpful reminders prior to your experience. Clear communication about meeting points, what to bring and weather policies reduces no-shows.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Offer Flexible Alternatives</h4>
              <p className="text-sm text-gray-600">
                When weather or circumstances require changes, re-list dates or modified experiences. When possible, flexibility turns potential cancellations into rescheduled bookings.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
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
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Deliver Memorable Experiences</h4>
              <p className="text-sm text-gray-600">
                Go beyond expectations by adding personal touches, sharing local insights, or providing small surprises. Memorable moments create enthusiastic reviews and loyal customers.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Actively Seek Feedback</h4>
              <p className="text-sm text-gray-600">
                Follow up with guests after their experience to gather feedback and encourage reviews. Positive reviews boost your visibility, while constructive feedback helps you improve.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
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
            <FiRefreshCw size={48} className="text-[#1d236b]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Keep growing with fresh insights</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're constantly analyzing market trends and best practices to bring you new recommendations. Check back regularly for fresh insights that can help take your business to the next level.
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <button onClick={() => navigate('/support')} className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
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
      <Footer />
    </div>
  );
};

export default InsightsPage;
