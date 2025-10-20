import React from 'react';
import { 
  FiCheck,
  FiArrowLeft
} from 'react-icons/fi';

const CancelSuccessModal = ({ isOpen, onClose, onReturnToBookings }) => {
  if (!isOpen) return null;

  const handleReturnToBookings = () => {
    onReturnToBookings();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Success Message Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck size={32} className="text-white" />
          </div>

          {/* Success Message */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Congratulations!
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your booking has been successfully cancelled. Click continue to return to the bookings.
            </p>
          </div>

          {/* Return Button */}
          <button
            onClick={handleReturnToBookings}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to the Bookings
          </button>
        </div>

        {/* Policy Warning */}
        <div className="px-6 py-4">
          <p className="text-xs text-red-600 text-center">
            Exceeding 5 monthly cancellations will result in temporary account suspension and mandatory review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelSuccessModal;
