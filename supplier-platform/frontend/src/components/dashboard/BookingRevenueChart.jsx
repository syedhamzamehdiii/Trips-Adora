import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { FiCalendar } from 'react-icons/fi';

const BookingRevenueChart = () => {
  // Load toggle state from localStorage or default to true
  const [showCountries, setShowCountries] = useState(() => {
    try {
      const saved = localStorage.getItem('insights_countries_toggle');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualMonth, setManualMonth] = useState('');
  const [manualBookings, setManualBookings] = useState('');
  const [manualRevenue, setManualRevenue] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Semi annually');
  const [countryData, setCountryData] = useState([]);
  const menuRef = useRef(null);
  const infoRef = useRef(null);
  
  const [data, setData] = useState([]);

  // Save toggle state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('insights_countries_toggle', JSON.stringify(showCountries));
      // Dispatch event for cross-component updates
      window.dispatchEvent(new Event('insights_toggle_updated'));
    } catch (e) {
      console.warn('Failed to save toggle state:', e);
    }
  }, [showCountries]);

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

  useEffect(() => {
    const build = () => {
      try {
        const bookingsRaw = localStorage.getItem('bookings') || sessionStorage.getItem('bookings');
        const productsRaw = localStorage.getItem('all_products');
        const manualRaw = localStorage.getItem('insights_manual_bookings');
        const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];
        const products = productsRaw ? JSON.parse(productsRaw) : [];
        const manual = manualRaw ? JSON.parse(manualRaw) : [];

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        
        // Determine number of months based on selected period
        let monthCount = 6; // Default: Semi annually
        if (selectedPeriod === 'Annually') {
          monthCount = 12;
        }

        const labels = Array.from({ length: monthCount }).map((_,i) => months[(now.getMonth()-(monthCount-1)+i+12)%12]);

        const counters = new Map(labels.map(m => [m, { bookings: 0, revenue: 0 }]));
        const parseDate = (s) => {
          if (!s) return null; const d = new Date(s); return isNaN(d)? new Date(Date.parse(s)) : d;
        };
        (bookings||[]).forEach(b => {
          const d = parseDate(b.bookedOn || b.travelDate);
          if (!d) return; const key = months[d.getMonth()];
          if (!counters.has(key)) return; const agg = counters.get(key);
          agg.bookings += 1; agg.revenue += parseAmountNumber(b.amount);
        });
        (products||[]).forEach(p => {
          // distribute product revenue evenly across last month to smooth trend
          const key = labels[labels.length-1];
          if (!counters.has(key)) return; const agg = counters.get(key);
          agg.revenue += parseAmountNumber(p.revenue);
        });
        // Merge manual entries (month names expected like 'Jan', 'Feb', ...)
        (manual||[]).forEach(m => {
          const key = m.month;
          if (!counters.has(key)) return; const agg = counters.get(key);
          const b = parseInt(m.bookings || 0, 10);
          const r = parseAmountNumber(m.revenue || 0);
          if (!isNaN(b)) agg.bookings += b;
          agg.revenue += r;
        });
        const out = labels.map(m => ({ month: m, bookings: counters.get(m)?.bookings || 0, revenue: Math.round((counters.get(m)?.revenue || 0)/100) }));
        setData(out);

        // Calculate top countries from bookings for real-time country data
        const countryCounts = new Map();
        (bookings||[]).forEach(b => {
          // Extract country from customer email domain or use default
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
          
          const count = countryCounts.get(country) || 0;
          countryCounts.set(country, count + 1);
        });
        // Sort by count and take top 4
        const topCountries = Array.from(countryCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count]) => ({ name, count }));
        setCountryData(topCountries);
      } catch (_) {}
    };
    build();
    window.addEventListener('storage', build);
    window.addEventListener('bookings_updated', build);
    window.addEventListener('products_updated', build);
    window.addEventListener('insights_updated', build);
    window.addEventListener('insights_toggle_updated', build);
    return () => {
      window.removeEventListener('storage', build);
      window.removeEventListener('bookings_updated', build);
      window.removeEventListener('products_updated', build);
      window.removeEventListener('insights_updated', build);
      window.removeEventListener('insights_toggle_updated', build);
    };
  }, [selectedPeriod]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && showCountries && countryData.length > 0) {
      return (
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-3 rounded-lg shadow-lg">
          <p className="text-xs opacity-90 mb-2">{label} 2024</p>
          <div className="space-y-1">
            {countryData.map((country, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="mr-4">{country.name}</span>
                <span className="font-semibold">{country.count}</span>
            </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#5B8FDE' }}></div>
              <span className="text-xs text-gray-600 mr-2">Bookings:</span>
              <span className="text-xs font-semibold">{payload[0]?.value}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#72C082' }}></div>
              <span className="text-xs text-gray-600 mr-2">Revenue:</span>
              <span className="text-xs font-semibold">{payload[1]?.value}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, fill } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={5} 
        fill="#72C082"
        stroke="#72C082"
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
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Bookings for the period</h3>
                
                {/* Period Options */}
                <div className="space-y-3 mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="period"
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
                          ? 'border-blue-600 bg-blue-600'
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
                        name="period"
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
                          ? 'border-blue-600 bg-blue-600'
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
                    <FiCalendar className="w-4 h-4 text-blue-600" />
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
                        placeholder="Bookings" 
                        value={manualBookings}
                        onChange={(e)=>setManualBookings(e.target.value)}
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded"
                      />
                      <input 
                        type="number" 
                        placeholder="Revenue ($)" 
                        value={manualRevenue}
                        onChange={(e)=>setManualRevenue(e.target.value)}
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => { setShowManualForm(false); setManualMonth(''); setManualBookings(''); setManualRevenue(''); }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const manualRaw = localStorage.getItem('insights_manual_bookings');
                            const list = manualRaw ? JSON.parse(manualRaw) : [];
                            const entry = { month: manualMonth, bookings: Number(manualBookings||0), revenue: Number(manualRevenue||0), ts: Date.now() };
                            const updated = Array.isArray(list) ? [...list, entry] : [entry];
                            localStorage.setItem('insights_manual_bookings', JSON.stringify(updated));
                            setShowManualForm(false);
                            setManualMonth(''); setManualBookings(''); setManualRevenue('');
                            // trigger realtime update
                            window.dispatchEvent(new Event('insights_updated'));
                          } catch (_) {}
                        }}
                        disabled={!manualMonth}
                        className={`px-3 py-1.5 text-sm rounded text-white ${manualMonth ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
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
          Bookings & revenue
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Countries analysis</span>
          
          {/* Toggle Switch */}
          <div 
            onClick={() => setShowCountries(!showCountries)}
            className={`relative w-11 h-6 ${showCountries ? 'bg-blue-500' : 'bg-gray-300'} rounded-full cursor-pointer transition-colors`}
          >
            <div 
              className={`absolute top-0.5 ${showCountries ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all`}
            ></div>
          </div>
          
          {/* Info icon */}
          <div ref={infoRef} className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Toggle countries info"
            >
            <span className="text-xs text-gray-400">i</span>
            </button>
            {showInfo && (
              <div className="absolute left-0 mt-2 w-80 max-w-xs bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">i</div>
                  <p className="text-sm text-gray-700">
                    Use the Country button to switch views. When OFF, only Bookings vs. Revenue is displayed.
                    When ON, the top 4 countries will also be shown along with their booking counts.
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
              <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B8FDE" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#5B8FDE" stopOpacity={0.8} />
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
              tickFormatter={(value) => `$457`}
              domain={[0, 60]}
              ticks={[0, 15, 30, 45, 60]}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              domain={[0, 60]}
              ticks={[21, 27, 37, 42, 47, 54]}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={false} />
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="bookings"
              stroke="none"
              fill="url(#bookingsGradient)"
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#72C082"
              strokeWidth={3}
              dot={<CustomDot />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5B8FDE' }}></div>
          <span className="text-sm text-gray-600">Bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#72C082' }}></div>
          <span className="text-sm text-gray-600">Revenues</span>
        </div>
      </div>
    </div>
  );
};

export default BookingRevenueChart;

