import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num?.toLocaleString() || '0';
};

const formatCurrency = (num) => {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'k';
  return '$' + (num?.toLocaleString() || '0');
};

const KPICards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[18px] p-7 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const bookingsChange = stats?.bookings_change || 0;
  const revenueChange = stats?.revenue_change || 0;
  const cancellationChange = stats?.cancellation_change || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
      {/* Total Bookings */}
      <div className="rounded-[18px] p-7 bg-[#E6FBEF] border border-[#7BE3A1] shadow-sm text-center">
        <div className="text-[35px] font-bold text-[#284078]">{formatNumber(stats?.total_bookings || 0)}</div>
        <div className="mt-2 text-[21px] text-[#284078] font-medium">Total Bookings</div>
        <div className="mt-6 flex items-center gap-3 text-sm justify-center">
          <svg className="w-6 h-6 text-[#2c7a4b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V6"/>
            <path d="M4 19H19"/>
            <path d="M6.5 14.5l4-4 3 3 5-5"/>
            <path d="M18.5 8.5H21v2.5"/>
          </svg>
          <span className={`font-semibold ${bookingsChange >= 0 ? 'text-[#2c7a4b]' : 'text-[#b33939]'}`}>
            {bookingsChange >= 0 ? '+' : ''}{bookingsChange.toFixed(1)}%
          </span>
          <span className={`opacity-70 text-xs ${bookingsChange >= 0 ? 'text-[#2c7a4b]' : 'text-[#b33939]'}`}>This Month</span>
        </div>
      </div>

      {/* Earnings by % */}
      <div className="rounded-[18px] p-7 bg-[#FFF5C7] border border-[#F3E39A] shadow-sm text-center">
        <div className="text-[35px] font-bold text-[#284078]">{formatCurrency(stats?.total_revenue || 0)}</div>
        <div className="mt-2 text-[21px] text-[#284078] font-medium">Earnings by %</div>
        <div className="mt-6 flex items-center gap-2 text-sm justify-center">
          <span className={`font-semibold ${revenueChange >= 0 ? 'text-[#2c7a4b]' : 'text-[#b33939]'}`}>
            {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
          </span>
          <span className={`opacity-70 text-xs ${revenueChange >= 0 ? 'text-[#2c7a4b]' : 'text-[#b33939]'}`}>Growth</span>
        </div>
      </div>

      {/* Cancellation rate */}
      <div className="rounded-[18px] p-7 bg-[#FFE5E5] border border-[#F5B9B9] shadow-sm text-center">
        <div className="text-[35px] font-bold text-[#284078]">{stats?.cancellation_rate?.toFixed(1) || '0.0'}%</div>
        <div className="mt-2 text-[21px] text-[#284078] font-medium">Cancellation rate</div>
        <div className="mt-6 flex items-center gap-2 text-sm justify-center">
          <span className={`font-semibold ${cancellationChange <= 0 ? 'text-[#2c7a4b]' : 'text-[#b33939]'}`}>
            {cancellationChange >= 0 ? '+' : ''}{cancellationChange.toFixed(1)}%
          </span>
          <span className={`opacity-70 text-xs ${cancellationChange <= 0 ? 'text-[#2c7a4b]' : 'text-[#b33939]'}`}>Last month</span>
        </div>
      </div>
    </div>
  );
};

export default KPICards;

