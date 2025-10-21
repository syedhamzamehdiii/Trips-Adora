import React, { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

const BookingRevenueChart = () => {
  const [showCountries, setShowCountries] = useState(true);
  
  const data = [
    { month: 'Jan', bookings: 54, revenue: 47, dollars: 457 },
    { month: 'Feb', bookings: 42, revenue: 42, dollars: 457 },
    { month: 'Mar', bookings: 21, revenue: 42, dollars: 457 },
    { month: 'Apr', bookings: 47, revenue: 47, dollars: 457 },
    { month: 'Jul', bookings: 54, revenue: 47, dollars: 457 },
    { month: 'Jun', bookings: 27, revenue: 37, dollars: 457 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && showCountries) {
      return (
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-3 rounded-lg shadow-lg">
          <p className="text-xs opacity-90 mb-2">Jan 11, 2024</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="mr-4">Japan</span>
              <span className="font-semibold">112</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="mr-4">England</span>
              <span className="font-semibold">498</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="mr-4">India</span>
              <span className="font-semibold">276</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="mr-4">US</span>
              <span className="font-semibold">341</span>
            </div>
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
        <div className="absolute top-0 right-0 flex flex-col gap-1 cursor-pointer">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Bookings & revenue
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Countries analysis</span>
          
          {/* Toggle Switch */}
          <div 
            onClick={() => setShowCountries(!showCountries)}
            className="relative w-11 h-6 bg-blue-500 rounded-full cursor-pointer transition-colors"
          >
            <div 
              className={`absolute top-0.5 ${showCountries ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all`}
            ></div>
          </div>
          
          {/* Info icon */}
          <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-xs text-gray-400">i</span>
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

