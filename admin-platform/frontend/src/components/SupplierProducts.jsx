import React, { useEffect, useState } from 'react';
import TourDetailPage from './TourDetailPage';
import { getSupplierProducts } from '../services/supplierService';

const SupplierProducts = ({ supplierId, onBack }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supplierId) return;
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getSupplierProducts(supplierId, 1, 30);
        if (!active) return;
        setProducts(res.products || []);
      } catch (err) {
        if (!active) return;
        console.error('Error loading products', err);
        setError('Unable to load products right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => { active = false; };
  }, [supplierId]);

  if (selectedId) {
    return <TourDetailPage productId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-green-700 text-2xl mb-6">
          <span className="font-medium">Suppliers</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800">{supplierId || '--'}</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800">Products</span>
          {onBack && (
            <button onClick={onBack} className="ml-auto px-4 py-2 text-sm rounded-lg border hover:bg-gray-100">Back</button>
          )}
        </div>

        {loading && (
          <div className="text-sm text-gray-500 mb-4">Loading products...</div>
        )}
        {error && (
          <div className="text-sm text-red-500 mb-4">{error}</div>
        )}

        <div className="space-y-6">
          {products.length === 0 && !loading && !error && (
            <div className="text-sm text-gray-500">No products found.</div>
          )}
          {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-300 p-5 cursor-pointer" onClick={() => setSelectedId(p.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{p.tagline || '—'}</p>
                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs">
                    {p.duration && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/></svg>
                        {p.duration}
                      </span>
                    )}
                    {p.category && <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{p.category}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-3">
                    {p.status || 'published'}
                  </span>
                  <div className="text-green-700 text-sm font-semibold">
                    {p.price
                      ? (() => {
                          const symbol = p.currency === 'USD' ? '$' : '';
                          const unit = p.price_unit || '';
                          return `${symbol}${p.price} ${unit}`.trim();
                        })()
                      : '—'}
                  </div>
                </div>
              </div>
              {p.vehicle && (
                <div className="mt-3 text-right text-[11px] text-gray-500">{p.vehicle}</div>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};

export default SupplierProducts;


