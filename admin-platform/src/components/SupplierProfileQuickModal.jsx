import React from 'react';

const SupplierProfileQuickModal = ({ isOpen, onClose, supplier, onViewProfile, onViewPayout }) => {
  if (!isOpen) return null;

  const title = 'Karvaan Tours';
  const email = 'karvaantours@gmail.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Top header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#284078] text-white flex items-center justify-center text-xl font-semibold">KT</div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
              <div className="text-sm text-gray-700">{email}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✔ Verified</span>
              </div>
            </div>
          </div>
          <button onClick={() => { onViewProfile ? onViewProfile() : onClose && onClose(); }} className="px-4 py-1.5 rounded-full border text-xs font-medium text-gray-700">View Profile</button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="rounded-xl border px-6 py-6 text-center">
            <div className="text-2xl font-semibold">24</div>
            <div className="text-xs text-gray-500 mt-1">Total Tours</div>
          </div>
          <div className="rounded-xl border px-6 py-6 text-center">
            <div className="text-2xl font-semibold">4.9</div>
            <div className="text-xs text-gray-500 mt-1">Rating</div>
          </div>
          <div className="rounded-xl border px-6 py-6 text-center">
            <div className="text-2xl font-semibold">$23k</div>
            <div className="text-xs text-gray-500 mt-1">Earnings</div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <div className="text-sm text-gray-800">Booking Completion Rate</div>
            <div className="text-right text-sm text-gray-900">94%</div>
            <div className="text-sm text-gray-800">Average Response Time</div>
            <div className="text-right text-sm text-gray-900">1.2 hours</div>
            <div className="text-sm text-gray-800">Customer Satisfaction</div>
            <div className="text-right text-sm text-gray-900">4.8/5.0</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-6">
          <button className="flex-1 bg-[#284078] text-white rounded-xl py-3 text-sm font-medium">Send Message</button>
          <button onClick={() => { onViewPayout ? onViewPayout() : onClose && onClose(); }} className="flex-1 border rounded-xl py-3 text-sm font-medium text-gray-700">View Payout Details</button>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfileQuickModal;


