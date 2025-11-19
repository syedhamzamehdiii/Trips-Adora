import React from 'react';
import PaymentDetailsCard from './PaymentDetailsCard';

const PaymentDetailsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-h-[75vh] overflow-auto p-3">
          <button
            type="button"
            aria-label="Close"
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
            onClick={onClose}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <PaymentDetailsCard />
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;


