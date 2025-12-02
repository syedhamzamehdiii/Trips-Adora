import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { FiCalendar } from 'react-icons/fi';
import bookingService from '@/services/bookingService';
import productService from '@/services/productService';

const FeedbackReviewChart = () => {
  const [showCountries, setShowCountries] = useState(true);
  const [data, setData] = useState([]);
  const [countryRatings, setCountryRatings] = useState([]);

  // Three-dots menu + info like overview chart
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualMonth, setManualMonth] = useState('');
  const [manualFeedbacks, setManualFeedbacks] = useState('');
  const [manualRating, setManualRating] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Semi annually');
  const menuRef = useRef(null);
  const infoRef = useRef(null);

  // Parse helper
  const parseAmountNumber = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
    return 0;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
    };

    if (showMenuDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenuDropdown]);

  // Close info when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };

    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfo]);

  // Load real-time data from API
  useEffect(() => {
    const buildChartData = (bookings = [], products = []) => {
      try {
        const manualRaw = localStorage.getItem('insights_manual_feedbacks');
        const manual = manualRaw ? JSON.parse(manualRaw) : [];

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();

        // Period length
        let monthCount = 6;
        if (selectedPeriod === 'Annually') {
          monthCount = 12;
        }

        const labels = Array.from({ length: monthCount }).map((_,i) => months[(now.getMonth()-(monthCount-1)+i+12)%12]);
        const counters = new Map(labels.map(m => [m, { feedbacks: 0, ratingSum: 0, ratingCount: 0 }]));
        const parseDate = (s) => { if (!s) return null; const d = new Date(s); return isNaN(d)? new Date(Date.parse(s)) : d; };

        // Count feedbacks based on completed or rated bookings
        (bookings||[]).forEach(b => {
          const d = parseDate(b.travelDate || b.bookedOn);
          if (!d) return; const key = months[d.getMonth()];
          if (!counters.has(key)) return;
          const entry = counters.get(key);
          const r = parseFloat(
            b.rating ||
            b.reviewScore ||
            (b.metadata && (b.metadata.avg_rating || b.metadata.averageRating || b.metadata.rating))
          );
          // If booking is completed or has a rating, treat it as feedback
          const status = (b.status || '').toLowerCase();
          if (status === 'completed' || !isNaN(r) && r > 0) {
            entry.feedbacks += 1;
          }
          if (!isNaN(r) && r > 0) {
            entry.ratingSum += r;
            entry.ratingCount += 1;
          }
        });

        // Product average ratings (to keep trend even if bookings missing)
        (products||[]).forEach(p => {
          const r = parseFloat(p.ratings);
          if (!isNaN(r) && r > 0) {
            const key = labels[labels.length-1];
            if (!counters.has(key)) return;
            const entry = counters.get(key);
            entry.ratingSum += r;
            entry.ratingCount += 1;
          }
        });

        // Manual overrides
        (manual||[]).forEach(m => {
          const key = m.month;
          if (!counters.has(key)) return;
          const entry = counters.get(key);
          const f = parseInt(m.feedbacks || 0, 10);
          const r = parseFloat(m.rating || 0);
          if (!isNaN(f)) entry.feedbacks += f;
          if (!isNaN(r) && r > 0) {
            entry.ratingSum += r;
            entry.ratingCount += 1;
          }
        });

        const out = labels.map(m => {
          const entry = counters.get(m) || { feedbacks: 0, ratingSum: 0, ratingCount: 0 };
          const avg = entry.ratingCount > 0 ? (entry.ratingSum / entry.ratingCount) : 0;
          return {
            month: m,
            feedbacks: entry.feedbacks,
            reviews: Math.max(0, Math.min(5.0, avg || 0))
          };
        });
        setData(out);

        // Build top-country ratings (real-time, based on bookings ratings)
        const countryMap = new Map(); // country -> { sum, count }
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
          else country = 'United States';

          const r = parseFloat(b.rating || b.reviewScore);
          if (isNaN(r) || r <= 0) return;

          const entry = countryMap.get(country) || { sum: 0, count: 0 };
          entry.sum += r;
          entry.count += 1;
          countryMap.set(country, entry);
        });

        const topCountries = Array.from(countryMap.entries())
          .map(([name, v]) => ({
            name,
            rating: v.count > 0 ? (v.sum / v.count) : 0
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4)
          .map(c => ({ name: c.name, rating: Number(c.rating.toFixed(1)) }));

        setCountryRatings(topCountries);
      } catch (_) {}
    };

    const buildChartDataFromStorage = () => {
      try {
        const bookingsRaw = localStorage.getItem('bookings') || sessionStorage.getItem('bookings');
        const productsRaw = localStorage.getItem('all_products');
        const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];
        const products = productsRaw ? JSON.parse(productsRaw) : [];
        buildChartData(bookings, products);
      } catch (_) {}
    };

    const loadRealTimeData = async () => {
      try {
        // Fetch bookings and products from backend APIs (real-time)
        const [bookingsResp, productsResp] = await Promise.all([
          bookingService.getBookings({ limit: 500, skip: 0 }),
          productService.getMyProducts({ summary: true }),
        ]);

        const rawBookings = Array.isArray(bookingsResp?.bookings) ? bookingsResp.bookings : [];
        const bookings = rawBookings.map((booking) => ({
          id: booking.id,
          productId: booking.product_id,
          customerEmail: booking.customer_email || '',
          bookedOn: booking.created_at || null,
          travelDate: booking.start_date || booking.travel_date || null,
          status: booking.status || 'pending',
          rating: booking.metadata?.rating || booking.rating || null,
          reviewScore: booking.metadata?.reviewScore || booking.review_score || null,
          metadata: booking.metadata || {},
        }));

        const products = Array.isArray(productsResp?.products)
          ? productsResp.products
          : Array.isArray(productsResp?.items)
          ? productsResp.items
          : Array.isArray(productsResp)
          ? productsResp
          : [];

        // Store in localStorage for instant loads next time
        try {
          localStorage.setItem('bookings', JSON.stringify(bookings));
          localStorage.setItem('all_products', JSON.stringify(products));
        } catch (_) {
          // Non-fatal if storage fails
        }

        // Build chart data with real-time data
        buildChartData(bookings, products);
      } catch (error) {
        console.error('Error loading real-time feedback data:', error);
        // Fallback to localStorage if API fails
        buildChartDataFromStorage();
      }
    };

    // Load initial data from cache for instant display
    buildChartDataFromStorage();

    // Then fetch fresh data from API
    loadRealTimeData();

    // Listen for updates
    const handleRefresh = () => {
      loadRealTimeData();
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
  }, [selectedPeriod]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const year = new Date().getFullYear();

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
        <p className="text-xs text-gray-600 mb-2">
          {label} {year}
        </p>
        {/* Core information: completed trips with feedback + average rating */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#A78BFA' }}></div>
            <span className="text-xs text-gray-600 mr-2">Feedbacks (completed trips):</span>
            <span className="text-xs font-semibold">{payload[0]?.value}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#FB923C' }}></div>
            <span className="text-xs text-gray-600 mr-2">Average rating:</span>
            <span className="text-xs font-semibold">{payload[1]?.value}</span>
          </div>
        </div>

        {/* When toggle is ON, also show top countries satisfaction snapshot */}
        {showCountries && countryRatings.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-700 mb-1">
              Top 4 countries (avg rating)
            </p>
            <div className="space-y-1">
              {countryRatings.map((c, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="mr-4 text-gray-600">{c.name}</span>
                  <span className="font-semibold text-gray-900">{c.rating}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CustomDot = (props) => {
    const { cx, cy, fill } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={5} 
        fill="#FB923C"
        stroke="#FB923C"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm w-full">
      {/* Header */}
      <div className="mb-6 relative">
        {/* Menu dots */}
        <div ref={menuRef} className="absolute top-0 right-0">
          <button
            onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            className="flex flex-col gap-1 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </button>

          {/* Dropdown Menu */}
          {showMenuDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Feedbacks for the period</h3>
                
                {/* Period Options */}
                <div className="space-y-3 mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="period_feedback"
                        value="Semi annually"
                        checked={selectedPeriod === 'Semi annually'}
                        onChange={(e) => {
                          setSelectedPeriod(e.target.value);
                          setShowMenuDropdown(false);
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        selectedPeriod === 'Semi annually'
                          ? 'border-[#1d236b] bg-[#1d236b]'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {selectedPeriod === 'Semi annually' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-900">Semi annually</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="period_feedback"
                        value="Annually"
                        checked={selectedPeriod === 'Annually'}
                        onChange={(e) => {
                          setSelectedPeriod(e.target.value);
                          setShowMenuDropdown(false);
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        selectedPeriod === 'Annually'
                          ? 'border-[#1d236b] bg-[#1d236b]'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {selectedPeriod === 'Annually' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-900">Annually</span>
                  </label>
                </div>

                {/* Add manually */}
                {!showManualForm ? (
                  <button 
                    onClick={() => setShowManualForm(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-900"
                  >
                    <span>Add manually</span>
                    <FiCalendar className="w-4 h-4 text-[#1d236b]" />
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <select 
                        value={manualMonth} 
                        onChange={(e)=>setManualMonth(e.target.value)}
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded"
                      >
                        <option value="">Month</option>
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m=> (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        placeholder="Feedbacks" 
                        value={manualFeedbacks}
                        onChange={(e)=>setManualFeedbacks(e.target.value)}
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded"
                      />
                      <input 
                        type="number" 
                        placeholder="Rating (1-5)" 
                        step="0.1"
                        value={manualRating}
                        onChange={(e)=>setManualRating(e.target.value)}
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => { setShowManualForm(false); setManualMonth(''); setManualFeedbacks(''); setManualRating(''); }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const manualRaw = localStorage.getItem('insights_manual_feedbacks');
                            const list = manualRaw ? JSON.parse(manualRaw) : [];
                            const entry = { month: manualMonth, feedbacks: Number(manualFeedbacks||0), rating: Number(manualRating||0), ts: Date.now() };
                            const updated = Array.isArray(list) ? [...list, entry] : [entry];
                            localStorage.setItem('insights_manual_feedbacks', JSON.stringify(updated));
                            setShowManualForm(false);
                            setManualMonth(''); setManualFeedbacks(''); setManualRating('');
                            window.dispatchEvent(new Event('insights_updated'));
                          } catch (_) {}
                        }}
                        disabled={!manualMonth}
                        className={`px-3 py-1.5 text-sm rounded text-white ${manualMonth ? 'bg-[#1d236b] hover:bg-[#151a4a]' : 'bg-gray-400 cursor-not-allowed'}`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Feedbacks & Reviews
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Customer satisfaction trends</span>
          
          {/* Toggle Switch */}
          <div 
            onClick={() => setShowCountries(!showCountries)}
            className={`relative w-11 h-6 ${showCountries ? 'bg-[#1d236b]' : 'bg-gray-300'} rounded-full cursor-pointer transition-colors`}
          >
            <div 
              className={`absolute top-0.5 ${showCountries ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all transform ${
                showCountries ? 'translate-x-0 scale-100' : 'translate-x-0 scale-95'
              }`}
            ></div>
          </div>
          {/* Info icon */}
          <div ref={infoRef} className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Toggle feedback info"
            >
              <span className="text-xs text-gray-400">i</span>
            </button>
            {showInfo && (
              <div className="absolute left-0 mt-2 w-80 max-w-xs bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 border border-orange-200 flex-shrink-0">i</div>
                  <p className="text-sm text-gray-700">
                    This chart shows how many completed trips received feedback each month and the average review rating.
                    Use the menu to change the period or add manual feedback data if some reviews were collected offline.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={data} 
            margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
          >
            <defs>
              <linearGradient id="feedbacksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
            
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              dy={10}
            />
            
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `${value}`}
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              domain={[0, 5]}
              ticks={[3.3, 3.6, 3.9, 4.2, 4.5, 4.8]}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={false} />
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="feedbacks"
              stroke="none"
              fill="url(#feedbacksGradient)"
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="reviews"
              stroke="#FB923C"
              strokeWidth={3}
              dot={<CustomDot />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Animated satisfaction summary panel when toggle is ON */}
      <div
        className={`mt-4 transition-all duration-300 ease-out transform ${
          showCountries && countryRatings.length > 0
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {countryRatings.length > 0 && (
          <div className="inline-flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl">
            <p className="text-xs font-medium text-orange-800 mb-2 sm:mb-0">
              Showing customer satisfaction trends for top 4 countries (average review rating).
            </p>
            <div className="flex flex-wrap gap-3">
              {countryRatings.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-white rounded-full border border-orange-100 shadow-sm"
                >
                  <span className="font-semibold text-orange-800">{c.name}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-700">{c.rating.toFixed ? c.rating.toFixed(1) : c.rating}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A78BFA' }}></div>
          <span className="text-sm text-gray-600">Feedbacks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FB923C' }}></div>
          <span className="text-sm text-gray-600">Reviews</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReviewChart;

