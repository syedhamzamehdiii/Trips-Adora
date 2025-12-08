import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import MonthDropdown from './MonthDropdown';
import PayoutDetailModal from './PayoutDetailModal';
import SupplierDocsModal from './SupplierDocsModal';
import SupplierProducts from './SupplierProducts';
import { getSupplierDetail } from '../services/supplierService';

const SupplierDetail = ({ supplierId }) => {
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docsAnchorRect, setDocsAnchorRect] = useState(null);
  const [showProducts, setShowProducts] = useState(false);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const payouts = useMemo(() => detail?.payouts || [], [detail]);

  return (
    <div className="min-h-screen bg-white " style={{ fontFamily: 'Poppins, sans-serif' }}>
      {loading && (
        <div className="max-w-7xl mx-auto py-6 px-4 text-sm text-gray-500">Refreshing supplier data...</div>
      )}
      {error && (
        <div className="max-w-7xl mx-auto py-2 px-4 text-sm text-red-500">{error}</div>
      )}
      {showProducts ? (
        <SupplierProducts supplierId={supplierId} onBack={() => setShowProducts(false)} />
      ) : (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-medium text-green-700">Supplier</h1>
            <span className="text-gray-400 text-2xl">›</span>
            <span className="text-2xl text-gray-700">{detail?.supplier_id || supplierId || '--'}</span>
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
                <div className="flex items-center"><span className="text-sm text-gray-900 w-40">Street address:</span><span className="text-sm text-gray-700">1 Chome-1 Nishi-Shinjuku, Shinjuku City, Tokyo</span></div>
                <div className="flex items-center"><span className="text-sm text-gray-900 w-40">Street address:</span><span className="text-sm text-gray-700">{detail?.address || '—'}</span></div>
                <div className="flex items-center"><span className="text-sm text-gray-900 w-40">City:</span><span className="text-sm text-gray-700">{detail?.city || '—'}</span></div>
                <div className="flex items-center"><span className="text-sm text-gray-900 w-40">State:</span><span className="text-sm text-gray-700">{detail?.state || '—'}</span></div>
                <div className="flex items-center"><span className="text-sm text-gray-900 w-40">Country:</span><span className="text-sm text-gray-700">{detail?.country || '—'}</span></div>
              </div>
            </div>
          </div>
          {/* Right Column - Stats & Actions */}
        <div className="flex flex-col space-y-4 items-end">
  {/* Massage Button */}
  <button
    className="w-[160px] h-[48px] px-6 py-3 bg-blue-900 text-white text-sm font-medium rounded-full hover:bg-blue-800"
  >
    Massage
  </button>

  {/* Block Button */}
  <button
    onClick={() => setIsBlockOpen(true)}
    className="w-[160px] h-[48px] px-6 py-3 bg-red-400 text-white text-sm font-medium rounded-full hover:bg-red-500"
  >
    Block
  </button>

  {/* Stats Boxes */}
  <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 w-[160px]">
    <div className="text-4xl font-semibold text-gray-900 mb-1">{detail?.total_tours ?? '—'}</div>
    <div className="text-sm text-gray-400">Total Tours</div>
  </div>

  <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 w-[160px]">
    <div className="text-4xl font-semibold text-gray-900 mb-1">{(detail?.rating ?? 0).toFixed(1)}</div>
    <div className="text-sm text-gray-400">Rating</div>
  </div>

  <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 w-[160px]">
    <div className="text-4xl font-semibold text-gray-900 mb-1">${detail?.earnings ? detail.earnings.toLocaleString() : '0'}</div>
    <div className="text-sm text-gray-400">Earnings</div>
  </div>

  {/* Payouts Button */}
  <button
    onClick={() => setIsPayoutOpen(true)}
    className="w-[160px] h-[48px] px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2"
  >
    Payouts
    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
  </button>
</div>

        </div>

        {/* Supplier Payout History */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by name or ref. number" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="ml-4"><MonthDropdown value={selectedMonth} onChange={setSelectedMonth} options={['October','September','August','July']} /></div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Payout History</h2>
            <p className="text-sm text-gray-400">Complete breakdown of booking metrics and product preferences by country</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Product name</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Earnings</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900"><div>Commission</div><div className="text-xs font-normal text-gray-400">(25%)</div></th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Due Amount</th>
                  <th className="text-left px-4 py-1 text-sm font-semibold text-gray-900">Payout</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-500" colSpan={7}>
                      {loading ? 'Loading...' : 'No payout history yet.'}
                    </td>
                  </tr>
                )}
                {payouts.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setIsPayoutOpen(true)}>
                    <td className="px-4 py-1 text-sm text-gray-900">{row.date || '--'}</td>
                    <td className="px-4 py-1 text-sm text-gray-900">{row.product || '--'}</td>
                    <td className="px-4 py-1 text-sm text-gray-900">{row.bookings ?? '--'}</td>
                    <td className="px-4 py-1 text-sm text-gray-900">{row.earnings ?? '--'}</td>
                    <td className="px-4 py-1">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-lg font-semibold text-sm bg-green-100 text-green-700">{row.commission ?? '--'}</span>
                    </td>
                    <td className="px-4 py-1">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-lg font-semibold text-sm bg-red-100 text-red-600">{row.dueAmount ?? '--'}</span>
                    </td>
                    <td className="px-4 py-1">
                      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-lg font-semibold text-sm bg-green-100 text-green-700">{row.payout ?? '--'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="p-2 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <button className="w-9 h-9 rounded-full bg-blue-900 text-white text-sm font-medium">1</button>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-medium">2</button>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-medium">3</button>
            <span className="text-gray-400 px-2">...</span>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-medium">12</button>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-medium">13</button>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-medium">14</button>
            <button className="p-2 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="ml-4 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none flex items-center gap-2">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-600 -ml-8 pointer-events-none" />
          </div>
        </div>
      </div>
      )}
      {/* Block Supplier Modal */}
      {isBlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsBlockOpen(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <p className="text-sm text-gray-900 mb-4">Do you really want to block this supplier?</p>
            <div className="flex items-center gap-3 mb-5">
              <button type="button" className="px-5 py-1.5 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: '#FF6F6F' }}>Block</button>
              <button type="button" className="px-5 py-1.5 rounded-full text-gray-700 text-sm font-medium border" onClick={() => setIsBlockOpen(false)}>Cancel</button>
            </div>
            <p className="text-sm text-gray-900 mb-2">Please provide a reason before blocking this supplier. ( Optional )</p>
            <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="w-full min-h-[72px] rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none" />
            <div className="flex items-center justify-between mt-5">
              <button type="button" className="px-5 py-2 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: '#284078' }}>Contact to Supplier</button>
              <button type="button" className="px-5 py-2 rounded-full text-gray-400 text-sm font-semibold border bg-gray-50 cursor-not-allowed" disabled>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <PayoutDetailModal isOpen={isPayoutOpen} onClose={() => setIsPayoutOpen(false)} />
      <SupplierDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        anchorRect={docsAnchorRect}
        documents={detail?.documents || []}
      />
    </div>
  );
};

export default SupplierDetail;


