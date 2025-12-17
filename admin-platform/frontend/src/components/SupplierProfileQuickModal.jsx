import React, { useState } from 'react';

const initialsOf = (fullName) => {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '');
  return (parts[0] || '') + (parts[1] || '');
};

const formatCurrencyCompact = (amount) => {
  const n = typeof amount === 'number' ? amount : Number(amount || 0);
  if (!Number.isFinite(n)) return '$0.00';
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'k';
  return '$' + n.toFixed(2);
};

const SupplierProfileQuickModal = ({
  isOpen,
  onClose,
  supplier,
  insights,
  loading = false,
  error = null,
  onViewProfile,
  onViewPayout,
  onSendMessage,
}) => {
  if (!isOpen) return null;

  const name = supplier?.name || 'Supplier';
  const email = supplier?.email || '';
  const initials = supplier?.initials || initialsOf(name) || 'SU';
  const avatarUrl =
    supplier?.avatar_url ||
    supplier?.avatarUrl ||
    supplier?.profile_photo ||
    supplier?.photo ||
    supplier?.photoUrl ||
    null;
  const [avatarFailed, setAvatarFailed] = useState(false);
  const totalTours = Number(supplier?.totalTours ?? supplier?.total_tours ?? 0) || 0;
  const ratingRaw = supplier?.rating;
  const rating = typeof ratingRaw === 'number' ? ratingRaw.toFixed(1) : (ratingRaw || '0.0');
  const earnings = typeof supplier?.earnings === 'number' ? supplier.earnings : Number(supplier?.earnings || 0);

  const completion = Number(insights?.completion_rate ?? 0);
  const response = Number(insights?.response_rate ?? 0);
  const satisfaction = Number(insights?.satisfaction ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Top header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  setAvatarFailed(true);
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1c2a4f] text-white flex items-center justify-center text-xl font-semibold">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
              <div className="text-sm text-gray-700">{email}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onViewProfile ? onViewProfile() : onClose && onClose(); }}
              className="px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              View Profile
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-gray-300 p-5 text-center">
            <div className="text-2xl font-semibold text-gray-800">{loading ? '—' : totalTours}</div>
            <div className="text-xs text-gray-500 mt-1">Total Tours</div>
          </div>
          <div className="rounded-xl border border-gray-300 p-5 text-center">
            <div className="text-2xl font-semibold text-gray-800">{loading ? '—' : rating}</div>
            <div className="text-xs text-gray-500 mt-1">Rating</div>
          </div>
          <div className="rounded-xl border border-gray-300 p-5 text-center">
            <div className="text-2xl font-semibold text-gray-800">{loading ? '—' : formatCurrencyCompact(earnings)}</div>
            <div className="text-xs text-gray-500 mt-1">Earnings</div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Booking Completion Rate</span>
              <span className="text-gray-900 font-medium">{loading ? '—' : `${completion.toFixed(1)}%`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Average Response Rate</span>
              <span className="text-gray-900 font-medium">{loading ? '—' : `${response.toFixed(1)}%`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Customer Satisfaction</span>
              <span className="text-gray-900 font-medium">{loading ? '—' : `${satisfaction.toFixed(1)}%`}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 px-5 py-3 rounded-full bg-[#1c2a4f] text-white text-sm"
            onClick={() => { onSendMessage ? onSendMessage() : null; }}
          >
            Send Message
          </button>
          <button
            onClick={() => { onViewPayout ? onViewPayout() : onClose && onClose(); }}
            className="flex-1 px-5 py-3 rounded-full border border-gray-300 text-gray-700 text-sm bg-white hover:bg-gray-50"
          >
            View Payout Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfileQuickModal;



