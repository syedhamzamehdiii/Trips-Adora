import React, { useState } from 'react';

import { CheckCircle, Clock } from 'lucide-react';
import PaymentDetailsModal from './PaymentDetailsModal';
const PayoutDetail = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const payoutData = [
    { month: 'Nov', bank: 'Payoneer', amount: '$1.5k', product: 'Mount fuji', status: 'Due', isPaid: false },
    { month: 'Oct', bank: 'Payoneer', amount: '$1.5k', product: 'Tokyo tour', status: 'Paid', isPaid: true },
    { month: 'Sep', bank: 'Payoneer', amount: '$1.5k', product: 'Mount fuji', status: 'Paid', isPaid: true },
    { month: 'Aug', bank: 'Payoneer', amount: '$1.5k', product: 'Tokyo tour', status: 'Paid', isPaid: true },
    { month: 'Jul', bank: 'Payoneer', amount: '$1.5k', product: 'Mount fuji', status: 'Paid', isPaid: true },
    { month: 'Jun', bank: 'Payoneer', amount: '$1.5k', product: 'Tokyo tour', status: 'Paid', isPaid: true },
    { month: 'May', bank: 'Payoneer', amount: '$1.5k', product: 'Mount fuji', status: 'Paid', isPaid: true },
    { month: 'Apr', bank: 'Payoneer', amount: '$1.5k', product: 'Tokyo tour', status: 'Paid', isPaid: true },
  ];
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payout Detail</h2>
          <p className="text-sm text-gray-400">
            Complete breakdown of booking metrics and<br />product preferences by country
          </p>
        </div>
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center">
            <span className="text-white text-xl font-semibold">KT</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Karvaan Tours</h3>
            <p className="text-xs text-gray-500">karvaantours@gmail.com</p>
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
            {payoutData.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 hover:bg-gray-50 ${row.isPaid ? '' : 'cursor-pointer'}`}
                onClick={() => { if (!row.isPaid) setIsPaymentOpen(true); }}
              >
                <td className="px-2 py-0.5 text-sm text-gray-900">{row.month}</td>
                <td className="px-2 py-0.5 text-sm text-gray-900">{row.bank}</td>
                <td className="px-2 py-0.5 text-sm font-medium text-gray-900">{row.amount}</td>
                <td className="px-2 py-0.5 text-sm text-gray-900">{row.product}</td>
                <td className="px-2 py-0.5">
                  {row.isPaid ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-600 text-sm font-medium rounded-md">
                      {row.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-600 text-sm font-medium rounded-md">
                      {row.status}
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


