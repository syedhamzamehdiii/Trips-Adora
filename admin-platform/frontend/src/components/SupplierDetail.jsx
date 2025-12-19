import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import MonthDropdown from './MonthDropdown';
import PayoutDetailModal from './PayoutDetailModal';
import SupplierDocsModal from './SupplierDocsModal';
import SupplierProducts from './SupplierProducts';
import { getSupplierDetail } from '../services/supplierService';
import platformSettingsService from '../services/platformSettingsService';

const SupplierDetail = ({ supplierId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docsAnchorRect, setDocsAnchorRect] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [commissionPercent, setCommissionPercent] = useState(25);
  const payoutHistoryRef = React.useRef(null);
  const didFocusRef = React.useRef(false);

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

  useEffect(() => {
    if (!supplierId) return;
    let active = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSupplierDetail(supplierId);
        if (!active) return;
        setDetail(data);
      } catch (err) {
        if (!active) return;
        console.error('Error fetching supplier detail', err);
        setError('Unable to load supplier details right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [supplierId]);

  // Deep-link focus: #supplier-profile?id=...&focus=payouts
  useEffect(() => {
    if (didFocusRef.current) return;
    if (!detail) return;
    const hash = typeof window !== 'undefined' ? (window.location.hash || '') : '';
    if (!hash.includes('focus=payouts')) return;
    didFocusRef.current = true;
    // Scroll to payout history block
    setTimeout(() => {
      if (payoutHistoryRef.current && payoutHistoryRef.current.scrollIntoView) {
        payoutHistoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, [detail]);

  const payouts = useMemo(() => detail?.payouts || [], [detail]);

  const filteredPayouts = useMemo(() => {
    let rows = payouts;

    // Month filter (Jan–Dec + All)
    if (selectedMonth && selectedMonth !== 'All') {
      const monthIndex =
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ].indexOf(selectedMonth);
      if (monthIndex >= 0) {
        rows = rows.filter((row) => {
          if (!row.date) return false;
          const d = new Date(row.date);
          return !Number.isNaN(d.getTime()) && d.getMonth() === monthIndex;
        });
      }
    }

    // Search filter (product name, date, reference)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter((row) => {
        const name = String(row.product || '').toLowerCase();
        const date = String(row.date || '').toLowerCase();
        const ref = String(row.reference || '').toLowerCase();
        return name.includes(q) || date.includes(q) || ref.includes(q);
      });
    }

    return rows;
  }, [payouts, selectedMonth, searchQuery]);

  const pagedPayouts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayouts.slice(start, start + itemsPerPage);
  }, [filteredPayouts, currentPage, itemsPerPage]);

  const totalPages = payouts.length ? Math.ceil(payouts.length / itemsPerPage) : 1;

  const formatCurrency = (amount) => {
    const num = typeof amount === 'number' ? amount : 0;
    if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return '$' + (num / 1_000).toFixed(1) + 'k';
    return '$' + num.toFixed(2);
  };

  const handleSendMessage = () => {
    if (typeof window !== 'undefined' && window.location) {
      const targetId = detail?.id || supplierId;
      const targetName = detail?.name || '';
      window.location.hash = `#message-supplier=${encodeURIComponent(
        targetId || '',
      )}&name=${encodeURIComponent(targetName)}`;
    }
  };

  if (showProducts) {
    return <SupplierProducts supplierId={supplierId} onBack={() => setShowProducts(false)} />;
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {loading && (
        <div className="max-w-7xl mx-auto py-4 px-4 text-sm text-gray-500">Refreshing supplier data...</div>
      )}
      {error && (
        <div className="max-w-7xl mx-auto py-2 px-4 text-sm text-red-500">{error}</div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history) {
                  window.history.back();
                }
              }}
              className="mr-2 inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100"
              aria-label="Back to suppliers"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl font-medium text-green-700">Supplier</h1>
            <span className="text-gray-400 text-2xl">›</span>
            <span className="text-2xl text-gray-700">{detail?.id || supplierId || '--'}</span>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowProducts(true)}
              className="px-6 py-2 bg-green-200 text-green-800 text-sm font-medium rounded-full hover:bg-green-300"
            >
              View Products
            </button>
            <button
              onClick={(e) => {
                setDocsAnchorRect(e.currentTarget.getBoundingClientRect());
                setIsDocsOpen(true);
              }}
              className="px-6 py-2 bg-yellow-200 text-yellow-800 text-sm font-medium rounded-full hover:bg-yellow-300"
            >
              View Doc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Left Column - Supplier & Office Information */}
          <div className="col-span-2 space-y-6">
            {/* Supplier Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Supplier information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Account type:</span>
                  <span className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full">
                    {detail?.account_type || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Public name:</span>
                  <span className="text-sm text-gray-700">{detail?.name || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Legal name:</span>
                  <span className="text-sm text-gray-500">{detail?.legal_name || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Email:</span>
                  <span className="text-sm text-gray-700">{detail?.email || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Contact:</span>
                  <span className="text-sm text-gray-700">{detail?.phone || '—'}</span>
                </div>
              </div>
            </div>
            {/* Office Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Office information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Street address:</span>
                  <span className="text-sm text-gray-700">{detail?.address || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">City:</span>
                  <span className="text-sm text-gray-700">{detail?.city || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">State:</span>
                  <span className="text-sm text-gray-700">{detail?.state || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 w-40">Country:</span>
                  <span className="text-sm text-gray-700">{detail?.country || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="flex flex-col space-y-4 items-end">
            <button
              className="w-[160px] h-[48px] px-6 py-3 bg-blue-900 text-white text-sm font-medium rounded-full hover:bg-blue-800"
              onClick={handleSendMessage}
            >
              Send Message
            </button>
            {/* Block button kept, actual block logic is elsewhere */}
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 w-[160px]">
              <div className="text-4xl font-semibold text-gray-900 mb-1">
                {detail?.total_tours ?? '—'}
              </div>
              <div className="text-sm text-gray-400">Total Tours</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 w-[160px]">
              <div className="text-4xl font-semibold text-gray-900 mb-1">
                {(detail?.rating ?? 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Rating</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 w-[160px]">
              <div className="text-4xl font-semibold text-gray-900 mb-1">
                {formatCurrency(detail?.earnings ?? 0)}
              </div>
              <div className="text-sm text-gray-400">Earnings</div>
            </div>
            <button
              onClick={() => setIsPayoutOpen(true)}
              className="w-[160px] h-[48px] px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              Payouts
              {payouts.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* Supplier Payout History */}
        <div ref={payoutHistoryRef} className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or ref. number"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="ml-4">
              <MonthDropdown
                value={selectedMonth}
                onChange={(val) => {
                  setSelectedMonth(val);
                  setCurrentPage(1);
                }}
                options={[
                  'All',
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ]}
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Payout History</h2>
            <p className="text-sm text-gray-400">
              Complete breakdown of booking metrics and payout amounts by product and date.
            </p>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Product name</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Earnings</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">
                    <div>Commission</div>
                    <div className="text-xs font-normal text-gray-400">({Math.round(commissionPercent)}%)</div>
                  </th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Due Amount</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Payout</th>
                </tr>
              </thead>
              <tbody>
                {pagedPayouts.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-500" colSpan={7}>
                      {loading ? 'Loading...' : 'No payout history yet.'}
                    </td>
                  </tr>
                )}
                {pagedPayouts.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-1 text-sm text-gray-900">{row.date || '--'}</td>
                    <td className="px-4 py-1 text-sm text-gray-900">{row.product || '--'}</td>
                    <td className="px-4 py-1 text-sm text-gray-900">{row.bookings ?? '--'}</td>
                    <td className="px-4 py-1 text-sm text-gray-900">
                      {formatCurrency(row.earnings ?? 0)}
                    </td>
                    <td className="px-4 py-1">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-lg font-semibold text-sm bg-green-100 text-green-700">
                        {formatCurrency(row.commission ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-1">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-lg font-semibold text-sm bg-red-100 text-red-600">
                        {formatCurrency(row.dueAmount ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-1">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-lg font-semibold text-sm bg-green-100 text-green-700">
                        {formatCurrency(row.payout ?? 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (fixed page size, selector removed as per design) */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-9 h-9 rounded-full bg-blue-900 text-white text-sm font-medium">
              {currentPage}
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Payout details and docs modals are placeholders; wired to existing components if they expect props */}
      {isPayoutOpen && (
        <PayoutDetailModal
          isOpen={isPayoutOpen}
          onClose={() => setIsPayoutOpen(false)}
          payouts={payouts}
          supplier={detail}
        />
      )}
      {isDocsOpen && (
        <SupplierDocsModal
          isOpen={isDocsOpen}
          onClose={() => setIsDocsOpen(false)}
          anchorRect={docsAnchorRect}
          documents={detail?.documents || []}
        />
      )}
    </div>
  );
};

export default SupplierDetail;

 
