import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MonthDropdown from './MonthDropdown';
import PayoutDetailModal from './PayoutDetailModal';
import SupplierProfileQuickModal from './SupplierProfileQuickModal';
import financeService from '../services/financeService';
import { getSupplierDetail, getSupplierInsights } from '../services/supplierService';
import platformSettingsService from '../services/platformSettingsService';

const Finance = () => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [chartMonth, setChartMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const itemsPerPage = 10;
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payoutModalSupplier, setPayoutModalSupplier] = useState(null);
  const [payoutModalPayouts, setPayoutModalPayouts] = useState([]);
  const [isSupplierViewOpen, setIsSupplierViewOpen] = useState(false);
  const [supplierViewData, setSupplierViewData] = useState(null);
  const [supplierViewInsights, setSupplierViewInsights] = useState(null);
  const [supplierViewLoading, setSupplierViewLoading] = useState(false);
  const [supplierViewError, setSupplierViewError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [trendPoints, setTrendPoints] = useState([]);
  const [supplierRows, setSupplierRows] = useState([]);
  const [supplierTotalPages, setSupplierTotalPages] = useState(1);
  const [adminRows, setAdminRows] = useState([]);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState(25);

  // Load commission settings
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const s = await platformSettingsService.getPlatformSettings();
        if (!active) return;
        if (typeof s?.commission_percent === 'number') {
          setCommissionPercent(s.commission_percent);
        } else if (typeof s?.commission_rate === 'number') {
          setCommissionPercent(Math.round(s.commission_rate * 100));
        }
      } catch (_) {
        // keep default
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const openSupplierProfile = (supplierCodeOrId) => {
    const id = supplierCodeOrId ? String(supplierCodeOrId) : '';
    if (window && window.location) {
      window.location.hash = `#supplier-profile?id=${encodeURIComponent(id)}`;
    }
    setIsSupplierViewOpen(false);
  };

  const openSupplierProfileWithFocus = (supplierCodeOrId, focus = null) => {
    const id = supplierCodeOrId ? String(supplierCodeOrId) : '';
    if (window && window.location) {
      const focusParam = focus ? `&focus=${encodeURIComponent(focus)}` : '';
      window.location.hash = `#supplier-profile?id=${encodeURIComponent(id)}${focusParam}`;
    }
    setIsSupplierViewOpen(false);
  };

  const openSupplierQuickModal = async (supplierCodeOrId) => {
    const id = supplierCodeOrId ? String(supplierCodeOrId) : '';
    if (!id) return;

    setSupplierViewError(null);
    setSupplierViewLoading(true);
    setSupplierViewInsights(null);
    setSupplierViewData({ id, name: 'Loading...', email: '', totalTours: 0, rating: '0.0', earnings: 0 });
    setIsSupplierViewOpen(true);

    try {
      const [detail, insights] = await Promise.all([
        getSupplierDetail(id),
        getSupplierInsights(id),
      ]);
      setSupplierViewData({
        id,
        name: detail?.name || detail?.business_name || 'Supplier',
        email: detail?.email || '',
        avatar_url: detail?.avatar_url || detail?.profile_photo || detail?.avatarUrl || null,
        totalTours: detail?.total_tours ?? 0,
        rating: typeof insights?.average_rating === 'number'
          ? insights.average_rating
          : (detail?.rating ?? 0),
        earnings: detail?.earnings ?? 0,
      });
      setSupplierViewInsights(insights || null);
    } catch (e) {
      console.error('Failed to load supplier quick profile', e);
      setSupplierViewError('Unable to load supplier profile right now.');
    } finally {
      setSupplierViewLoading(false);
    }
  };

  const openPayoutDetailModal = async (supplierCodeOrId) => {
    const id = supplierCodeOrId ? String(supplierCodeOrId) : '';
    if (!id) return;

    setIsPayoutOpen(true);
    setPayoutModalSupplier({ id, name: 'Loading...', email: '', avatar_url: null });
    setPayoutModalPayouts([]);
    try {
      const detail = await getSupplierDetail(id);
      setPayoutModalSupplier(detail || { id });
      setPayoutModalPayouts(Array.isArray(detail?.payouts) ? detail.payouts : []);
    } catch (e) {
      console.error('Failed to load supplier payout detail', e);
      setPayoutModalSupplier({ id, name: 'Supplier', email: '', avatar_url: null });
      setPayoutModalPayouts([]);
    }
  };

  const sendMessageToSupplier = (supplierId, supplierName) => {
    if (window && window.location) {
      window.location.hash = `#message-supplier=${encodeURIComponent(
        supplierId || '',
      )}&name=${encodeURIComponent(supplierName || '')}`;
    }
    setIsSupplierViewOpen(false);
  };

  const monthOptions = useMemo(
    () => ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    []
  );

  const monthToAbbr = (m) => {
    const map = {
      January: 'Jan',
      February: 'Feb',
      March: 'Mar',
      April: 'Apr',
      May: 'May',
      June: 'Jun',
      July: 'Jul',
      August: 'Aug',
      September: 'Sep',
      October: 'Oct',
      November: 'Nov',
      December: 'Dec',
    };
    return map[m] || m;
  };

  const chartData = useMemo(() => {
    const base = (trendPoints || []).map((p) => ({
      month: p.month,
      commission: Number(p.commission || 0),
      netEarnings: Number(p.net_earnings || p.netEarnings || 0),
    }));
    if (!chartMonth || chartMonth === 'All') return base;
    const abbr = monthToAbbr(chartMonth);
    const filtered = base.filter((p) => p.month === abbr);
    // If no data exists for that month, render a 0-value bar instead of showing another month.
    return filtered.length ? filtered : [{ month: abbr, commission: 0, netEarnings: 0 }];
  }, [trendPoints, chartMonth]);

  const yMax = useMemo(() => {
    const max = Math.max(
      0,
      ...chartData.map((d) => Math.max(Number(d.commission || 0), Number(d.netEarnings || 0)))
    );
    const padded = Math.ceil(max / 1000) * 1000;
    return padded || 1000;
  }, [chartData]);

  const getMonthColor = (month) => {
    if (month === 'Nov') return { color: '#FF0000' };
    return { color: '#27804A' };
  };

  const handlePageChange1 = (page) => {
    if (page >= 1 && page <= supplierTotalPages) setCurrentPage1(page);
  };

  const handlePageChange2 = (page) => {
    if (page >= 1 && page <= adminTotalPages) setCurrentPage2(page);
  };

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    const safeTotal = Math.max(1, Number(totalPages || 1));
    const pages = [];
    
    // Always show first up to 3 pages (but never beyond total pages)
    for (let p = 1; p <= Math.min(3, safeTotal); p++) pages.push(p);
    
    // Add ellipsis if current page is far from start
    if (currentPage > 4 && safeTotal > 6) {
      pages.push('...');
    }
    
    // Add pages around current page
    if (currentPage > 3 && currentPage < safeTotal - 2) {
      if (!pages.includes(currentPage - 1)) pages.push(currentPage - 1);
      if (!pages.includes(currentPage)) pages.push(currentPage);
      if (!pages.includes(currentPage + 1)) pages.push(currentPage + 1);
    }
    
    // Add ellipsis before last pages
    if (currentPage < safeTotal - 3 && safeTotal > 6) {
      pages.push('...');
    }
    
    // Always show last 3 pages
    if (safeTotal > 3) {
      [safeTotal - 2, safeTotal - 1, safeTotal].forEach(p => {
        if (!pages.includes(p)) pages.push(p);
      });
    }

    // Drop out-of-range pages just in case
    const normalizedPages = pages.filter((p) => p === '...' || (typeof p === 'number' && p >= 1 && p <= safeTotal));

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
        {normalizedPages.map((page, idx) => (
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
          value={`${currentPage} / ${safeTotal}`}
          onChange={(e) => {
            const [page] = e.target.value.split(' / ');
            onPageChange(parseInt(page));
          }}
        >
          {Array.from({ length: safeTotal }, (_, i) => i + 1).map(page => (
            <option key={page} value={`${page} / ${safeTotal}`}>
              {page} / {safeTotal}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value || 0);
    if (!Number.isFinite(num)) return '$0.00';
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportCsv = async () => {
    // Fetch full datasets for export (all pages), so export is complete and realtime.
    const pageSize = 100;
    const safeMonth = selectedMonth || 'All';
    const safeSearch = searchQuery || '';

    const fetchAllPages = async (fetcher) => {
      const all = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await fetcher(page);
        const rows = res?.rows || [];
        totalPages = Number(res?.total_pages || 1);
        all.push(...rows);
        page += 1;
      } while (page <= totalPages);
      return all;
    };

    let payoutHistoryAll = [];
    let adminCommissionAll = [];
    try {
      payoutHistoryAll = await fetchAllPages((page) =>
        financeService.getSupplierPayoutHistory({
          page,
          pageSize,
          search: safeSearch,
          month: safeMonth,
        }),
      );
    } catch (e) {
      console.error('Failed to export payout history', e);
      payoutHistoryAll = supplierRows || [];
    }

    try {
      adminCommissionAll = await fetchAllPages((page) =>
        financeService.getAdminCommission({
          page,
          pageSize,
          search: safeSearch,
          month: safeMonth,
        }),
      );
    } catch (e) {
      console.error('Failed to export admin commission', e);
      adminCommissionAll = adminRows || [];
    }

    const lines = [];
    // Calculate supplier percent once
    const supplierPercent = Math.round(100 - commissionPercent);
    
    // Summary
    lines.push(['Type', 'Key', 'Value'].join(','));
    lines.push(['summary', 'total_revenue', summary?.total_revenue ?? 0].join(','));
    lines.push(['summary', 'total_commission', summary?.total_commission ?? 0].join(','));
    lines.push(['summary', 'total_supplier_payouts', summary?.total_supplier_payouts ?? 0].join(','));
    lines.push(['summary', 'revenue_change_percent', summary?.revenue_change ?? 0].join(','));
    lines.push(['summary', 'commission_change_percent', summary?.commission_change ?? 0].join(','));
    lines.push(['summary', 'payouts_change_percent', summary?.payouts_change ?? 0].join(','));
    lines.push('');

    // Trend
    lines.push(['Type', 'Month', 'Revenue', `Commission(${Math.round(commissionPercent)}%)`, `Supplier Payouts(${supplierPercent}%)`].join(','));
    (trendPoints || []).forEach((p) => {
      const revenue = Number(p.revenue || 0);
      const commission = Number(p.commission || 0);
      const payouts = Number(p.net_earnings || p.netEarnings || 0);
      lines.push(['trend', `"${p.month || ''}"`, revenue, commission, payouts].join(','));
    });
    lines.push('');

    // Supplier payout history
    lines.push(['Type', 'Supplier', 'Date', 'Product', 'Bookings', 'Earnings', `Commission(${Math.round(commissionPercent)}%)`, `Due Amount(${supplierPercent}%)`, `Payout(${supplierPercent}%)`, 'Reference'].join(','));
    payoutHistoryAll.forEach((r) => {
      lines.push([
        'supplier_payout_history',
        `"${r.supplier_code || r.supplier_id || ''}"`,
        `"${r.date || ''}"`,
        `"${(r.product || '').replace(/"/g, '""')}"`,
        r.bookings ?? 0,
        r.earnings ?? 0,
        r.commission ?? 0,
        r.dueAmount ?? 0,
        r.payout ?? 0,
        `"${(r.reference || '').replace(/"/g, '""')}"`,
      ].join(','));
    });
    lines.push('');

    // Admin commission
    lines.push(['Type', 'Month', 'Total Earnings', `Commission(${Math.round(commissionPercent)}%)`, `Supplier Payouts(${supplierPercent}%)`].join(','));
    adminCommissionAll.forEach((r) => {
      lines.push([
        'admin_commission',
        `"${r.month || ''}"`,
        r.total_earnings ?? 0,
        r.commission ?? 0,
        r.supplier_payouts ?? 0,
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-${selectedMonth || 'All'}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [s, t] = await Promise.all([
          financeService.getSummary(),
          financeService.getTrend(12),
        ]);
        if (!active) return;
        setSummary(s);
        setTrendPoints(t?.points || []);
      } catch (e) {
        if (!active) return;
        console.error('Failed to load finance summary/trend', e);
        setSummary(null);
        setTrendPoints([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Load tables when filters/pages change
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [sp, ac] = await Promise.all([
          financeService.getSupplierPayoutHistory({
            page: currentPage1,
            pageSize: itemsPerPage,
            search: searchQuery,
            month: selectedMonth,
          }),
          financeService.getAdminCommission({
            // Always fetch all months (realtime) for admin commission table
            page: 1,
            pageSize: 100,
            search: searchQuery,
            month: selectedMonth,
          }),
        ]);
        if (!active) return;
        setSupplierRows(sp?.rows || []);
        setSupplierTotalPages(sp?.total_pages || 1);
        setAdminRows(ac?.rows || []);
        setAdminTotalPages(1);
      } catch (e) {
        if (!active) return;
        console.error('Failed to load finance tables', e);
        setSupplierRows([]);
        setSupplierTotalPages(1);
        setAdminRows([]);
        setAdminTotalPages(1);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [currentPage1, itemsPerPage, searchQuery, selectedMonth]);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#27804A' }}>Finance</h1>
        <button
          className="px-4 py-2 rounded-lg text-white font-medium text-sm whitespace-nowrap"
          style={{ backgroundColor: '#284078' }}
          onClick={exportCsv}
        >
          Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#e1f5e3ff' }}>
          <div className="text-4xl font-bold mb-3 text-center" style={{ color: '#27804A' }}>
            {summary ? formatCurrency(summary.total_revenue) : '$0.00'}
          </div>
          <div className="text-sm font-semibold mb-4 text-center text-[21px]" style={{ color: '#27804A' }}>Total revenue</div>
          <div className="flex items-center gap-2 text-sm text-center justify-center" style={{ color: '#27804A' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className='text-center'>{summary ? `${summary.revenue_change}% This Month` : '0% This Month'}</span>
          </div>
        </div>

        {/* Commission */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#A9B3C9' }}>
          <div className="text-4xl font-bold mb-3 text-center" style={{ color: '#284078' }}>
            {summary ? formatCurrency(summary.total_commission) : '$0.00'}
          </div>
          <div className="text-sm font-semibold mb-1 text-center text-[21px]" style={{ color: '#284078' }}>Commission</div>
          <div className="text-xs mb-4 text-center" style={{ color: '#6B7280' }}>Your Balance</div>
          <div className="flex items-center gap-2 text-sm justify-center" style={{ color: '#284078' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{summary ? `${summary.commission_change}% This Month` : '0% This Month'}</span>
          </div>
        </div>

        {/* Supplier Payouts */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#FEF9C2' }}>
          <div className="text-4xl font-bold mb-3 text-center" style={{ color: 'black' }}>
            {summary ? formatCurrency(summary.total_supplier_payouts) : '$0.00'}
          </div>
          <div className="text-sm font-semibold mb-4 text-center text-[21px]" style={{ color: 'black' }}>Supplier Payouts</div>
          <div className="flex items-center gap-2 text-sm justify-center" >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{summary ? `${summary.payouts_change}% This Month` : '0% This Month'}</span>
          </div>
        </div>
      </div>

      {/* Earnings Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
          <div className="flex justify-end">
            <MonthDropdown value={chartMonth} onChange={(m) => setChartMonth(m)} options={monthOptions} />
          </div>
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
                domain={[0, yMax]}
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
        {/* Search + Month filter (moved above the table) */}
        <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
          <div className="flex-1 relative min-w-[220px] max-w-[520px]">
            <input
              type="text"
              placeholder="Search by supplier id/code or product name"
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
          <div className="flex justify-end">
            <MonthDropdown value={selectedMonth} onChange={(m) => { setSelectedMonth(m); setCurrentPage1(1); setCurrentPage2(1); }} options={monthOptions} />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">Supplier Payout History</h3>
        <p className="text-sm text-gray-500 mb-4">Complete breakdown of booking metrics and payout amounts by product and date.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: '#E5E7EB' }}>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Supplier ID</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Date</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Product name</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Bookings</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Earnings</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>
                  <div>Commission</div>
                  <div className="text-xs font-normal text-gray-500">({Math.round(commissionPercent)}%)</div>
                </th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Due Amount</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Payout</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {supplierRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.supplier_code || row.supplier_id}</td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ borderColor: '#E5E7EB' }}>{row.date || '--'}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.product}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{row.bookings}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{formatCurrency(row.earnings)}</td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ color: '#27804A', borderColor: '#E5E7EB' }}> <span className='bg-[#E3FFE4] p-0.5'>{formatCurrency(row.commission)}</span></td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ color: '#FF0000', borderColor: '#E5E7EB' }}>
                    <span className="bg-[#FFE3E3] p-0.5">{formatCurrency(row.dueAmount)}</span>
                  </td>
                  <td className="px-2 text-sm font-semibold border-r" style={{ color: '#27804A', borderColor: '#E5E7EB' }}>
                    <span className="bg-[#E3FFE4] p-0.5">{formatCurrency(row.payout)}</span>
                  </td>
                  <td className="px-2">
                    <div className="flex items-center gap-3 text-gray-400">
                      {/* Wallet / card icon */}
                      <svg
                        className="w-4 h-4 cursor-pointer hover:text-gray-600"
                        onClick={() => openPayoutDetailModal(row.supplier_code || row.supplier_id)}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                      </svg>
                      {/* Eye icon */}
                      <svg
                        className="w-4 h-4 cursor-pointer hover:text-gray-600"
                        onClick={() => openSupplierQuickModal(row.supplier_code || row.supplier_id)}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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

        {renderPagination(currentPage1, supplierTotalPages, handlePageChange1)}
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
                  <div className="text-xs font-normal text-gray-500">({Math.round(commissionPercent)}%)</div>
                </th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Bank</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700 border-r" style={{ borderColor: '#E5E7EB' }}>Payout</th>
                <th className="text-left px-2 text-sm font-semibold text-gray-700">Get in wallet</th>
              </tr>
            </thead>
            <tbody>
              {adminRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <td className="px-2 text-sm font-semibold border-r" style={{ ...getMonthColor(row.month), borderColor: '#E5E7EB' }}>{row.month}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" style={{ borderColor: '#E5E7EB' }}>{formatCurrency(row.total_earnings)}</td>
                  <td className="px-2 text-sm text-gray-900 border-r" >{formatCurrency(row.commission)}</td>
                  <td className="px-2 border-r" style={{ borderColor: '#E5E7EB' }}>
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: row.month === 'Nov' ? '#ffffff' : '#E3FFE4', color: '#27804A' }}>
                      {row.bank || '-'}
                    </span>
                  </td>
                  <td className="px-2 border-r" style={{ borderColor: '#E5E7EB' }}>
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: row.month === 'Nov' ? '#ffffff' : '#E3FFE4', color: '#27804A' }}>
                      {row.payout_status || '-'}
                    </span>
                  </td>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}>
                    {row.wallet_received ? (
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

        {/* Admin commission shows all months (no pagination needed) */}
      </div>

      {/* Payout detail modal */}
      <PayoutDetailModal
        isOpen={isPayoutOpen}
        onClose={() => setIsPayoutOpen(false)}
        payouts={payoutModalPayouts}
        supplier={payoutModalSupplier}
      />
      <SupplierProfileQuickModal
        isOpen={isSupplierViewOpen}
        onClose={() => setIsSupplierViewOpen(false)}
        supplier={supplierViewData}
        insights={supplierViewInsights}
        loading={supplierViewLoading}
        error={supplierViewError}
        onViewProfile={() => openSupplierProfileWithFocus(supplierViewData?.id || supplierViewData?.supplier_code || supplierViewData?.supplier_id)}
        onViewPayout={() => openSupplierProfileWithFocus(supplierViewData?.id || supplierViewData?.supplier_code || supplierViewData?.supplier_id, 'payouts')}
        onSendMessage={() => sendMessageToSupplier(
          supplierViewData?.id || supplierViewData?.supplier_code || supplierViewData?.supplier_id,
          supplierViewData?.name,
        )}
      />
    </div>
  );
};

export default Finance;
