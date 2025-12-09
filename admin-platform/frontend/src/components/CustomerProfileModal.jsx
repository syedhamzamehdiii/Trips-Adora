import React, { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';

const CustomerProfileModal = ({ isOpen, onClose, customer, position }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch customer details when modal opens
  useEffect(() => {
    if (isOpen && customer?.id) {
      fetchCustomerDetails();
    } else {
      setCustomerDetails(null);
      setMessage('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, customer?.id]);

  const fetchCustomerDetails = async () => {
    if (!customer?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomerDetails(customer.id);
      setCustomerDetails(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !customer?.id) return;

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await customerService.sendMessageToCustomer(
        customer.id,
        message.trim(),
        'Admin'
      );
      setSuccess(true);
      setMessage('');
      
      // Show success message and close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

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

  const formatCurrency = (amount) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

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
          className="bg-white rounded-xl shadow-xl border border-gray-300 max-h-[72vh] overflow-y-auto"
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

          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500">Loading customer details...</div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-red-500">{error}</div>
          ) : customerDetails ? (
            <>
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                      {customerDetails.customer.name || customer.name}
                    </h3>
                    <p className="text-[11px] text-gray-600 mb-0.5">
                      {customerDetails.customer.email || customer.email}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: '#77FFAA' }}>
                      Customer ID: {customerDetails.customer.customer_id || customer.customerId || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Statistics */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Total Bookings */}
                  <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
                    <div className="text-lg font-bold text-gray-900 mb-0.5">
                      {customerDetails.stats.total_bookings || 0}
                    </div>
                    <div className="text-[10px] text-gray-500">Total Bookings</div>
                  </div>
                  {/* Reviews */}
                  <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
                    <div className="text-lg font-bold text-gray-900 mb-0.5">
                      {customerDetails.stats.avg_rating || 0}
                    </div>
                    <div className="text-[10px] text-gray-500">Reviews</div>
                  </div>
                  {/* Total Spending */}
                  <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
                    <div className="text-lg font-bold text-gray-900 mb-0.5">
                      {formatCurrency(customerDetails.stats.total_spending || 0)}
                    </div>
                    <div className="text-[10px] text-gray-500">Total spending</div>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Booking history</h3>
                {customerDetails.bookings && customerDetails.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {customerDetails.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-2.5 px-3 py-1.5 border border-gray-300 rounded-[10px] bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-[13px] text-gray-900 truncate">
                              {booking.title}
                            </div>
                            <div className="text-[10px] text-gray-600 mr-2">
                              {formatCurrency(booking.amount)}
                            </div>
                          </div>
                          <div className="text-[9px] text-gray-500 mt-0.5 flex items-center gap-2.5">
                            <span>Tour ways</span>
                            <span className="opacity-70">{booking.date}</span>
                            <span className="opacity-70">{booking.booking_ref}</span>
                          </div>
                        </div>
                        <button
                          className={`px-3 py-1.5 rounded-full text-white text-[11px] font-medium ${
                            booking.status.toLowerCase() === 'confirmed' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : booking.status.toLowerCase() === 'cancelled' || booking.status.toLowerCase() === 'canceled'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {booking.status}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">No bookings found</div>
                )}
              </div>

              {/* Message box and action */}
              <div className="px-4 py-3">
                {success && (
                  <div className="mb-2 text-sm text-green-600 text-center">
                    Message sent successfully!
                  </div>
                )}
                {error && (
                  <div className="mb-2 text-sm text-red-600 text-center">
                    {error}
                  </div>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-24 border border-gray-300 rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#1B3166] resize-none"
                  placeholder="Write your message..."
                  aria-label="Message"
                  disabled={sending}
                />
                <div className="mt-2.5 flex justify-center">
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className={`px-6 py-1.5 rounded-full text-white font-medium text-[13px] ${
                      sending || !message.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:opacity-90'
                    }`}
                    style={{ backgroundColor: '#1B3166' }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">No customer data available</div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerProfileModal;
