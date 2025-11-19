import React from 'react';

const BookingsRevenueChart = () => {
  // Sample data for the chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jul', 'Jun'];
  const bookingsData = [47, 54, 43, 50, 45, 52];
  const revenueData = [407, 457, 420, 450, 435, 470];
  
  const maxValue = Math.max(...revenueData, ...bookingsData);
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Bookings & revenue</h2>
          <div className="flex items-center mt-1">
            <span className="text-gray-600 text-sm">Countries analysis</span>
            <div className="ml-3 relative inline-block w-10 h-5 bg-gray-300 rounded-full">
              <div className="absolute right-0 top-0 w-5 h-5 bg-white rounded-full shadow"></div>
            </div>
            <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white">
            <option>Supplier</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white">
            <option>October</option>
          </select>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis labels (left) */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>$407</span>
          <span>$457</span>
        </div>

        {/* Y-axis labels (right) */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pl-2">
          <span>47</span>
          <span>54</span>
        </div>

        {/* Chart content */}
        <div className="ml-12 mr-12 h-full relative">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full">
            <line x1="0" y1="0" x2="100%" y2="0" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />
          </svg>

          {/* Chart bars/areas */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Bookings area chart */}
            <defs>
              <linearGradient id="bookingsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Bookings area */}
            <path
              d={`M 0,${chartHeight} ${months.map((_, i) => {
                const x = (i / (months.length - 1)) * 100;
                const y = chartHeight - (bookingsData[i] / maxValue) * chartHeight;
                return `L ${x}%,${y}`;
              }).join(' ')} L ${100}%,${chartHeight} Z`}
              fill="url(#bookingsGradient)"
            />

            {/* Bookings line */}
            <polyline
              points={months.map((_, i) => {
                const x = (i / (months.length - 1)) * 100;
                const y = chartHeight - (bookingsData[i] / maxValue) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />

            {/* Revenue line */}
            <polyline
              points={months.map((_, i) => {
                const x = (i / (months.length - 1)) * 100;
                const y = chartHeight - (revenueData[i] / maxValue) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-12 flex justify-between text-xs text-gray-600">
          {months.map((month, i) => (
            <span key={i}>{month}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Bookings</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Revenue</span>
        </div>
      </div>
    </div>
  );
};

export default BookingsRevenueChart;

