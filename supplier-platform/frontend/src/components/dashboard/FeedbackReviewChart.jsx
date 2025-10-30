import React, { useEffect, useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

const FeedbackReviewChart = () => {
  const [showCountries, setShowCountries] = useState(true);
  
  const [data, setData] = useState([]);

  useEffect(() => {
    const build = () => {
      try {
        const bookingsRaw = localStorage.getItem('bookings') || sessionStorage.getItem('bookings');
        const productsRaw = localStorage.getItem('all_products');
        const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];
        const products = productsRaw ? JSON.parse(productsRaw) : [];

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        const labels = Array.from({ length: 6 }).map((_,i) => months[(now.getMonth()-5+i+12)%12]);
        const counters = new Map(labels.map(m => [m, { feedbacks: 0 }]));
        const parseDate = (s) => { if (!s) return null; const d = new Date(s); return isNaN(d)? new Date(Date.parse(s)) : d; };
        (bookings||[]).forEach(b => {
          const d = parseDate(b.travelDate || b.bookedOn);
          if (!d) return; const key = months[d.getMonth()];
          if (!counters.has(key)) return; counters.get(key).feedbacks += (b.status === 'Completed' ? 1 : 0);
        });
        const ratings = (products||[]).map(p => parseFloat(p.ratings)).filter(n => !isNaN(n) && n>0);
        const avgRating = ratings.length>0 ? (ratings.reduce((a,b)=>a+b,0)/ratings.length) : 4.2;
        const out = labels.map(m => ({ month: m, feedbacks: counters.get(m)?.feedbacks || 0, reviews: Math.max(3.0, Math.min(5.0, avgRating)) }));
        setData(out);
      } catch (_) {}
    };
    build();
    window.addEventListener('storage', build);
    window.addEventListener('bookings_updated', build);
    window.addEventListener('products_updated', build);
    return () => {
      window.removeEventListener('storage', build);
      window.removeEventListener('bookings_updated', build);
      window.removeEventListener('products_updated', build);
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && showCountries) {
      return (
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-3 rounded-lg shadow-lg">
          <p className="text-xs opacity-90 mb-2">Jan 11, 2024</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="mr-4">Japan</span>
              <span className="font-semibold">4.7</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="mr-4">England</span>
              <span className="font-semibold">4.9</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="mr-4">India</span>
              <span className="font-semibold">4.5</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="mr-4">US</span>
              <span className="font-semibold">4.8</span>
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
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#A78BFA' }}></div>
              <span className="text-xs text-gray-600 mr-2">Feedbacks:</span>
              <span className="text-xs font-semibold">{payload[0]?.value}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#FB923C' }}></div>
              <span className="text-xs text-gray-600 mr-2">Reviews:</span>
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
        <div className="absolute top-0 right-0 flex flex-col gap-1 cursor-pointer">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Feedbacks & Reviews
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Customer satisfaction trends</span>
          
          {/* Toggle Switch */}
          <div 
            onClick={() => setShowCountries(!showCountries)}
            className="relative w-11 h-6 bg-purple-500 rounded-full cursor-pointer transition-colors"
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

