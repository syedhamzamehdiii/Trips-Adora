import React, { useState } from 'react';
import { 
  FiX, 
  FiChevronDown,
  FiAlertTriangle,
  FiLoader
} from 'react-icons/fi';
import CancelSuccessModal from './CancelSuccessModal';
import DivertSupplierModal from './DivertSupplierModal';
import bookingService from '@/services/bookingService';
import { toast } from 'react-toastify';

const CancelBookingModal = ({ isOpen, onClose, bookingData, onNavigateToBookings }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDivertModal, setShowDivertModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!isOpen) return null;

  const cancellationReasons = [
    'Weather conditions',
    'Customer request',
    'Operational issue',
    'Unforeseen circumstances',
    'Insufficient participants',
    'Equipment failure',
    'Staff unavailability',
    'Other (Specify below)'
  ];

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    setShowReasonDropdown(false);
    if (reason === 'Other (Specify below)') {
      setCustomReason('');
    }
  };

  const handleKeepBooking = () => {
    onClose();
  };

  const handleDivertToSupplier = () => {
    setShowDivertModal(true);
  };

  const handleDivertSuccess = () => {
    setShowDivertModal(false);
    onClose();
    if (onNavigateToBookings) {
      onNavigateToBookings();
    }
  };

  const handleSendCancelRequest = async () => {
    if (!selectedReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    if (selectedReason === 'Other (Specify below)' && !customReason.trim()) {
      toast.error('Please specify the cancellation reason');
      return;
    }

    if (!bookingData?.id) {
      toast.error('Booking ID not found');
      return;
    }

    setIsCancelling(true);
    try {
      const reason = selectedReason === 'Other (Specify below)' 
        ? customReason.trim() 
        : selectedReason;
      
      await bookingService.cancelBooking(bookingData.id, reason);
      
    setShowSuccessModal(true);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Get reference code
  const getReferenceCode = () => {
    if (bookingData?.id) {
      return bookingData.id.slice(-8).toUpperCase();
    }
    return bookingData?.referenceCode || 'N/A';
  };

  // Get customer name
  const getCustomerName = () => {
    return bookingData?.customer_name || bookingData?.customerName || 'N/A';
  };

  // Get tour name
  const getTourName = () => {
    return bookingData?.title || bookingData?.tour_name || bookingData?.tourName || 'N/A';
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleReturnToBookings = () => {
    setShowSuccessModal(false);
    onClose(); // Close the cancel modal
    if (onNavigateToBookings) {
      onNavigateToBookings(); // Navigate to bookings page
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <FiAlertTriangle size={24} className="text-red-500" />
          <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900">Reference Code</span>
                <p className="text-sm text-gray-900 mt-1">{getReferenceCode()}</p>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900">Customer Name</span>
                <p className="text-sm text-gray-900 mt-1">{getCustomerName()}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">Product Name</span>
              <p className="text-sm text-gray-900 mt-1">{getTourName()}</p>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">
              Select Cancellation Reason *
            </label>
            
            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className={selectedReason ? 'text-gray-900' : 'text-gray-500 font-semibold'}>
                  {selectedReason || 'Select Reason'}
                </span>
                <FiChevronDown size={16} className="text-gray-500" />
              </button>

              {showReasonDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {cancellationReasons.map((reason, index) => (
                    <button
                      key={index}
                      onClick={() => handleReasonSelect(reason)}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Reason Input */}
            {selectedReason === 'Other (Specify below)' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please specify the reason..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FiAlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-2">Important:</h3>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• After 3 cancellations in a month your listing will lose 'Featured' status for 30 days.</li>
                  <li>• Each cancellation may trigger an automatic penalty fee of 5% deducted from your next payout.</li>
                  <li>• Exceeding 5 monthly cancellations will result in temporary account suspension and mandatory review.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleKeepBooking}
              className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Keep Booking
            </button>
            <button
              onClick={handleDivertToSupplier}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Divert to other Supplier
            </button>
            <button
              onClick={handleSendCancelRequest}
              disabled={isCancelling}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isCancelling ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Send Cancel Request to Admin</span>
              )}
            </button>
        </div>
      </div>

      {/* Cancel Success Modal */}
      <CancelSuccessModal 
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onReturnToBookings={handleReturnToBookings}
      />

      {/* Divert Supplier Modal */}
      <DivertSupplierModal
        isOpen={showDivertModal}
        onClose={() => setShowDivertModal(false)}
        bookingData={bookingData}
        onSuccess={handleDivertSuccess}
      />
    </div>
  );
};

export default CancelBookingModal;
