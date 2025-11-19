import React from 'react';
import { CreditCard, Star } from 'lucide-react';

const PaymentDetailsCard = () => {
  return (
    <div className="w-full max-w-full mx-auto bg-white rounded-3xl shadow-lg p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header Section - Date, Invoice, Amount, Month */}
      <div className="grid grid-cols-4 gap-6 mb-6 pb-2 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Date</h3>
          <p className="text-xs text-gray-700">Jan 14, 2024</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Invoice #</h3>
          <p className="text-xs text-gray-700">INV-2025-Oct</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Amount</h3>
          <p className="text-xs text-gray-700">$2,450.5</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Month</h3>
          <p className="text-xs text-gray-700">October</p>
        </div>
      </div>

      {/* Banking Info and Payment Summary */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Banking Info */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Banking Info</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-xs text-gray-900">Payment Method</span>
              <span className="text-xs text-gray-600">PayPal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-900">Commission Rate</span>
              <span className="text-xs text-gray-600">Fixed (25%)</span>
            </div>
          </div>
          {/* PayPal Account Card */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xs font-semibold text-gray-900">Paypal Account</h3>
                <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">Default</span>
              </div>
              <p className="text-[11px] text-gray-600">suneelpirkash@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Payment Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-xs text-gray-900">Total bookings</span>
              <span className="text-xs text-gray-700">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-900">Gross Revenue</span>
              <span className="text-xs text-gray-700">$ 1,024</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-xs font-semibold text-gray-900">Net Earning</span>
              <span className="text-sm font-bold text-gray-900">$ 760.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button className="w-full py-3 bg-[#CEFAA1] hover:bg-[#CEFAb1] text-gray-900 text-sm font-semibold rounded-xl transition-colors">
        Pay
      </button>
    </div>
  );
};

export default PaymentDetailsCard;


