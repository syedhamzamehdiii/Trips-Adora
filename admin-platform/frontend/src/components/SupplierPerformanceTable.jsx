import React, { useEffect, useMemo, useState } from 'react';
import { getActiveSuppliers, getBlockedSuppliers, blockSupplier, unblockSupplier } from '../services/supplierService';

const SupplierPerformanceTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockModal, setBlockModal] = useState({ open: false, supplier: null, reason: '' });
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedSuppliers, setBlockedSuppliers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const resp = await getActiveSuppliers(1, 50, null);
      setSuppliers(resp.suppliers || []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocked = async () => {
    try {
      setLoadingBlocked(true);
      const resp = await getBlockedSuppliers(1, 50, null);
      setBlockedSuppliers(resp.suppliers || []);
    } catch (e) {
      console.error(e);
      setBlockedSuppliers([]);
    } finally {
      setLoadingBlocked(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleBlock = async () => {
    if (!blockModal.supplier) return;
    try {
      await blockSupplier(blockModal.supplier.supplier_id || blockModal.supplier.id, blockModal.reason);
      setSuppliers((prev) => prev.filter((s) => (s.supplier_id || s.id) !== (blockModal.supplier.supplier_id || blockModal.supplier.id)));
      setBlockModal({ open: false, supplier: null, reason: '' });
      // Refresh blocked list if modal is open
      if (showBlocked) {
        fetchBlocked();
      }
    } catch (e) {
      console.error('Block failed', e);
      alert('Failed to block supplier. Please try again.');
    }
  };

  const handleUnblock = async (supplierId) => {
    try {
      await unblockSupplier(supplierId);
      setBlockedSuppliers((prev) => prev.filter((s) => (s.supplier_id || s.id) !== supplierId));
      // refresh active list
      fetchSuppliers();
      alert('Supplier unblocked successfully!');
    } catch (e) {
      console.error('Unblock failed', e);
      alert('Failed to unblock supplier. Please try again.');
    }
  };

  const columns = useMemo(() => [
    { key: 'supplier_id', label: 'Supplier ID' },
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Name' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'revenue', label: 'Earnings' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'performance', label: 'Performance' },
  ], []);

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Top supplier performance</h2>
          <p className="text-gray-500 text-sm mt-1">
            Complete breakdown of booking metrics and product preferences by country.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowBlocked(true); fetchBlocked(); }}
            className="h-9 px-4 rounded-full text-sm font-medium text-white bg-gray-700 hover:bg-gray-800"
          >
            Blocked suppliers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading suppliers...</div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-200">
                {columns.map(col => (
                  <th key={col.key} className="text-left py-3 px-4 font-medium text-gray-600">{col.label}</th>
                ))}
                <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-6 text-center text-gray-500">No suppliers found</td>
                </tr>
              ) : suppliers.map((supplier) => {
                const revenue = supplier.revenue || 0;
                const positive = revenue >= 3000;
                const performance = supplier.performance || 0;
                return (
                  <tr key={supplier.supplier_id || supplier.id} className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-800">{supplier.supplier_id || supplier.id}</td>
                    <td className="py-4 px-4 text-gray-700">{supplier.email}</td>
                    <td className="py-4 px-4 text-gray-800 font-medium">{supplier.name}</td>
                    <td className="py-4 px-4 text-gray-800">{(supplier.bookings || 0).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        ${revenue >= 1000 ? (revenue/1000).toFixed(1)+'k' : revenue.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-800">{supplier.reviews || 0}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: `${performance}%` }} />
                        </div>
                        <span className="text-gray-500 text-xs w-10 text-right">{performance}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                        style={{ backgroundColor: '#FF6F6F' }}
                        onClick={() => setBlockModal({ open: true, supplier, reason: '' })}
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {blockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBlockModal({ open: false, supplier: null, reason: '' })} />
          <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <p className="text-sm text-gray-900 mb-4">Do you really want to block this supplier?</p>
            <div className="flex items-center gap-3 mb-5">
              <button
                type="button"
                className="px-5 py-1.5 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: '#FF6F6F' }}
                onClick={handleBlock}
              >
                Block
              </button>
              <button
                type="button"
                className="px-5 py-1.5 rounded-full text-gray-700 text-sm font-medium border"
                onClick={() => setBlockModal({ open: false, supplier: null, reason: '' })}
              >
                Cancel
              </button>
            </div>

            <p className="text-sm text-gray-900 mb-2">Please provide a reason before blocking this supplier. (Optional)</p>
            <textarea
              value={blockModal.reason}
              onChange={(e) => setBlockModal((prev) => ({ ...prev, reason: e.target.value }))}
              className="w-full min-h-[72px] rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none"
              placeholder=""
            />
          </div>
        </div>
      )}

      {showBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowBlocked(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Blocked suppliers</h3>
              <button className="text-sm text-gray-600" onClick={() => setShowBlocked(false)}>Close</button>
            </div>
            {loadingBlocked ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading...</div>
            ) : blockedSuppliers.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No blocked suppliers</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">ID</th>
                    <th className="text-left py-2 px-3">Email</th>
                    <th className="text-left py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedSuppliers.map((s) => (
                    <tr key={s.supplier_id || s.id} className="border-b border-gray-100">
                      <td className="py-2 px-3">{s.supplier_id || s.id}</td>
                      <td className="py-2 px-3">{s.email}</td>
                      <td className="py-2 px-3">
                        <button
                          className="px-3 py-1 rounded-full text-white text-xs font-semibold bg-green-600"
                          onClick={() => handleUnblock(s.supplier_id || s.id)}
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPerformanceTable;

