import React from 'react';

const RefundPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancellation & Refund Policy</h1>
            <p className="text-gray-600">Manage your cancellation and refund settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Free Cancellation Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-blue-700 font-medium">
              Free Cancellation until 12:00 PM on mon, Aug 14
            </p>
          </div>

          {/* Refund Schedule */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* 100% Full Refund */}
            <div className="bg-green-100 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">100%</div>
              <div className="text-green-800 font-semibold mb-3">Full Refund</div>
              <div className="text-green-700 text-sm">Before 12:00 PM, Sep 14</div>
            </div>

            {/* 50% Partial Refund */}
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">50%</div>
              <div className="text-blue-800 font-semibold mb-3">Partial Refund</div>
              <div className="text-blue-700 text-sm">Before 12: PM, Aug 15</div>
            </div>

            {/* 25% Small Refund */}
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-yellow-700 mb-2">25%</div>
              <div className="text-yellow-800 font-semibold mb-3">Small Refund</div>
              <div className="text-yellow-700 text-sm">Before 12: PM, Aug 16</div>
            </div>

            {/* 0% No Refund */}
            <div className="bg-red-100 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-700 mb-2">0%</div>
              <div className="text-red-800 font-semibold mb-3">No Refund</div>
              <div className="text-red-700 text-sm">Before 12: PM, Aug 16</div>
            </div>
          </div>

          {/* Important Notes */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Notes</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-1">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg">
                Guests can cancel any time before check-in and receive a ful refund if they cancel at least 24 hours before check-in.
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-1">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg">
                If guests cancel less than 24 hours before check-in, they will not receive a refund
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-1">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg">
                This policy applies to all bookings made after January 4, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#1d236b] text-white rounded-lg hover:bg-[#151a4f] transition-colors font-semibold"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyModal;


