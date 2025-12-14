import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';

const RevenueChart = () => {
  const [monthOpen, setMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const monthBtnRef = useRef(null);
  const monthPopoverRef = useRef(null);

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('semi-annually');
  const periodDropdownRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ startDate: null, endDate: null });
  const calendarRef = useRef(null);

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookings, setShowBookings] = useState(false);
  const [topCountries, setTopCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  useEffect(() => {
    const onClickOutside = (e) => {
      const mBtn = monthBtnRef.current;
      const mPop = monthPopoverRef.current;
      const pDrop = periodDropdownRef.current;
      const calRef = calendarRef.current;
      if ((mBtn && mBtn.contains(e.target)) || (mPop && mPop.contains(e.target))) return;
      if (pDrop && pDrop.contains(e.target)) return;
      if (calRef && calRef.contains(e.target)) return;
      setMonthOpen(false);
      setShowPeriodDropdown(false);
      setShowCalendar(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [monthOpen, showPeriodDropdown, showCalendar]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        let chartData = [];
        
        // Handle custom date range
        if (selectedPeriod === 'custom' && customDateRange.startDate && customDateRange.endDate) {
          // For custom date range, fetch all data and filter by date range
          const months = 12; // Fetch enough data to cover custom range
          const data = await apiService.get('/dashboard/chart', { months });
          chartData = data?.data || [];
          
          // Filter by custom date range
          const startDate = new Date(customDateRange.startDate);
          const endDate = new Date(customDateRange.endDate);
          endDate.setHours(23, 59, 59, 999); // Include full end date
          
          // Map month abbreviations to dates for filtering
          const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          const currentYear = new Date().getFullYear();
          chartData = chartData.filter(item => {
            const monthIndex = monthMap[item.month];
            if (monthIndex === undefined) return false;
            const itemDate = new Date(currentYear, monthIndex, 1);
            return itemDate >= startDate && itemDate <= endDate;
          });
        } else {
          // Handle semi-annually or annually
          const months = selectedPeriod === 'annually' ? 12 : 6;
          const data = await apiService.get('/dashboard/chart', { months });
          chartData = data?.data || [];
        }
        
        // Month name to abbreviation mapping
        const monthMap = {
          'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
          'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
          'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
        };
        
        // Filter by selected month if not "All" (only if not custom period)
        if (selectedMonth !== 'All' && selectedPeriod !== 'custom') {
          const monthAbbr = monthMap[selectedMonth] || selectedMonth.substring(0, 3);
          chartData = chartData.filter(item => item.month === monthAbbr);
        }
        
        // Ensure all values are numbers
        chartData = chartData.map(item => ({
          ...item,
          bookings: Number(item.bookings) || 0,
          revenue: Number(item.revenue) || 0
        }));
        
        // If no data, add a placeholder entry with 0 values so chart can render
        if (chartData.length === 0) {
          const monthAbbr = selectedMonth === 'All' ? 'No Data' : (monthMap[selectedMonth] || selectedMonth.substring(0, 3));
          chartData = [{ month: monthAbbr, bookings: 0, revenue: 0 }];
        }
        
        setChartData(chartData);
        
        // Initialize static display and hoverInfo with actual values from chart data
        if (chartData.length > 0) {
          // If a specific month is selected and filtered, show that month's data
          // If "All" is selected, show the last (most recent) data point
          const initialData = selectedMonth !== 'All' && chartData.length === 1
            ? chartData[0]  // Show the filtered month's data
            : chartData[chartData.length - 1];  // Show most recent month when "All" is selected
          const displayData = {
            label: initialData.month || '',
            bookings: Number(initialData.bookings) || 0,
            revenue: Number(initialData.revenue) || 0
          };
          setStaticDisplay(displayData);
          setHoverInfo(displayData);
        } else {
          // Reset to 0 if no data
          const emptyData = { label: '', revenue: 0, bookings: 0 };
          setStaticDisplay(emptyData);
          setHoverInfo(emptyData);
        }
      } catch (err) {
        // Only log non-network errors (backend might be starting up)
        if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error') {
          console.error('Failed to load chart data:', err);
        }
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
    const interval = setInterval(fetchChartData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedPeriod, selectedMonth, customDateRange]);

  // Update static display when selectedMonth or chartData changes
  useEffect(() => {
    if (chartData.length > 0) {
      // If a specific month is selected and filtered, show that month's data
      // If "All" is selected, show the last (most recent) data point
      const displayData = selectedMonth !== 'All' && chartData.length === 1
        ? chartData[0]  // Show the filtered month's data
        : chartData[chartData.length - 1];  // Show most recent month when "All" is selected
      setStaticDisplay({
        label: displayData.month || '',
        bookings: Number(displayData.bookings) || 0,
        revenue: Number(displayData.revenue) || 0
      });
    }
  }, [selectedMonth, chartData]);

  useEffect(() => {
    const fetchCountries = async () => {
      if (!showBookings) {
        setTopCountries([]);
        return;
      }
      try {
        setCountriesLoading(true);
        // Pass "All" to backend to get countries from all bookings, or specific month
        const monthForCountry = selectedMonth === 'All' ? 'All' : selectedMonth;
        const data = await apiService.get('/dashboard/countries', { month: monthForCountry });
        setTopCountries(data?.countries || []);
      } catch (err) {
        // Only log non-network errors (backend might be starting up)
        if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error') {
          console.error('Failed to load country data:', err);
        }
        setTopCountries([]);
      } finally {
        setCountriesLoading(false);
      }
    };
    fetchCountries();
    // Poll for real-time updates every 60 seconds when toggle is ON
    if (showBookings) {
      const interval = setInterval(fetchCountries, 60000);
      return () => clearInterval(interval);
    }
  }, [showBookings, selectedMonth]);

  const [hoverInfo, setHoverInfo] = useState({ label: '', revenue: 0, bookings: 0 });
  const [staticDisplay, setStaticDisplay] = useState({ label: '', revenue: 0, bookings: 0 });

  // Calculate dynamic domains for Y-axes based on data
  const { bookingsDomain, revenueDomain } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { bookingsDomain: [0, 10], revenueDomain: [0, 1000] };
    }
    
    const bookings = chartData.map(d => Number(d.bookings) || 0);
    const revenues = chartData.map(d => Number(d.revenue) || 0);
    
    const maxBookings = Math.max(...bookings, 1);
    const maxRevenue = Math.max(...revenues, 1);
    
    // Add 20% padding to the top
    const bookingsMax = Math.ceil(maxBookings * 1.2);
    const revenueMax = Math.ceil(maxRevenue * 1.2);
    
    return {
      bookingsDomain: [0, bookingsMax],
      revenueDomain: [0, revenueMax]
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0]?.payload || {};
    const monthText = label || point.month || '';
    const bookingsVal = Number(point.bookings) || 0;
    const revenueVal = Number(point.revenue) || 0;

    if (showBookings) {
      // Show month with country analysis when toggle is ON
      return (
        <div style={{ backgroundColor: '#284078', borderRadius: '8px' }} className="text-white px-3.5 py-3 shadow-lg min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11.5px] font-semibold">{monthText || 'Period'}</span>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <rect x="3" y="4" width="10" height="9" rx="1" fill="currentColor"/>
              <path d="M5 2v3M11 2v3M3 7h10" stroke="white" strokeWidth="0.6"/>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2">
            <span className="opacity-90">Bookings</span>
            <span className="text-right font-semibold">{bookingsVal}</span>
            <span className="opacity-90">Revenue</span>
            <span className="text-right font-semibold">
              {revenueVal >= 1000 ? `$${(revenueVal / 1000).toFixed(1)}k` : `$${Number(revenueVal).toFixed(0)}`}
            </span>
          </div>
          <div className="h-px bg-white/30 my-1" />
          <div className="space-y-0.5 text-[10.5px]">
            {countriesLoading ? (
              <div className="text-center py-2 opacity-75">Loading countries...</div>
            ) : topCountries.length > 0 ? (
              topCountries.map((country, idx) => (
                <div key={idx} className="flex justify-between gap-8">
                  <span>{country.country}</span>
                  <span className="font-semibold">{country.bookings}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-2 opacity-75">No country data available</div>
            )}
          </div>
        </div>
      );
    }

    // OFF: Show improved summary with extras
    const avgTicketNum = bookingsVal ? (revenueVal / bookingsVal) : 0;
    const formatRevenue = (val) => {
      if (typeof val !== 'number' || isNaN(val)) return '$0';
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
      return `$${val.toFixed(0)}`;
    };
    return (
      <div style={{ backgroundColor: '#284078', borderRadius: '8px' }} className="text-white px-3.5 py-3 shadow-lg min-w-[180px]">
        <div className="text-[11.5px] font-semibold mb-1">{monthText || 'Period'} — Summary</div>
        <div className="space-y-0.5 text-[10.5px]">
          <div className="flex justify-between"><span>Bookings</span><span className="font-semibold">{bookingsVal}</span></div>
          <div className="flex justify-between"><span>Revenue</span><span className="font-semibold">{formatRevenue(revenueVal)}</span></div>
          <div className="flex justify-between"><span>Avg ticket</span><span className="font-semibold">{formatRevenue(avgTicketNum)}</span></div>
          <div className="flex justify-between"><span>Tip</span><span className="opacity-90">Toggle ON for top countries</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Header with controls */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bookings & revenue</h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <span>Countries analysis</span>
              <button onClick={() => setShowBookings(v=>!v)} className={`ml-3 relative inline-flex h-5 w-10 items-center rounded-full ${showBookings?'bg-[#1e2a4a]':'bg-gray-300'}`} aria-label="toggle">
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${showBookings?'translate-x-5':'translate-x-1'}`}></span>
              </button>
              <div className="relative group ml-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0 1 1 0 002 0zm-3 3a1 1 0 011-1h1a1 1 0 011 1v3h1a1 1 0 110 2H9a1 1 0 110-2h1v-3z" clipRule="evenodd" />
                </svg>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 rounded-2xl p-3 shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition" style={{ zIndex: 50, backgroundColor: '#F3F4F6' }}>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full border border-blue-500 text-blue-600 text-[10px] leading-none">i</span>
                    <p className="m-0 text-[12.5px] leading-snug text-gray-800">
                      Use the Country button to switch views. When OFF, only Bookings vs. Revenue is displayed.<br/>
                      When ON, the top 4 countries will also be shown along with their booking counts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                ref={monthBtnRef}
                onClick={() => setMonthOpen((v) => !v)}
                className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                  monthOpen ? 'bg-[#1e2a4a] text-white' : 'bg-[#1e2a4a] text-white'
                }`}
              >
                <span>{selectedMonth}</span>
                <span>▾</span>
              </button>
              {monthOpen && (
                <div
                  ref={monthPopoverRef}
                  className="absolute top-10 right-0 z-20 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 p-4"
                  style={{
                    boxShadow:
                      '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
                  }}
                >
                  {['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <div key={m} className="flex items-center justify-between py-1.5">
                      <span className="text-[15px] text-gray-900">{m}</span>
                      <button
                        onClick={() => { setSelectedMonth(m); setMonthOpen(false); }}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                          selectedMonth===m ? 'bg-[#1e2a4a] border-[#1e2a4a] text-white' : 'border-gray-300 text-transparent'
                        }`}
                        aria-pressed={selectedMonth===m}
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* White card - full width chart */}
        <div 
          className="bg-white rounded-lg shadow-sm" 
          style={{ 
            border: '1px solid #D1D5DB',
            padding: '30px 20px 25px 20px' 
          }}
        >
          {/* Chart container */}
          <div className="w-full relative" style={{ height: '500px' }}>
            {/* 3-dot menu button inside chart */}
            <div className="absolute top-4 right-4 z-10" ref={periodDropdownRef}>
              <button
                onClick={() => setShowPeriodDropdown((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
                  <circle cx="2" cy="2" r="2"/>
                  <circle cx="2" cy="9" r="2"/>
                  <circle cx="2" cy="16" r="2"/>
                </svg>
              </button>
              {showPeriodDropdown && (
                <div className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-3 px-4 z-50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Bookings for the period</h3>
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="period"
                        value="semi-annually"
                        checked={selectedPeriod === 'semi-annually'}
                        onChange={(e) => {
                          setSelectedPeriod(e.target.value);
                          setCustomDateRange({ startDate: null, endDate: null });
                          setShowPeriodDropdown(false);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Semi annually</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="period"
                        value="annually"
                        checked={selectedPeriod === 'annually'}
                        onChange={(e) => {
                          setSelectedPeriod(e.target.value);
                          setCustomDateRange({ startDate: null, endDate: null });
                          setShowPeriodDropdown(false);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Annually</span>
                    </label>
                  </div>
                  <button 
                    onClick={() => {
                      setShowPeriodDropdown(false);
                      setShowCalendar(true);
                    }}
                    className="flex items-center justify-between w-full mt-3 pt-3 border-t border-gray-100 hover:bg-gray-50 rounded px-2 py-1"
                  >
                    <span className="text-sm text-gray-700">Add manually</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Calendar Modal for Custom Date Range */}
            {showCalendar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCalendar(false)}>
                <div 
                  ref={calendarRef}
                  className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={customDateRange.startDate || ''}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        max={customDateRange.endDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={customDateRange.endDate || ''}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={customDateRange.startDate || undefined}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setCustomDateRange({ startDate: null, endDate: null });
                          setShowCalendar(false);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (customDateRange.startDate && customDateRange.endDate) {
                            setSelectedPeriod('custom');
                            setShowCalendar(false);
                          }
                        }}
                        disabled={!customDateRange.startDate || !customDateRange.endDate}
                        className="flex-1 px-4 py-2 bg-[#1e2a4a] text-white rounded-md hover:bg-[#2a3a5a] disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={chartData} 
                  margin={{ top: 10, right: 30, bottom: 35, left: 10 }}
                  onMouseMove={(state) => {
                    // Update hoverInfo for tooltip, but don't affect static display
                    if (state && state.activePayload && state.activePayload.length) {
                      const bookingsVal = Number(state.activePayload.find(p => p.dataKey === 'bookings')?.value) || 0;
                      const revenueVal = Number(state.activePayload.find(p => p.dataKey === 'revenue')?.value) || 0;
                      setHoverInfo({ label: state.activeLabel || '', revenue: revenueVal, bookings: bookingsVal });
                    }
                  }}
                >
                  <defs>
                    {/* Blue fill for the area under the revenue line */}
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C3D4FF" stopOpacity={0.9} />
                      <stop offset="60%" stopColor="#C3D4FF" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#C3D4FF" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="0" vertical={false}/>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} 
                    height={45} 
                    interval={0} 
                    dy={10} 
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(val) => val.toLocaleString()}
                    domain={bookingsDomain}
                    width={50}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(val) => {
                      const numVal = Number(val) || 0;
                      return `$${numVal >= 1000 ? (numVal / 1000).toFixed(0) + 'k' : numVal.toFixed(0)}`;
                    }}
                    domain={revenueDomain}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  {/* Area + line for revenue only (green flow like supplier reference) */}
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="none"
                    fill="url(#blueGrad)"
                    fillOpacity={1}
                    connectNulls={true}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#5FAF6E"
                    strokeWidth={3.2}
                    dot={{ r: 6, fill: '#5FAF6E', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#5FAF6E', stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Bottom static readout - always shows real-time data */}
          <div className="mt-3 flex items-center justify-center gap-6 text-sm text-gray-800">
            <div className="font-medium min-w-[60px] text-center">{staticDisplay.label || '\u00A0'}</div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#7B92FF' }}></span>
              <span>Bookings: <span className="font-semibold">{staticDisplay.bookings || 0}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#72C082' }}></span>
              <span>Revenue: <span className="font-semibold">
                {Number(staticDisplay.revenue) >= 1000 ? `$${(Number(staticDisplay.revenue) / 1000).toFixed(1)}k` : `$${Number(staticDisplay.revenue) || 0}`}
              </span></span>
            </div>
          </div>
          
          {/* Countries summary panel (always visible when toggle is ON) */}
          {showBookings && (
            <div className="mt-4 transition-all duration-300 ease-out">
              <div className="inline-flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl w-full">
                <p className="text-xs font-medium text-purple-800 mb-2 sm:mb-0">
                  Showing top 4 countries by bookings for {selectedMonth === 'All' ? 'this period' : selectedMonth}.
                </p>
                <div className="flex flex-wrap gap-3">
                  {countriesLoading ? (
                    <span className="text-xs text-gray-500">Loading countries...</span>
                  ) : topCountries.length > 0 ? (
                    topCountries.map((country, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-white rounded-full border border-purple-100 shadow-sm"
                      >
                        <span className="font-semibold text-purple-800">{country.country}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-700">{country.bookings} bookings</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No country data available</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
