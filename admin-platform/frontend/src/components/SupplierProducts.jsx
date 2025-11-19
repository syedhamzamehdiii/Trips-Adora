import React, { useState } from 'react';
import TourDetailPage from './TourDetailPage';

const products = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: 'Mount Fuji Customized Tour Day tour',
  desc: 'Discover the breathtaking beauty of Mount Fuji',
  hours: '10 hours',
  price: '$ 240 Per Group',
  badge: 'Private',
  vehicle: 'Mercedes-Benz A-Class (2018 model)'
}));

const SupplierProducts = ({ onBack }) => {
  const [selected, setSelected] = useState(null);
  if (selected) {
    return <TourDetailPage onBack={() => setSelected(null)} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-green-700 text-2xl mb-6">
          <span className="font-medium">Suppliers</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800">#TA-1002484</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800">Products</span>
          {onBack && (
            <button onClick={onBack} className="ml-auto px-4 py-2 text-sm rounded-lg border hover:bg-gray-100">Back</button>
          )}
        </div>

        <div className="space-y-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-300 p-5 cursor-pointer" onClick={() => setSelected(p)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{p.desc}</p>
                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/></svg>
                      {p.hours}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-3">{p.badge}</span>
                  <div className="text-green-700 text-sm font-semibold">{p.price}</div>
                </div>
              </div>
              <div className="mt-3 text-right text-[11px] text-gray-500">{p.vehicle}</div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default SupplierProducts;


