import React, { useState, useEffect, useCallback } from 'react';
import CustomerProfileModal from './CustomerProfileModal';
import { customerService } from '../services/customerService';

const StatCard = ({ value, label, bg, sub }) => (
  <div className={`rounded-xl p-5 ${bg} flex flex-col items-center justify-center text-center`}>
    <div className="text-3xl font-semibold text-[#284078]">{value}</div>
    <div className="mt-1 text-[14px] text-[#284078] opacity-90">{label}</div>
    {sub && <div className="mt-3 text-[11px] text-[#284078] opacity-80 inline-flex items-center justify-center gap-2">{sub}</div>}
  </div>
);

const ManageAllCustomers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers data
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers(
        currentPage,
        pageSize,
        searchQuery || null
      );
      setCustomers(response.customers || []);
      setTotalPages(response.total_pages || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await customerService.getCustomerStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  }, []);

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Reset to page 1 when searching
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show first 3, ellipsis, last 3
      buttons.push(1, 2, 3);
      if (currentPage > 4 && currentPage < totalPages - 2) {
        buttons.push('ellipsis-start');
        buttons.push(currentPage - 1, currentPage, currentPage + 1);
        buttons.push('ellipsis-end');
      } else if (currentPage <= 4) {
        buttons.push(4, 5, 6);
        buttons.push('ellipsis');
      } else {
        buttons.push('ellipsis');
        buttons.push(totalPages - 5, totalPages - 4, totalPages - 3);
      }
      buttons.push(totalPages - 2, totalPages - 1, totalPages);
    }
    
    return buttons;
  };

  const initialsOf = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    return `${(parts[0]?.[0] || '').toUpperCase()}${(parts[1]?.[0] || '').toUpperCase()}` || (parts[0]?.[0] || '').toUpperCase();
  };

  return (
    <div className="w-full h-full text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2c7a4b]">Manage All Customer</h1>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            value={stats ? formatNumber(stats.total_customers) : '0'}
            label="Total Customers"
            bg="bg-[#E3FFE4] text-[#284078] font-semibold"
            sub={
              stats && stats.total_customers_change !== undefined ? (
                <span className="inline-flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stats.total_customers_change >= 0 ? 'bg-[#78F37E]' : 'bg-[#FA9E9E]'}`}></span>
                  {stats.total_customers_change >= 0 ? '+' : ''}{stats.total_customers_change.toFixed(1)}% <span className="opacity-60">This Month</span>
                </span>
              ) : null
            }
          />
          <StatCard
            value={stats ? formatNumber(stats.active_customers) : '0'}
            label="Active"
            bg="bg-[#A9B3C9]/50 text-[#284078] font-semibold"
            sub={
              stats && stats.active_customers_change !== undefined ? (
                <span className="inline-flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stats.active_customers_change >= 0 ? 'bg-[#78F37E]' : 'bg-[#FA9E9E]'}`}></span>
                  {stats.active_customers_change >= 0 ? '+' : ''}{stats.active_customers_change.toFixed(1)}% <span className="opacity-60">This Month</span>
                </span>
              ) : null
            }
          />
          <StatCard
            value={stats ? formatNumber(stats.vip_customers) : '0'}
            label="Vip Customer"
            bg="bg-[#FEF9C2] text-[#284078] font-semibold"
            sub={<span className="text-[11px] text-[#284078]">250+ Bookings completed</span>}
          />
          <StatCard
            value={stats ? formatCurrency(stats.avg_spending_last_month) : '$0'}
            label="Avg. spendings"
            bg="bg-[#FFD4CE]/90 text-[#284078] font-semibold"
            sub={
              stats && stats.avg_spending_change !== undefined ? (
                <span className="inline-flex items-center gap-2 text-[#284078] font-semibold">
                  <span className={`w-2 h-2 rounded-full ${stats.avg_spending_change >= 0 ? 'bg-[#78F37E]' : 'bg-[#FA9E9E]'}`}></span>
                  {stats.avg_spending_change >= 0 ? '+' : ''}{stats.avg_spending_change.toFixed(1)}% <span className="opacity-60">Last month</span>
                </span>
              ) : null
            }
          />
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-9 rounded-full border border-gray-300 bg-white px-4 pr-10 text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#284078]"
              placeholder="Search by name or ref. number"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 bg-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </div>

        {/* Customer Table */}
        <div className="mt-4 rounded-2xl border border-gray-300 bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="text-[15px] font-semibold text-[#284078]">Customer</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Complete breakdown of booking metrics and product preferences by country.</div>
          </div>
          {loading ? (
            <div className="px-4 md:px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="px-4 md:px-6 py-8 text-center text-gray-500">No customers found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-[#284078] bg-[#A9B3C9]/20">
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Customer ID</th>
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Email</th>
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Bookings</th>
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Name</th>
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Status</th>
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Total spendings</th>
                      <th className="text-left px-3 md:px-4 py-2 font-medium">Reviews</th>
                      <th className="text-center px-3 md:px-4 py-2 font-medium"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((c) => {
                      const spending = c.total_spending || 0;
                      const isHighSpending = spending >= 4000;
                      return (
                        <tr key={c.id} className="bg-white">
                          <td className="px-3 md:px-4 py-2 text-gray-700">{c.customer_id}</td>
                          <td className="px-3 md:px-4 py-2 text-gray-700">{c.email}</td>
                          <td className="px-3 md:px-4 py-2 text-gray-700">{c.bookings || 0}</td>
                          <td className="px-3 md:px-4 py-2 text-gray-800">{c.name || 'Unknown'}</td>
                          <td className="px-3 md:px-4 py-2 text-gray-700">{c.status || 'Inactive'}</td>
                          <td className="px-3 md:px-4 py-2">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${isHighSpending ? 'bg-[#E3FFE4] text-[#2c7a4b]' : 'bg-[#FFE3E3] text-[#b33939]'}`}>
                              {formatCurrency(spending)}
                            </span>
                          </td>
                          <td className="px-3 md:px-4 py-2 text-gray-700">{c.reviews || 0}</td>
                          <td className="px-3 md:px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCustomer({
                                  id: c.id,
                                  name: c.name,
                                  email: c.email,
                                  initial: initialsOf(c.name) || 'C',
                                  customerId: c.customer_id,
                                });
                                setShowProfile(true);
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-50"
                              aria-label="View"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" className="w-4 h-4">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                                <circle cx="12" cy="12" r="2.5"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2 text-[#284078]">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-full border border-gray-300 text-[#284078] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  ‹
                </button>
                {getPaginationButtons().map((btn, idx) => {
                  if (btn === 'ellipsis' || btn === 'ellipsis-start' || btn === 'ellipsis-end') {
                    return (
                      <button
                        key={`ellipsis-${idx}`}
                        disabled
                        className="w-8 h-8 rounded-full border border-gray-300 text-[#284078] cursor-default"
                      >
                        …
                      </button>
                    );
                  }
                  return (
                    <button
                      key={btn}
                      onClick={() => setCurrentPage(btn)}
                      className={`w-8 h-8 rounded-full border text-sm ${
                        currentPage === btn
                          ? 'bg-[#1c2a4f] text-white border-[#1c2a4f]'
                          : 'border-gray-300 text-[#284078] hover:bg-gray-50'
                      }`}
                    >
                      {btn}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 rounded-full border border-gray-300 text-[#284078] ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  ›
                </button>
                <button className="ml-2 px-3 h-8 rounded-full border border-gray-300 text-[#284078] text-xs inline-flex items-center gap-1">
                  {currentPage}/{totalPages}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#284078" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        <CustomerProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
};

export default ManageAllCustomers;
