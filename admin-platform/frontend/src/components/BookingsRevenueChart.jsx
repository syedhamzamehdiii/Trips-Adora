import React, { useState, useRef, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BookingRevenueChart = () => {
  const [showBookings, setShowBookings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('semi-annually');
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // EXACT wave pattern from zoomed image
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      if (showBookings) {
        return (
          <div style={{ backgroundColor: '#284078', borderRadius: '4px' }} className="text-white px-3 py-2 shadow-lg">
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-medium">
              <span>Jan 12, 2025</span>
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 16 16">
                <rect x="3" y="4" width="10" height="9" rx="1" fill="currentColor"/>
                <path d="M5 2v3M11 2v3M3 7h10" stroke="white" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="space-y-0.5 text-[10.5px]">
              <div className="flex justify-between gap-8">
                <span>Japan</span>
                <span className="font-semibold">512</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>Pakistan</span>
                <span className="font-semibold">498</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>India</span>
                <span className="font-semibold">378</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>US</span>
                <span className="font-semibold">393</span>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div style={{ backgroundColor: '#284078', borderRadius: '4px' }} className="text-white px-3 py-2 shadow-lg">
            <div className="mb-1.5 text-[11px] font-medium">Revenue Details</div>
            <div className="space-y-0.5 text-[10.5px]">
              <div className="flex justify-between gap-8">
                <span>Current</span>
                <span className="font-semibold">${payload[0]?.payload?.revenue || 0}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>Period</span>
                <span className="font-semibold">{payload[0]?.payload?.month || 'N/A'}</span>
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="w-full" style={{ backgroundColor: '#F5F6F8', padding: '20px' }}>
      <div className="w-full bg-white rounded-lg shadow p-6" style={{ border: '1px solid #E5E7EB' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Show Bookings</span>
            <button
              onClick={() => setShowBookings(!showBookings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                showBookings ? 'bg-[#5F7FFF]' : 'bg-gray-300'
              }`}
              style={{ outline: 'none', border: 'none' }}
            >
              <span 
                className="inline-block h-4 w-4 rounded-full transition shadow-sm" 
                style={{
                  backgroundColor: '#FFFFFF',
                  transform: showBookings ? 'translateX(24px)' : 'translateX(4px)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              />
            </button>
            <span className={`text-xs font-semibold ${showBookings ? 'text-[#5F7FFF]' : 'text-gray-400'}`}>
              {showBookings ? 'ON' : 'OFF'}
            </span>
            </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)} className="text-gray-400 hover:text-gray-600">
              <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
                <circle cx="2" cy="2" r="2"/>
                <circle cx="2" cy="9" r="2"/>
                <circle cx="2" cy="16" r="2"/>
            </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-3 px-4 z-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Bookings for the period</h3>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="period" value="semi-annually" checked={selectedPeriod === 'semi-annually'} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-4 h-4"/>
                    <span className="text-sm text-gray-700">Semi annually</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="period" value="annually" checked={selectedPeriod === 'annually'} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-4 h-4"/>
                    <span className="text-sm text-gray-700">Annually</span>
                  </label>
          </div>
                <button className="flex items-center justify-between w-full mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-700">Add manually</span>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>
            )}
      </div>
        </div>

        {/* Chart */}
        <div style={{ width: '100%', height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, bottom: 35, left: 10 }}>
              
            <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D5E0FF" stopOpacity={0.1}/>
                  <stop offset="30%" stopColor="#B0C4FF" stopOpacity={0.3}/>
                  <stop offset="70%" stopColor="#7B96FF" stopOpacity={0.7}/>
                  <stop offset="100%" stopColor="#4F6FFF" stopOpacity={1}/>
              </linearGradient>
            </defs>
            
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="0" vertical={false}/>
              
              {/* X Axis - Months */}
              <XAxis 
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#FFFFFF', fontSize: 14, fontWeight: 600 }}
                height={45}
                interval={0}
                dy={10}
              />
              
              {/* Left Y Axis - All $457 */}
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                tickFormatter={(v) => `$${v}`}
                ticks={[457, 457, 457, 457, 457, 457]}
                domain={[0, 500]}
                width={50}
              />
              
              {/* Right Y Axis */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                ticks={[21, 27, 37, 42, 47, 54]}
                domain={[20, 60]}
                width={35}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={false}/>
              
              {/* Blue Area */}
              <Area 
                yAxisId="left"
                type="monotone"
                dataKey="bookings"
                stroke="#7B92FF"
                strokeWidth={1.5}
                fill="url(#blueGrad)"
                fillOpacity={1}
              />
              
              {/* Green Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#5FD98D"
                strokeWidth={2.5}
                dot={{ fill: '#5FD98D', strokeWidth: 0, r: 5 }}
                activeDot={{ r: 6 }}
              />
              
            </ComposedChart>
          </ResponsiveContainer>
      </div>

      {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6B85FF' }}/>
            <span className="text-sm text-gray-800">Bookings</span>
        </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5FD98D' }}/>
            <span className="text-sm text-gray-800">Revenues</span>
        </div>
        </div>
        
      </div>
    </div>
  );
};

export default BookingRevenueChart;


