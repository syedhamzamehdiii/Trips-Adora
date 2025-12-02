import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiMail, 
  FiDownload, 
  FiX,
  FiCopy,
  FiMapPin,
  FiNavigation,
  FiShield,
  FiCheck,
  FiLoader,
  FiCheckCircle
} from 'react-icons/fi';
import CancelBookingModal from './CancelBookingModal';
import ContactCustomerModal from './ContactCustomerModal';
import bookingService from '@/services/bookingService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const BookingDetailsModal = ({ isOpen, onClose, bookingData, onNavigateToBookings, onBookingUpdated }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [fullBookingData, setFullBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationCopied, setLocationCopied] = useState(false);
  const { user } = useAuth();

  // Fetch full booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingData?.id) {
      fetchBookingDetails();
    } else if (isOpen && bookingData) {
      // Use provided booking data if no ID to fetch
      setFullBookingData(bookingData);
    }
  }, [isOpen, bookingData?.id]);

  const fetchBookingDetails = async () => {
    if (!bookingData?.id) return;
    
    setLoading(true);
    try {
      const response = await bookingService.getBookingById(bookingData.id);
      if (response.data) {
        setFullBookingData(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
      // Fallback to provided booking data
      setFullBookingData(bookingData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const booking = fullBookingData || bookingData;
  if (!booking) return null;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  // Format date short
  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(numAmount);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'confirmed' || statusLower === 'completed') {
      return 'bg-green-100 text-green-800';
    } else if (statusLower === 'pending' || statusLower === 'customized') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Get reference code (last 8 chars of ID in uppercase)
  const getReferenceCode = () => {
    if (booking.id) {
      return booking.id.slice(-8).toUpperCase();
    }
    return 'N/A';
  };

  const handleCopyLocation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pickupLocation = booking.pick_up_location || booking.location || '';
    const dropoffLocation = booking.drop_off_location || '';
    
    if (!pickupLocation && !dropoffLocation) {
      toast.info('No location available');
      return;
    }

    let locationText = '';
    if (pickupLocation) {
      locationText = pickupLocation.trim();
    }
    if (dropoffLocation && dropoffLocation.trim() !== pickupLocation.trim()) {
      locationText += locationText ? `\n${dropoffLocation.trim()}` : dropoffLocation.trim();
    }

    if (!locationText) {
      toast.error('No location text to copy');
      return;
    }

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(locationText).then(() => {
        setLocationCopied(true);
        toast.success('Location copied to clipboard!');
        // Reset after 2 seconds
        setTimeout(() => {
          setLocationCopied(false);
        }, 2000);
      }).catch((err) => {
        console.error('Clipboard API error:', err);
        // Fallback to older method
        fallbackCopyToClipboard(locationText);
      });
    } else {
      // Fallback for older browsers
      fallbackCopyToClipboard(locationText);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      
      // For iOS
      if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setLocationCopied(true);
        toast.success('Location copied to clipboard!');
        // Reset after 2 seconds
        setTimeout(() => {
          setLocationCopied(false);
        }, 2000);
      } else {
        toast.error('Failed to copy location. Please select and copy manually.');
      }
    } catch (err) {
      console.error('Fallback copy error:', err);
      toast.error('Failed to copy location. Please select and copy manually.');
    }
  };

  const handleViewOnMap = () => {
    const address = booking.pick_up_location || booking.location || '';
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else {
      toast.info('No location available');
    }
  };

  const handleGetDirections = () => {
    const address = booking.pick_up_location || booking.location || '';
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    } else {
      toast.info('No location available');
    }
  };

  const handleContactCustomer = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const customerEmail = booking?.customer_email || '';
    const supplierEmail = user?.email || '';
    
    if (!customerEmail) {
      toast.error('Customer email not available');
      return;
    }

    if (!supplierEmail) {
      toast.error('Your email is not available. Please ensure you are logged in with Google.');
      return;
    }

    // Open the contact modal
    setShowContactModal(true);
  };

  const handleExport = () => {
    try {
      const exportData = {
        'Reference Code': getReferenceCode(),
        'Booking ID': booking.id,
        'Tour Name': booking.title || booking.tour_name || 'N/A',
        'Customer Name': booking.customer_name || 'N/A',
        'Customer Email': booking.customer_email || 'N/A',
        'Customer Phone': booking.customer_phone || 'N/A',
        'Status': booking.status || 'N/A',
        'Start Date': booking.start_date || 'N/A',
        'End Date': booking.end_date || 'N/A',
        'Total Amount': formatCurrency(booking.total_amount, booking.currency),
        'Travelers': booking.travelers || 'N/A',
        'Package Type': booking.package_type || 'N/A',
        'Pickup Location': booking.pick_up_location || 'N/A',
        'Dropoff Location': booking.drop_off_location || 'N/A',
        'Booking Date': booking.created_at ? formatDateShort(booking.created_at) : 'N/A'
      };

      const csv = Object.entries(exportData)
        .map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`)
        .join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking_${getReferenceCode()}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Booking exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export booking');
    }
  };

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleBookingCancelled = () => {
    setShowCancelModal(false);
    if (onBookingUpdated) {
      onBookingUpdated();
    }
    if (onNavigateToBookings) {
      onNavigateToBookings();
    }
  };

  const status = (booking.status || '').toLowerCase();
  const isCancelled = status === 'cancelled' || status === 'canceled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left - Back Button */}
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Bookings</span>
          </button>

          {/* Center - Title and Status */}
            <div className="flex-1 text-center min-w-[200px]">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h1>
              <div className="flex items-center justify-center space-x-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(booking.status)}`}>
                  {booking.status || 'Unknown'}
              </span>
              <span className="text-sm text-gray-600">
                  Booking ID: {getReferenceCode()}
              </span>
            </div>
          </div>

          {/* Right - Action Buttons */}
            <div className="flex items-center space-x-2 flex-wrap">
            <button
              type="button"
              onClick={handleContactCustomer}
              disabled={!booking?.customer_email || !user?.email}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiMail size={16} />
              <span className="hidden sm:inline">Contact Customer</span>
            </button>
            <button
              onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <FiDownload size={16} />
                <span className="hidden sm:inline">Export</span>
            </button>
              {!isCancelled && (
            <button
              onClick={handleCancelBooking}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FiX size={16} />
                  <span className="hidden sm:inline">Booking cancel</span>
            </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <FiLoader className="animate-spin text-gray-400" size={32} />
            <span className="ml-3 text-gray-600">Loading booking details...</span>
          </div>
        ) : (
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
                        <p className="text-sm text-gray-900 mt-1">{getReferenceCode()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Tour Name</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.title || booking.tour_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">Package Type</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.package_type || 'N/A'}</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Participation Date</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.start_date ? formatDate(booking.start_date) : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Pickup Time</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.start_date ? formatTime(booking.start_date) : 'N/A'}</p>
                      </div>
                      {booking.end_date && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">End Date</span>
                          <p className="text-sm text-gray-900 mt-1">{formatDate(booking.end_date)}</p>
                        </div>
                      )}
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
                        <p className="text-sm text-gray-900 mt-1">{booking.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                        <p className="text-sm text-gray-900 mt-1 break-words">{booking.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contact Number</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.customer_phone || 'N/A'}</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Number of Participants</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {booking.travelers 
                            ? (typeof booking.travelers === 'string' && booking.travelers.toLowerCase().includes('traveler') 
                                ? booking.travelers 
                                : `${booking.travelers} ${parseInt(booking.travelers) === 1 ? 'Traveler' : 'Travelers'}`)
                            : 'N/A'}
                        </p>
                    </div>
                      {booking.destination && (
                    <div>
                          <span className="text-sm font-medium text-gray-500">Destination</span>
                          <p className="text-sm text-gray-900 mt-1">{booking.destination}</p>
                    </div>
                      )}
                      {booking.location && (
                    <div>
                          <span className="text-sm font-medium text-gray-500">Location</span>
                          <p className="text-sm text-gray-900 mt-1">{booking.location}</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Departure Location */}
                {(booking.pick_up_location || booking.location) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Departure Location</h2>
                <div className="space-y-4">
                  <div>
                        <span className="text-sm font-medium text-gray-500">Address</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.pick_up_location || booking.location || 'N/A'}</p>
                  </div>
                      {booking.drop_off_location && booking.drop_off_location !== booking.pick_up_location && (
                  <div>
                          <span className="text-sm font-medium text-gray-500">Drop-off Location</span>
                          <p className="text-sm text-gray-900 mt-1">{booking.drop_off_location}</p>
                  </div>
                      )}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={handleCopyLocation}
                          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                            locationCopied
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {locationCopied ? (
                            <>
                              <FiCheckCircle size={16} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy size={16} />
                              <span>Copy Location</span>
                            </>
                          )}
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
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
                  </div>
                )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Participants</span>
                      <span className="text-sm text-gray-900">
                        {booking.travelers 
                          ? (typeof booking.travelers === 'string' && booking.travelers.toLowerCase().includes('traveler') 
                              ? booking.travelers 
                              : `${booking.travelers} ${parseInt(booking.travelers) === 1 ? 'Traveler' : 'Travelers'}`)
                          : 'N/A'}
                      </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Amount</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(booking.total_amount, booking.currency)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Payment Status</span>
                        <span className={`text-sm font-medium ${
                          status === 'confirmed' || status === 'completed' 
                            ? 'text-green-600' 
                            : status === 'cancelled' || status === 'canceled'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {status === 'confirmed' || status === 'completed' ? 'Paid' : status === 'cancelled' || status === 'canceled' ? 'Cancelled' : 'Pending'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Booking Date</span>
                        <span className="text-sm text-gray-900">{booking.created_at ? formatDateShort(booking.created_at) : 'N/A'}</span>
                      </div>
                      {booking.loyalty_points > 0 && (
                        <div className="flex justify-between mt-2">
                          <span className="text-sm font-medium text-gray-500">Loyalty Points</span>
                          <span className="text-sm text-gray-900">{booking.loyalty_points}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap gap-4">
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
        bookingData={booking}
        onNavigateToBookings={handleBookingCancelled}
      />

      {/* Contact Customer Modal */}
      <ContactCustomerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        bookingData={booking}
        supplierEmail={user?.email || ''}
        supplierName={user?.full_name || user?.business_name || 'Supplier'}
      />
    </div>
  );
};

export default BookingDetailsModal;
