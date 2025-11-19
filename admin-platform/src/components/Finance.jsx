import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MonthDropdown from './MonthDropdown';
import PayoutDetailModal from './PayoutDetailModal';
import SupplierProfileQuickModal from './SupplierProfileQuickModal';

const Finance = () => {
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const itemsPerPage = 10;
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isSupplierViewOpen, setIsSupplierViewOpen] = useState(false);
  const [supplierViewData, setSupplierViewData] = useState(null);

  const navigateToSupplierProfile = () => {
    window.location.hash = '#supplier-profile';
    setIsSupplierViewOpen(false);
  };

  // Chart data - matching exact image values
  const chartData = [
    { month: 'Oct', commission: 1200, netEarnings: 4200 },
    { month: 'Nov', commission: 1100, netEarnings: 3800 },
    { month: 'Dec', commission: 1400, netEarnings: 5200 },
    { month: 'Jan', commission: 1300, netEarnings: 4600 },
  ];

  // Supplier Payout data - extended for pagination
  const allSupplierPayoutData = [
    { id: '#TA-1002484', month: 'Nov', productName: 'Mount. fuji day trip', bookings: 64, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'Oct', productName: 'Hakoony tour', bookings: 55, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'Sep', productName: 'Mount. fuji day trip', bookings: 64, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'Aug', productName: 'Hakoony tour', bookings: 33, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'Jul', productName: 'Mount. fuji day trip', bookings: 54, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'Jun', productName: 'Hakoony tour', bookings: 65, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'May', productName: 'Mount. fuji day trip', bookings: 78, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    { id: '#TA-1002484', month: 'Apr', productName: 'Hakoony tour', bookings: 52, earnings: '$725', commission: '$181.25', payout: '$543.75' },
    ...Array.from({ length: 132 }, (_, i) => {
      const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
      const products = ['Mount. fuji day trip', 'Hakoony tour'];
      const month = months[i % months.length];
      return {
        id: '#TA-1002484',
        month: month,
        productName: products[i % 2],
        bookings: Math.floor(Math.random() * 50) + 30,
        earnings: '$725',
        commission: '$181.25',
        payout: '$543.75'
      };
    })
  ];

  // Admin Commission data
  const allAdminCommissionData = [
    { month: 'Nov', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'icon' },
    { month: 'Oct', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
    { month: 'Sep', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
    { month: 'Aug', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
    { month: 'Jul', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
    { month: 'Jun', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
    { month: 'May', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
    { month: 'Apr', totalEarnings: '$725', commission: '$181.25', bank: 'Japan bank', payout: 'Withdraw', wallet: 'check' },
  ];

  // Filter data based on search
  const filteredSupplierData = allSupplierPayoutData.filter(item =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdminData = allAdminCommissionData.filter(item =>
    item.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages1 = Math.ceil(filteredSupplierData.length / itemsPerPage);
  const totalPages2 = Math.ceil(filteredAdminData.length / itemsPerPage);
  
  const startIndex1 = (currentPage1 - 1) * itemsPerPage;
  const endIndex1 = startIndex1 + itemsPerPage;
  const supplierPayoutData = filteredSupplierData.slice(startIndex1, endIndex1);

  const startIndex2 = (currentPage2 - 1) * itemsPerPage;
  const endIndex2 = startIndex2 + itemsPerPage;
  const adminCommissionData = filteredAdminData.slice(startIndex2, endIndex2);

  const getMonthColor = (month) => {
    if (month === 'Nov') return { color: '#FF0000' };
    return { color: '#27804A' };
  };

  const handlePageChange1 = (page) => {
    if (page >= 1 && page <= totalPages1) setCurrentPage1(page);
  };

  const handlePageChange2 = (page) => {
    if (page >= 1 && page <= totalPages2) setCurrentPage2(page);
  };

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    const pages = [];
    
    // Always show first 3 pages
    pages.push(1, 2, 3);
    
    // Add ellipsis if current page is far from start
    if (currentPage > 4) {
      pages.push('...');
    }
    
    // Add pages around current page
    if (currentPage > 3 && currentPage < totalPages - 2) {
      if (!pages.includes(currentPage - 1)) pages.push(currentPage - 1);
      if (!pages.includes(currentPage)) pages.push(currentPage);
      if (!pages.includes(currentPage + 1)) pages.push(currentPage + 1);
    }
    
    // Add ellipsis before last pages
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }
    
    // Always show last 3 pages
    if (totalPages > 3) {
      [totalPages - 2, totalPages - 1, totalPages].forEach(p => {
        if (!pages.includes(p)) pages.push(p);
      });
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pages.map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="text-gray-700 px-2">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                  currentPage === page
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={currentPage === page ? { backgroundColor: '#284078' } : {}}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <select
          className="px-3 py-1.5 rounded-lg border text-sm bg-white"
          style={{ borderColor: '#D1D5DB' }}
          value={`${currentPage} / ${totalPages}`}
          onChange={(e) => {
            const [page] = e.target.value.split(' / ');
            onPageChange(parseInt(page));
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <option key={page} value={`${page} / ${totalPages}`}>
              {page} / {totalPages}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#27804A' }}>Finance</h1>
        <button
          className="px-4 py-2 rounded-lg text-white font-medium text-sm whitespace-nowrap"
          style={{ backgroundColor: '#284078' }}
        >
          Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#e1f5e3ff' }}>
          <div className="text-4xl font-bold mb-3 text-center" style={{ color: '#27804A' }}>$6.2M</div>
          <div className="text-sm font-semibold mb-4 text-center text-[21px]" style={{ color: '#27804A' }}>Total revenue</div>
          <div className="flex items-center gap-2 text-sm text-center justify-center" style={{ color: '#27804A' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className='text-center'>12.5% This Month</span>
          </div>
        </div>

        {/* Commission */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#A9B3C9' }}>
          <div className="text-4xl font-bold mb-3 text-center" style={{ color: '#284078' }}>$2.3M</div>
          <div className="text-sm font-semibold mb-1 text-center text-[21px]" style={{ color: '#284078' }}>Commission</div>
          <div className="text-xs mb-4 text-center" style={{ color: '#6B7280' }}>Your Balance</div>
          <div className="flex items-center gap-2 text-sm justify-center" style={{ color: '#284078' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>12.5% This Month</span>
          </div>
        </div>

        {/* Supplier Payouts */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#FEF9C2' }}>
          <div className="text-4xl font-bold mb-3 text-center" style={{ color: 'black' }}>$4.7M</div>
          <div className="text-sm font-semibold mb-4 text-center text-[21px]" style={{ color: 'black' }}>Supplier Payouts</div>
          <div className="flex items-center gap-2 text-sm justify-center" >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>12.5% This Month</span>
          </div>
        </div>
      </div>

      {/* Earnings Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
            <div className="flex justify-end"><MonthDropdown value={selectedMonth} onChange={setSelectedMonth} /></div>
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 14 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 14 }}
                ticks={[0, 1500, 3000, 4500, 6000]}
                domain={[0, 6000]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="square"
                iconSize={12}
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
                align="center"
              />
              <Bar 
                dataKey="netEarnings" 
                fill="#8b85f6" 
                radius={[4, 4, 0, 0]}
                name="Net Earnings"
                barSize={60}
              />
              <Bar 
                dataKey="commission" 
                fill="#6cd8a7" 
                radius={[4, 4, 0, 0]}
                name="Commission"
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Payout Field Table */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Supplier Payout Field</h3>
        <p className="text-sm text-gray-500 mb-4">Complete breakdown of booking metrics and product preferences by country.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: '#E5E7EB' }}>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Supplier ID</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Month</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Product name</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Bookings</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Earnings</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>
                  <div>Commission</div>
                  <div className="text-xs font-normal text-gray-500">(25%)</div>
                </th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Payout</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {supplierPayoutData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: '#E5E7EB' }}
                  onClick={() => setIsPayoutOpen(true)}
                >
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.id}</td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ ...getMonthColor(row.month), borderColor: '#E5E7EB' }}>{row.month}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.productName}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.bookings}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.earnings}</td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ color: '#27804A', borderColor: '#E5E7EB' }}> <span className='bg-[#E3FFE4] p-0.5'>{row.commission}</span></td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ color: idx < 3 ? '#27804A' : '#FF0000', borderColor: '#E5E7EB' }}>
                    <span className={`${idx < 3 ? 'bg-[#E3FFE4]' : 'bg-[#FFE3E3]'} p-0.5`}>{row.payout}</span>
                  </td>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3 text-gray-400">
                      {/* Wallet / card icon */}
                      <svg className="w-4 h-4 cursor-pointer" onClick={() => setIsPayoutOpen(true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                      </svg>
                      {/* Eye icon */}
                      <svg className="w-4 h-4 cursor-pointer" onClick={() => { setSupplierViewData(row); setIsSupplierViewOpen(true); }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination(currentPage1, totalPages1, handlePageChange1)}
      </div>

      {/* Admin Commission Table */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Admin Commission</h3>
        <p className="text-sm text-gray-500 mb-4">Complete breakdown of booking metrics and product preferences by country.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: '#E5E7EB' }}>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Month</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Total Earnings</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>
                  <div>Commission</div>
                  <div className="text-xs font-normal text-gray-500">(25%)</div>
                </th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Bank</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Payout</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700">Get in wallet</th>
              </tr>
            </thead>
            <tbody>
              {adminCommissionData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: '#E5E7EB' }}
                  onClick={() => setIsPayoutOpen(true)}
                >
                  <td className="px-2 text-sm font-semibold border-r" style={{ ...getMonthColor(row.month), borderColor: '#E5E7EB' }}>{row.month}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.totalEarnings}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" >{row.commission}</td>
                  <td className="px-2 border-r" style={{ borderColor: '#E5E7EB' }}>
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: row.month === 'Nov' ? '#ffffff' : '#E3FFE4', color: '#27804A' }}>
                      {row.bank}
                    </span>
                  </td>
                  <td className="px-2 border-r" style={{ borderColor: '#E5E7EB' }}>
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: row.month === 'Nov' ? '#ffffff' : '#E3FFE4', color: '#27804A' }}>
                      {row.payout}
                    </span>
                  </td>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}>
                    {row.wallet === 'check' ? (
                      <svg className="w-5 h-5" style={{ color: '#27804A' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m7-4V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                      </svg>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination(currentPage2, totalPages2, handlePageChange2)}
      </div>

      {/* Search Bar and Month Dropdown */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or ref. number"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage1(1);
              setCurrentPage2(1);
            }}
            className="w-full px-4 py-2.5 rounded-lg border pr-10"
            style={{ borderColor: '#D1D5DB' }}
          />
          <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex justify-end"><MonthDropdown value={selectedMonth} onChange={setSelectedMonth} /></div>
      </div>
      {/* Payout detail modal */}
      <PayoutDetailModal isOpen={isPayoutOpen} onClose={() => setIsPayoutOpen(false)} />
      <SupplierProfileQuickModal
        isOpen={isSupplierViewOpen}
        onClose={() => setIsSupplierViewOpen(false)}
        supplier={supplierViewData}
        onViewProfile={navigateToSupplierProfile}
        onViewPayout={navigateToSupplierProfile}
      />
    </div>
  );
};

export default Finance;
