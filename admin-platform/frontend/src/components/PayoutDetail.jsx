import React, { useMemo, useState } from 'react';

import { CheckCircle, Clock } from 'lucide-react';
import PaymentDetailsModal from './PaymentDetailsModal';

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayoutDetail = ({ payouts = [], supplier }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const avatarUrl =
    supplier?.avatar_url ||
    supplier?.avatarUrl ||
    supplier?.profile_photo ||
    supplier?.photo ||
    supplier?.photoUrl ||
    null;

  const monthlyRows = useMemo(() => {
    const map = new Map();
    const now = new Date();
    const currentMonth = now.getMonth();

    payouts.forEach((row) => {
      if (!row.date) return;
      const d = new Date(row.date);
      if (Number.isNaN(d.getTime())) return;

      const m = d.getMonth();
      const key = m;
      const amount = typeof row.payout === 'number' ? row.payout : row.earnings || 0;
      const product = row.product || '—';

      if (!map.has(key)) {
        map.set(key, {
          monthIndex: m,
          month: monthShort[m],
          bank: '-', // banking details are not yet stored; placeholder
          totalAmount: 0,
          products: {},
          isDue: false,
        });
      }
      const entry = map.get(key);
      entry.totalAmount += amount;
      entry.products[product] = (entry.products[product] || 0) + (row.bookings || 0);
      // Previously we marked the current month as "Due".
      // Now all historical months are treated as already paid.
      entry.isDue = false;
    });

    const rows = Array.from(map.values());
    rows.forEach((r) => {
      // pick top product by bookings count
      const entries = Object.entries(r.products);
      if (entries.length === 0) {
        r.topProduct = '—';
      } else {
        entries.sort((a, b) => b[1] - a[1]);
        r.topProduct = entries[0][0];
      }
    });

    // sort by month descending (most recent first)
    rows.sort((a, b) => b.monthIndex - a.monthIndex);
    return rows;
  }, [payouts]);
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payout Detail</h2>
          <p className="text-sm text-gray-400">
            Complete breakdown of booking metrics and payout amounts by month and top product.
          </p>
        </div>
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={supplier?.name || 'Supplier'}
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // fallback to initials if image fails
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">
                {(supplier?.name || 'User')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{supplier?.name || 'Supplier'}</h3>
            <p className="text-xs text-gray-500">{supplier?.email || ''}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded">
                Active
              </span>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden p-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200">
              <th className="text-left px-2 py-0.5 text-sm font-semibold text-gray-900">Month</th>
              <th className="text-left px-2 py-0.5 text-sm font-semibold text-gray-900">Bank</th>
              <th className="text-left px-2 py-0.5 text-sm font-semibold text-gray-900">Amount</th>
              <th className="text-left px-2 py-0.5 text-sm font-semibold text-gray-900">Top Product</th>
              <th className="text-left px-2 py-0.5 text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRows.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 hover:bg-gray-50 ${row.isDue ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (row.isDue) setIsPaymentOpen(true);
                }}
              >
                <td className="px-2 py-0.5 text-sm text-gray-900">{row.month}</td>
                <td className="px-2 py-0.5 text-sm text-gray-900">{row.bank}</td>
                <td className="px-2 py-0.5 text-sm font-medium text-gray-900">
                  {row.totalAmount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-2 py-0.5 text-sm text-gray-900">{row.topProduct}</td>
                <td className="px-2 py-0.5">
                  {!row.isDue ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-600 text-sm font-medium rounded-md">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-600 text-sm font-medium rounded-md">
                      Due
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaymentDetailsModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
};

export default PayoutDetail;


