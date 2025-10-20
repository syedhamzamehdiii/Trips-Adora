import React from 'react';
import { 
  FiCheck
} from 'react-icons/fi';

const CancelSuccessModal = ({ isOpen, onClose, onReturnToBookings }) => {
  if (!isOpen) return null;

  const handleReturnToBookings = () => {
    onReturnToBookings();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-gray-200">
        {/* Success Message Card */}
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck size={32} className="text-white" />
          </div>

          {/* Success Message */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Congratulations!
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed text-left">
              Your booking has been successfully cancelled. Click continue to return to the bookings.
            </p>
          </div>

          {/* Return Button */}
          <button
            onClick={handleReturnToBookings}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to the Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSuccessModal;
