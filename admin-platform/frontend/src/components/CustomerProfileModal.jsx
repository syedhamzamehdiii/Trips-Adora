import React, { useEffect } from 'react';

const CustomerProfileModal = ({ isOpen, onClose, customer, position }) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  const bookings = [
    { id: 1, name: 'Mount fuji Day trip', date: 'Oct 24, 2025', status: 'Completed' },
    { id: 2, name: 'Mount fuji Day trip', date: 'Oct 24, 2025', status: 'Completed' },
    { id: 3, name: 'Mount fuji Day trip', date: 'Oct 24, 2025', status: 'Completed' },
  ];

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 50,
    width: '480px',
    maxWidth: '80vw',
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        />
      )}
      {isOpen && (
        <div
          className="bg-white rounded-xl shadow-xl border border-gray-300 max_h-[72vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ ...modalStyle, fontFamily: 'Poppins, sans-serif' }}
        >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Customer Profile</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Customer Information */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: '#1B3166' }}
            >
              {customer.initial}
            </div>
            {/* Customer Details */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{customer.name}</h3>
              <p className="text-[11px] text-gray-600 mb-0.5">{customer.email}</p>
              <p className="text-[10px] font-medium" style={{ color: '#77FFAA' }}>
                Customer ID: {customer.customerId || 'CTA-00568'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Total Bookings */}
            <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
              <div className="text-lg font-bold text-gray-900 mb-0.5">18</div>
              <div className="text-[10px] text-gray-500">Total Bookings</div>
            </div>
            {/* Reviews */}
            <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
              <div className="text-lg font-bold text-gray-900 mb-0.5">4.9</div>
              <div className="text-[10px] text-gray-500">Reviews</div>
            </div>
            {/* Total Spending */}
            <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
              <div className="text-lg font-bold text-gray-900 mb-0.5">$2.3k</div>
              <div className="text-[10px] text-gray-500">Total spending</div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Booking history</h3>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-2.5 px-3 py-1.5 border border-gray-300 rounded-[10px] bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-[13px] text-gray-900 truncate">{booking.name}</div>
                    <div className="text-[10px] text-gray-600 mr-2">$850</div>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5 flex items-center gap-2.5">
                    <span>Tour ways</span>
                    <span className="opacity-70">{booking.date}</span>
                    <span className="opacity-70">#TA-1002484</span>
                  </div>
                </div>
                <button
                  className="px-3 py-1.5 rounded-full text-white text-[11px] font-medium"
                  style={{ backgroundColor: '#1B3166' }}
                >
                  {booking.status}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Message box and action */}
        <div className="px-4 py-3">
          <textarea
            className="w-full h-24 border border-gray-300 rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#1B3166] resize-none"
            placeholder="Write your message..."
            aria-label="Message"
          />
          <div className="mt-2.5 flex justify-center">
            <button
              className="px-6 py-1.5 rounded-full text-white font-medium text-[13px]"
              style={{ backgroundColor: '#1B3166' }}
              onClick={onClose}
            >
              Send Message
            </button>
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default CustomerProfileModal;

