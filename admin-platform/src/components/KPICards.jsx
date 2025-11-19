import React from 'react';

const KPICards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
      {/* Total Bookings */}
      <div className="rounded-[18px] p-7 bg-[#E6FBEF] border border-[#7BE3A1] shadow-sm text-center">
        <div className="text-[35px] font-bold text-[#284078]">25,015</div>
        <div className="mt-2 text-[21px] text-[#284078] font-medium">Total Bookings</div>
        <div className="mt-6 flex items-center gap-3 text-sm justify-center">
          {/* chart axis + upward trend icon */}
          <svg className="w-6 h-6 text-[#2c7a4b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {/* L-shaped axes */}
            <path d="M4 19V6"/>
            <path d="M4 19H19"/>
            {/* trend line with arrow */}
            <path d="M6.5 14.5l4-4 3 3 5-5"/>
            <path d="M18.5 8.5H21v2.5"/>
          </svg>
          <span className="text-[#2c7a4b] font-semibold">12.5%</span>
          <span className="text-[#2c7a4b] opacity-70 text-xs">This Month</span>
        </div>
      </div>

      {/* Earnings by % */}
      <div className="rounded-[18px] p-7 bg-[#FFF5C7] border border-[#F3E39A] shadow-sm text-center">
        <div className="text-[35px] font-bold text-[#284078]">$56,000</div>
        <div className="mt-2 text-[21px] text-[#284078] font-medium">Earnings by %</div>
        <div className="mt-6 flex items-center gap-2 text-sm justify-center">
          <span className="text-[#2c7a4b] font-semibold">+8.6%</span>
          <span className="text-[#2c7a4b] opacity-70 text-xs">Growth</span>
        </div>
      </div>

      {/* Cancellation rate */}
      <div className="rounded-[18px] p-7 bg-[#FFE5E5] border border-[#F5B9B9] shadow-sm text-center">
        <div className="text-[35px] font-bold text-[#284078]">-6%</div>
        <div className="mt-2 text-[21px] text-[#284078] font-medium">Cancellation rate</div>
        <div className="mt-6 flex items-center gap-2 text-sm justify-center">
          <span className="text-[#b33939] font-semibold">-2%</span>
          <span className="text-[#b33939] opacity-70 text-xs">Last month</span>
        </div>
      </div>
    </div>
  );
};

export default KPICards;

