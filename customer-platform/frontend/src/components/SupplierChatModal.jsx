import React, { useState } from 'react';
import { X, MessageSquareText, Star, ShieldCheck, UsersRound } from 'lucide-react';
import { sendMessage } from '../services/chatService';

const SupplierChatModal = ({ isOpen, onClose, supplierName, supplierId, supplierRating, supplierReviews, supplierFollowers, supplierVerified, productId, customerId }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    if (!supplierId) {
      setError('Supplier information is missing');
      return;
    }

    // Get customer ID from localStorage or use default
    const customerIdToUse = customerId || localStorage.getItem('customer_profile_user_id') || 'default-customer';
    
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await sendMessage(customerIdToUse, supplierId, message.trim(), productId);
      setSuccess(true);
      setMessage('');
      
      // Close modal after 1 second
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <MessageSquareText className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Contact {supplierName || 'Supplier'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-4 pt-2 pb-4 border-b">
          <p className="text-sm text-gray-600">
            Send a message to the Supplier. They typically respond within 2 hours.
          </p>
        </div>

        {/* Supplier Info Card */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {supplierName ? supplierName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{supplierName || 'Supplier'}</h3>
                {supplierVerified && (
                  <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              {supplierRating && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {supplierRating}
                  </span>
                  {supplierReviews && (
                    <span className="text-sm text-gray-500">
                      ({supplierReviews} Reviews)
                    </span>
                  )}
                </div>
              )}
              {supplierFollowers && (
                <div className="flex items-center gap-1">
                  <UsersRound className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {supplierFollowers.toLocaleString()} followers
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Messages
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in this tour. Can you provide more details..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-200">
            <p className="text-sm text-green-600">Message sent successfully!</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MessageSquareText className="w-5 h-5" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierChatModal;

