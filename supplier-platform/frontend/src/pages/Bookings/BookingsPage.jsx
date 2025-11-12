import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiPlus,
  FiShare2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/common/Footer';
import ShareTripModal from '@/components/modals/ShareTripModal';
import BookingDetailsModal from '@/components/modals/BookingDetailsModal';
import bookingService from '@/services/bookingService';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    productName: '',
    travelDateStart: '',
    travelDateEnd: '',
    purchaseDateStart: '',
    purchaseDateEnd: '',
    referenceCode: '',
    status: 'All Status'
  });

  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({ total: 0, by_status: {}, total_revenue: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Normalize booking data from API to match frontend format
  const normalizeBooking = useCallback((booking) => {
    return {
      id: booking.id,
      bookingId: booking.id,
      productId: booking.product_id,
      booking: booking.title || booking.tour_name,
      customerName: booking.customer_name || 'Guest',
      customerEmail: booking.customer_email || '',
      bookedOn: booking.created_at ? new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      travelDate: booking.start_date ? new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      status: booking.status || 'pending',
      amount: booking.total_amount || 0,
      currency: booking.currency || 'USD',
      referenceCode: booking.id?.slice(-8).toUpperCase() || 'N/A',
      ...booking
    };
  }, []);

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Normalize status filter - handle "Cancelled" vs "cancelled"
      let statusFilter = filters.status !== 'All Status' ? filters.status : null;
      if (statusFilter && (statusFilter.toLowerCase() === 'cancelled' || statusFilter.toLowerCase() === 'canceled')) {
        statusFilter = 'cancelled'; // Normalize to lowercase for API
      }
      const response = await bookingService.getBookings({
        status: statusFilter,
        limit: 500, // Get all bookings, frontend will paginate
        skip: 0
      });
      
      const bookingsList = Array.isArray(response?.bookings) ? response.bookings : [];
      const normalized = bookingsList.map(normalizeBooking);
      setBookings(normalized);
      
      if (response?.stats) {
        setBookingStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, normalizeBooking]);

  // Load bookings on mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Listen for booking updates
  useEffect(() => {
    const handleUpdate = () => fetchBookings();
    window.addEventListener('supplier_bookings_updated', handleUpdate);
    return () => window.removeEventListener('supplier_bookings_updated', handleUpdate);
  }, [fetchBookings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBookings();
      setCurrentPage(1);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        // Note: Delete functionality would require a DELETE endpoint
        // For now, just remove from local state
        const updated = bookings.filter(b => b.id !== bookingId);
        setBookings(updated);
        window.dispatchEvent(new Event('supplier_bookings_updated'));
      } catch (e) {
        console.error('Error deleting booking:', e);
      }
    }
  };

  const parsedAmount = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    return 0;
  };

  // Parse date string to Date object (handles various formats)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing formats like "Jan 13, 2024"
      const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      const parts = dateStr.toLowerCase().replace(',', '').split(' ');
      if (parts.length === 3 && months[parts[0]]) {
        return new Date(parseInt(parts[2]), months[parts[0]], parseInt(parts[1]));
      }
      return null;
    }
    return date;
  };

  const getDateRange = (type, start, end) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let startDate = null;
    let endDate = null;

    if (start === 'today') startDate = new Date(today);
    else if (start === 'tomorrow' || start === 'yesterday') {
      const d = new Date(today);
      d.setDate(d.getDate() + (start === 'tomorrow' ? 1 : -1));
      startDate = d;
    }
    else if (start === 'this-week') startDate = new Date(weekStart);

    if (end === 'today') endDate = new Date(today);
    else if (end === 'tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      endDate = d;
    }
    else if (end === 'this-week') endDate = new Date(weekEnd);

    return { startDate, endDate };
  };

  const matchesFilters = (b) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const hay = `${b.referenceCode || ''} ${b.booking || ''} ${b.customerName || ''} ${b.customerEmail || ''} ${b.productId || ''}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    
    if (filters.status !== 'All Status') {
      const bookingStatus = (b.status || '').trim().toLowerCase();
      const filterStatus = filters.status.toLowerCase();
      // Handle both "Cancelled" and "cancelled" variations
      if (filterStatus === 'cancelled' || filterStatus === 'canceled') {
        if (bookingStatus !== 'cancelled' && bookingStatus !== 'canceled') return false;
      } else {
        if (bookingStatus !== filterStatus) return false;
      }
    }
    
    if (filters.productName && !String(b.booking || '').toLowerCase().includes(filters.productName.toLowerCase())) return false;
    if (filters.referenceCode && !String(b.referenceCode || '').toLowerCase().includes(filters.referenceCode.toLowerCase())) return false;
    
    // Travel date filter
    const travelDateRange = getDateRange('travel', filters.travelDateStart, filters.travelDateEnd);
    if (travelDateRange.startDate || travelDateRange.endDate) {
      const travelDate = parseDate(b.travelDate);
      if (!travelDate) return false;
      travelDate.setHours(0, 0, 0, 0);
      if (travelDateRange.startDate && travelDate < travelDateRange.startDate) return false;
      if (travelDateRange.endDate && travelDate > travelDateRange.endDate) return false;
    }
    
    // Purchase/booked date filter
    const purchaseDateRange = getDateRange('purchase', filters.purchaseDateStart, filters.purchaseDateEnd);
    if (purchaseDateRange.startDate || purchaseDateRange.endDate) {
      const bookedDate = parseDate(b.bookedOn);
      if (!bookedDate) return false;
      bookedDate.setHours(0, 0, 0, 0);
      if (purchaseDateRange.startDate && bookedDate < purchaseDateRange.startDate) return false;
      if (purchaseDateRange.endDate && bookedDate > purchaseDateRange.endDate) return false;
    }
    
    return true;
  };

  const filtered = bookings.filter(matchesFilters);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filtered.slice(startIndex, endIndex);

  // Stats derived from API stats or calculated from bookings
  const allBookingStats = {
    total: bookingStats.total || bookings.length,
    upcoming: (bookingStats.by_status?.confirmed || 0) + 
              (bookingStats.by_status?.pending || 0) + 
              (bookingStats.by_status?.customized || 0),
    refundDispute: 0, // Not tracked in current schema
    cancelled: bookingStats.by_status?.cancelled || 0
  };

  const bookingStatsCards = [
    { number: String(allBookingStats.total).padStart(2, '0'), label: 'Total Bookings' },
    { number: String(allBookingStats.upcoming).padStart(2, '0'), label: 'Upcoming Trips' },
    { number: String(allBookingStats.refundDispute).padStart(2, '0'), label: 'Refund/Dispute' },
    { number: String(allBookingStats.cancelled).padStart(2, '0'), label: 'Cancelled' }
  ];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExport = () => {
    try {
      const rows = [];
      rows.push(['Reference Code','Product ID','Booking','Customer Name','Customer Email','Booked On','Travel Date','Status','Amount'].join(','));
      filtered.forEach(b => {
        const safe = (v) => `"${String(v ?? '').replace(/"/g,'""')}"`;
        rows.push([
          safe(b.referenceCode),
          safe(b.productId),
          safe(b.booking),
          safe(b.customerName),
          safe(b.customerEmail),
          safe(b.bookedOn),
          safe(b.travelDate),
          safe(b.status),
          safe(parsedAmount(b.amount))
        ].join(','));
      });
      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export bookings:', e);
    }
  };

  const handleShareTrip = (trip) => {
    setSelectedTrip(trip);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSelectedTrip(null);
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
  };

  const handleNavigateToBookings = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
    // Already on bookings page, just close the modal
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Bookings Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">YOUR BOOKINGS</h1>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload size={16} />
            <span>Export Bookings</span>
          </button>
          <button 
            onClick={() => navigate('/products/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={16} />
            <span>Create New Product</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {bookingStatsCards.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 text-gray-600 hover:text-gray-900 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh bookings"
          >
            <FiRefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Filter bookings"
          >
            <FiFilter size={20} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading bookings...</div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">{error}</div>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Bookings Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name of Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booked on
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No bookings found</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewBookingDetails(booking)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.referenceCode}</div>
                    <div className="text-sm text-gray-500">{booking.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.booking}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.bookedOn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.travelDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (booking.status || '').trim() === 'Confirmed' || (booking.status || '').trim() === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : (booking.status || '').trim() === 'Pending' || (booking.status || '').trim() === 'Upcoming'
                        ? 'bg-yellow-100 text-yellow-800'
                        : (booking.status || '').trim().toLowerCase() === 'cancelled' || (booking.status || '').trim().toLowerCase() === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : (booking.status || '').trim() === 'Refund/Dispute' || (booking.status || '').trim() === 'Refund' || (booking.status || '').trim() === 'Dispute'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareTrip(booking);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Share booking"
                      >
                        <FiShare2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBooking(booking.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete booking"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 transition-colors ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiChevronLeft size={16} />
            </button>
            {(() => {
              const pages = getPageNumbers();
              return pages.map((page, idx) => {
                // Show ellipsis if there's a gap
                if (idx > 0 && pages[idx - 1] !== page - 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 transition-colors ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {currentPage}/{totalPages}
            </span>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Here"
                  value={filters.productName}
                  onChange={(e) => setFilters({...filters, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* By Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  By Date
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Travel Date</label>
                    <div className="flex space-x-2">
                      <select
                        value={filters.travelDateStart}
                        onChange={(e) => setFilters({...filters, travelDateStart: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Start</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                      </select>
                      <select
                        value={filters.travelDateEnd}
                        onChange={(e) => setFilters({...filters, travelDateEnd: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">End</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date of Purchase</label>
                    <div className="flex space-x-2">
                      <select
                        value={filters.purchaseDateStart}
                        onChange={(e) => setFilters({...filters, purchaseDateStart: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Start</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this-week">This Week</option>
                      </select>
                      <select
                        value={filters.purchaseDateEnd}
                        onChange={(e) => setFilters({...filters, purchaseDateEnd: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">End</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this-week">This Week</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Code
                </label>
                <input
                  type="text"
                  placeholder="Enter Here"
                  value={filters.referenceCode}
                  onChange={(e) => setFilters({...filters, referenceCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Status">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFilterModal(false);
                  setCurrentPage(1); // Reset to first page when filters applied
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Share Trip Modal */}
      <ShareTripModal 
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        tripData={selectedTrip}
      />

      {/* Booking Details Modal */}
        <BookingDetailsModal 
          isOpen={showBookingDetails}
          onClose={handleCloseBookingDetails}
          bookingData={selectedBooking}
          onNavigateToBookings={handleNavigateToBookings}
        />

      <Footer />
    </div>
  );
};

export default BookingsPage;