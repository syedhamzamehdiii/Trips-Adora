import React, { useState } from 'react';
import { 
  FiArrowLeft, 
  FiMail, 
  FiDownload, 
  FiX,
  FiCopy,
  FiMapPin,
  FiNavigation,
  FiShield,
  FiCheck
} from 'react-icons/fi';
import CancelBookingModal from './CancelBookingModal';

const BookingDetailsModal = ({ isOpen, onClose, bookingData }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!isOpen) return null;

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(bookingData?.departureLocation?.address || '');
    alert('Location copied to clipboard!');
  };

  const handleViewOnMap = () => {
    // Open map functionality would go here
    console.log('View on map');
  };

  const handleGetDirections = () => {
    // Get directions functionality would go here
    console.log('Get directions');
  };

  const handleContactCustomer = () => {
    // Contact customer functionality would go here
    console.log('Contact customer');
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Export booking');
  };

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {/* Left - Back Button */}
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Bookings</span>
          </button>

          {/* Center - Title and Status */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h1>
            <div className="flex items-center justify-center space-x-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Confirmed
              </span>
              <span className="text-sm text-gray-600">
                Booking ID: {bookingData?.bookingId || 'BK-0104-123'}
              </span>
            </div>
          </div>

          {/* Right - Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleContactCustomer}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiMail size={16} />
              <span>Contact Customer</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiDownload size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={handleCancelBooking}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiX size={16} />
              <span>Booking cancel</span>
            </button>
            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">i</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Reference Code</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.referenceCode || 'BK-0104-123'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Tour Name</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.tourName || 'Mount Fuji Day Trip with Lake Kawaguchi'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Option Name</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.optionName || 'Premium Package - Private Guide'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Participation Date</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.participationDate || 'Wednesday, February 14, 2024'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Pickup Time</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.pickupTime || '08:00'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Full Name</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.customerName || 'Sarah Johnson'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.customerEmail || 'sarah.johnson@email.com'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contact Number</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.contactNumber || '+91-555-0123'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Number of Participants</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.participants || '4'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Country</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.country || 'India'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Preferred Language</span>
                      <p className="text-sm text-gray-900 mt-1">{bookingData?.preferredLanguage || 'Hindi'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departure Location */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Departure Location</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location Name</span>
                    <p className="text-sm text-gray-900 mt-1">{bookingData?.departureLocation?.name || 'Tokyo Station Marunouchi Central Exit'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Address</span>
                    <p className="text-sm text-gray-900 mt-1">{bookingData?.departureLocation?.address || '1 Chome Marunouchi, Chiyoda City, Tokyo 100-0005, Japan'}</p>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleCopyLocation}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <FiCopy size={16} />
                      <span>Copy Location</span>
                    </button>
                    <button
                      onClick={handleViewOnMap}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <FiMapPin size={16} />
                      <span>View on Map</span>
                    </button>
                    <button
                      onClick={handleGetDirections}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <FiNavigation size={16} />
                      <span>Get Directions</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Participants</span>
                    <span className="text-sm text-gray-900">{bookingData?.participants || '4'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Cost</span>
                    <span className="text-sm text-gray-900">{bookingData?.cost || '$121'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Amount</span>
                    <span className="text-sm text-gray-900">{bookingData?.totalAmount || '$121'}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Payment Status</span>
                      <span className="text-sm text-green-600 font-medium">{bookingData?.paymentStatus || 'Paid'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Booking Date</span>
                      <span className="text-sm text-gray-900">{bookingData?.bookingDate || '11/01/2024'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <FiShield size={16} />
              <span>Protected by cancellation policy</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiCheck size={16} />
              <span>Customer Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      <CancelBookingModal 
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        bookingData={bookingData}
      />
    </div>
  );
};

export default BookingDetailsModal;
