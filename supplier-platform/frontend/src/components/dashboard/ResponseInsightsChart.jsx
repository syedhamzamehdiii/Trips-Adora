import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { getResponseAnalytics } from '@/services/chatService';

export default function ResponseInsightsChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const build = async () => {
      try {
        setLoading(true);
        const stats = await getResponseAnalytics();
        const out = (stats || []).map(item => {
          const d = new Date(item.date);
          const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          return {
            date: label,
            value: Number(item.replies || 0),
          };
        });

        // Ensure we always show a small window even if there is little data
        let filled = out.slice(-6);
        if (filled.length === 0) {
          const today = new Date();
          filled = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            filled.push({
              date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
              value: 0,
            });
          }
        }
        setData(filled);
      } catch (e) {
        // If analytics fail, keep empty chart
        console.error('Failed to load response analytics:', e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    build();
  }, []);

  return (
    <div className="w-full mx-auto bg-white mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-normal text-gray-900">Insights of your response</h2>
        <p className="text-sm text-gray-500">Replies you sent to customer messages (per day)</p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-6">
        {loading && (
          <div className="h-10 w-32 mb-4 bg-gray-100 rounded-full animate-pulse" />
        )}
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
              allowDecimals={false}
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
            >
              {/* Labels above points so analytics are visible without hover */}
              <LabelList
                dataKey="value"
                position="top"
                className="text-[10px]"
                formatter={(value) => (value > 0 ? value : '')}
            />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




