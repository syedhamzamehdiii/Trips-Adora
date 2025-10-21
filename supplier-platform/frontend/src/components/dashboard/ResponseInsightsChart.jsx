import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function ResponseInsightsChart() {
  const data = [
    { date: 'Jan 01', value: 42 },
    { date: 'Jan 02', value: 45 },
    { date: 'Jan 03', value: 43 },
    { date: 'Jan 04', value: 47 },
    { date: 'Jan 05', value: 45 },
    { date: 'Jan 06', value: 47 }
  ];

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

