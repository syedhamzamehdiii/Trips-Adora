import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function ResponseInsightsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const build = () => {
      try {
        const bookingsRaw = localStorage.getItem('bookings') || sessionStorage.getItem('bookings');
        const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];
        const parseDate = (s) => { if (!s) return null; const d = new Date(s); return isNaN(d)? new Date(Date.parse(s)) : d; };
        const byDay = new Map();
        (bookings||[]).forEach(b => {
          const bd = parseDate(b.bookedOn);
          const td = parseDate(b.travelDate);
          if (!bd || !td) return;
          const key = bd.toLocaleString('en-US', { month: 'short', day: '2-digit' });
          const diffDays = Math.max(1, Math.min(50, Math.round((td - bd) / (1000*60*60*24))));
          const arr = byDay.get(key) || [];
          arr.push(diffDays);
          byDay.set(key, arr);
        });
        const out = Array.from(byDay.entries()).slice(-6).map(([k,arr]) => ({ date: k, value: Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) }));
        if (out.length === 0) {
          const today = new Date();
          for (let i=5;i>=0;i--) {
            const d = new Date(today); d.setDate(today.getDate()-i);
            out.push({ date: d.toLocaleString('en-US', { month:'short', day:'2-digit'}), value: 42 });
          }
        }
        setData(out);
      } catch (_) {}
    };
    build();
    window.addEventListener('storage', build);
    window.addEventListener('bookings_updated', build);
    return () => {
      window.removeEventListener('storage', build);
      window.removeEventListener('bookings_updated', build);
    };
  }, []);

  return (
    <div className="w-full mx-auto bg-white mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-normal text-gray-900">Insights of your response</h2>
        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors">
          See reviews
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-6">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              domain={[27, 47]}
              ticks={[27, 37, 42, 47, 54]}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'white', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#ff9933" 
              strokeWidth={2}
              dot={{ fill: '#ff9933', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

