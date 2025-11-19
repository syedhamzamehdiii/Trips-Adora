import React, { useEffect, useRef, useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterBySupplier, setFilterBySupplier] = useState(true);
  const supplierBtnRef = useRef(null);
  const popoverRef = useRef(null);

  const [monthOpen, setMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('October');
  const monthBtnRef = useRef(null);
  const monthPopoverRef = useRef(null);

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('semi-annually');
  const periodDropdownRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      const btn = supplierBtnRef.current;
      const pop = popoverRef.current;
      const mBtn = monthBtnRef.current;
      const mPop = monthPopoverRef.current;
      const pDrop = periodDropdownRef.current;
      if ((btn && btn.contains(e.target)) || (pop && pop.contains(e.target))) return;
      if ((mBtn && mBtn.contains(e.target)) || (mPop && mPop.contains(e.target))) return;
      if (pDrop && pDrop.contains(e.target)) return;
      setFilterOpen(false);
      setMonthOpen(false);
      setShowPeriodDropdown(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [filterOpen, monthOpen, showPeriodDropdown]);
  // toggle for tooltip content
  const [showBookings, setShowBookings] = useState(false);

  // New chart data and structure per request
  const chartData = [
    { month: 'Jan', bookings: 250, revenue: 40 },
    { month: '', bookings: 380, revenue: 52 },
    { month: 'Feb', bookings: 160, revenue: 38 },
    { month: '', bookings: 200, revenue: 43 },
    { month: 'Mar', bookings: 290, revenue: 43 },
    { month: '', bookings: 350, revenue: 46 },
    { month: 'Apr', bookings: 400, revenue: 46 },
    { month: '', bookings: 420, revenue: 53 },
    { month: 'Jul', bookings: 380, revenue: 48 },
    { month: '', bookings: 220, revenue: 35 },
    { month: 'Jun', bookings: 260, revenue: 44 }
  ];

  const [hoverInfo, setHoverInfo] = useState({ month: '', revenue: 0, bookings: 0 });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0]?.payload || {};
    const monthText = label || point.month || selectedMonth || '';
    const bookingsVal = point.bookings ?? 0;
    const revenueVal = point.revenue ?? 0;

    if (showBookings) {
      // Show month, bookings, revenue and top 4 countries
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
            <span className="text-right font-semibold">${revenueVal}k</span>
          </div>
          <div className="h-px bg-white/30 my-1" />
          <div className="space-y-0.5 text-[10.5px]">
            <div className="flex justify-between gap-8"><span>Japan</span><span className="font-semibold">512</span></div>
            <div className="flex justify-between gap-8"><span>Pakistan</span><span className="font-semibold">498</span></div>
            <div className="flex justify-between gap-8"><span>India</span><span className="font-semibold">378</span></div>
            <div className="flex justify-between gap-8"><span>US</span><span className="font-semibold">393</span></div>
          </div>
        </div>
      );
    }

    // OFF: Show improved summary with extras
    const avgTicket = bookingsVal ? (revenueVal / bookingsVal).toFixed(2) : '0.00';
    return (
      <div style={{ backgroundColor: '#284078', borderRadius: '8px' }} className="text-white px-3.5 py-3 shadow-lg min-w-[180px]">
        <div className="text-[11.5px] font-semibold mb-1">{monthText || 'Period'} — Summary</div>
        <div className="space-y-0.5 text-[10.5px]">
          <div className="flex justify-between"><span>Bookings</span><span className="font-semibold">{bookingsVal}</span></div>
          <div className="flex justify-between"><span>Revenue</span><span className="font-semibold">${revenueVal}k</span></div>
          <div className="flex justify-between"><span>Avg ticket</span><span className="font-semibold">${avgTicket}k</span></div>
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
              <button onClick={() => setShowBookings(v=>!v)} className={`ml-3 relative inline-flex h-5 w-10 items-center rounded-full ${showBookings?'bg-blue-500':'bg-gray-300'}`} aria-label="toggle">
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
            <button
              ref={supplierBtnRef}
              onClick={() => setFilterOpen((v) => !v)}
              className="px-4 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1"
            >
              <span>Supplier</span>
              <span className="text-gray-600">▾</span>
            </button>
            {filterOpen && (
              <div
                ref={popoverRef}
                className="absolute top-10 left-0 z-20 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 p-4"
                style={{
                  boxShadow:
                    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[15px] text-gray-900">By Supplier</span>
                  <button
                    onClick={() => setFilterBySupplier(true)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                      filterBySupplier ? 'bg-[#1e2a4a] border-[#1e2a4a] text-white' : 'border-gray-300 text-transparent'
                    }`}
                    aria-pressed={filterBySupplier}
                  >
                    ✓
                  </button>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[15px] text-gray-900">By Customer</span>
                  <button
                    onClick={() => setFilterBySupplier(false)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                      !filterBySupplier ? 'bg-[#1e2a4a] border-[#1e2a4a] text-white' : 'border-gray-300 text-transparent'
                    }`}
                    aria-pressed={!filterBySupplier}
                  >
                    ✓
                  </button>
                </div>
              </div>
            )}
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
                  {['October','September','August','July'].map((m) => (
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
                        onChange={(e) => setSelectedPeriod(e.target.value)}
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
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Annually</span>
                    </label>
                  </div>
                  <button className="flex items-center justify-between w-full mt-3 pt-3 border-t border-gray-100 hover:bg-gray-50 rounded px-2 py-1">
                    <span className="text-sm text-gray-700">Add manually</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={chartData} 
                margin={{ top: 10, right: 30, bottom: 35, left: 10 }}
                onMouseMove={(state) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    const bookingsVal = state.activePayload.find(p => p.dataKey === 'bookings')?.value ?? 0;
                    const revenueVal = state.activePayload.find(p => p.dataKey === 'revenue')?.value ?? 0;
                    setHoverInfo({ month: state.activeLabel || '', revenue: revenueVal, bookings: bookingsVal });
                  }
                }}
                onMouseLeave={() => setHoverInfo({ month: '', revenue: 0, bookings: 0 })}
              >
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D5E0FF" stopOpacity={0.1}/>
                    <stop offset="30%" stopColor="#B0C4FF" stopOpacity={0.3}/>
                    <stop offset="70%" stopColor="#7B96FF" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="#4F6FFF" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="0" vertical={false}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#FFFFFF', fontSize: 14, fontWeight: 600 }} height={45} interval={0} dy={10} />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                  tickFormatter={() => `$457`}
                  ticks={[0, 100, 200, 300, 400, 500]}
                  interval={0}
                  domain={[0, 500]}
                  width={50}
                />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} ticks={[21,27,37,42,47,54]} domain={[20,60]} width={35} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Area yAxisId="left" type="monotone" dataKey="bookings" stroke="#7B92FF" strokeWidth={1.5} fill="url(#blueGrad)" fillOpacity={1} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#5FD98D" strokeWidth={2.5} dot={{ fill: '#5FD98D', strokeWidth: 0, r: 5 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Bottom hover readout */}
          <div className="mt-3 flex items-center justify-center gap-6 text-sm text-gray-800">
            <div className="font-medium min-w-[60px] text-center">{hoverInfo.month || '\u00A0'}</div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#6B85FF' }}></span>
              <span>Bookings: <span className="font-semibold">{hoverInfo.bookings || 0}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#5FD98D' }}></span>
              <span>Revenue: <span className="font-semibold">${hoverInfo.revenue || 0}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
