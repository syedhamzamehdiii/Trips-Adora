import React, { useState, useEffect, useRef } from 'react';
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
import productService from '@/services/productService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const BookingDetailsModal = ({ isOpen, onClose, bookingData, onNavigateToBookings, onBookingUpdated }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [fullBookingData, setFullBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationCopied, setLocationCopied] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [loadingResolvedLocation, setLoadingResolvedLocation] = useState(false);
  const { user } = useAuth();

  // Simple in-memory caches (per session) to avoid refetching when opening multiple times
  const bookingCacheRef = useRef({});
  const productCacheRef = useRef({});
  const resolvedLocationCacheRef = useRef({});

  // Fetch full booking details when modal opens (with caching)
  useEffect(() => {
    if (!isOpen) return;

    if (bookingData?.id) {
      const cached = bookingCacheRef.current[bookingData.id];
      if (cached) {
        setFullBookingData(cached);
      } else {
        fetchBookingDetails();
      }
    } else if (bookingData) {
      // Use provided booking data if no ID to fetch
      setFullBookingData(bookingData);
    }
  }, [isOpen, bookingData?.id]);

  // Fetch product details to get real-time pickup/dropoff locations
  useEffect(() => {
    const fetchProductDetails = async () => {
      const booking = fullBookingData || bookingData;
      const productId = booking?.product_id;
      if (!productId) return;

      const cached = productCacheRef.current[productId];
      if (cached) {
        setProductDetails(cached);
        return;
      }

      setLoadingProduct(true);
      try {
        const product = await productService.getProduct(productId);
        if (product) {
          productCacheRef.current[productId] = product;
          setProductDetails(product);
        }
      } catch (err) {
        console.warn('Failed to fetch product details for locations:', err);
      } finally {
        setLoadingProduct(false);
      }
    };

    if (isOpen && (fullBookingData || bookingData)) {
      fetchProductDetails();
    }
  }, [isOpen, fullBookingData?.product_id, bookingData?.product_id]);

  // Fetch resolved location (GPT-fetched location) from product
  useEffect(() => {
    const fetchResolvedLocation = async () => {
      const booking = fullBookingData || bookingData;
      const productId = booking?.product_id;
      if (!productId) return;

      const cached = resolvedLocationCacheRef.current[productId];
      if (cached) {
        setResolvedLocation(cached);
        setLoadingResolvedLocation(false);
        return;
      }

      // First check if product details already have resolved_location (GPT-resolved)
      if (productDetails?.resolved_location && productDetails.resolved_location.trim() && productDetails.resolved_location !== 'N/A') {
        setResolvedLocation(productDetails.resolved_location.trim());
        setLoadingResolvedLocation(false);
        return;
      }

      setLoadingResolvedLocation(true);
      try {
        // Use customer platform API to get resolved location (GPT-fetched location)
        // This endpoint returns the GPT-resolved location used for weather analysis
        const customerApiUrl = import.meta.env.VITE_CUSTOMER_API_BASE_URL || 'http://localhost:8001/api/v1';
        const response = await fetch(`${customerApiUrl}/products/${productId}/resolved-location`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Only use if it's a valid resolved location (not a generic fallback)
          // Prefer destination field which is more specific (e.g., "Mount Fuji, Japan" vs "Tokyo, Japan")
          if (data?.location && data.location.trim() && data.location !== 'N/A') {
            // Check if it's likely a GPT-resolved location (more specific than generic city)
            // If the product has a destination field, prefer that over generic location
            const productDestination = productDetails?.destination;
            if (productDestination && productDestination.trim() && 
                productDestination !== 'N/A' &&
                productDestination.toLowerCase() !== data.location.toLowerCase()) {
              // If destination is more specific (e.g., "Mount Fuji" vs "Tokyo"), use destination
              const value = productDestination.trim();
              resolvedLocationCacheRef.current[productId] = value;
              setResolvedLocation(value);
            } else {
              const value = data.location.trim();
              resolvedLocationCacheRef.current[productId] = value;
              setResolvedLocation(value);
            }
            setLoadingResolvedLocation(false);
            return; // Success, exit early
          }
        }
      } catch (err) {
        console.warn('Failed to fetch resolved location from API:', err);
      }
      
      // Fallback: Prefer product destination (more specific) over generic location
      // Destination should be the actual tour location (e.g., "Mount Fuji, Japan", "Kyoto, Japan")
      // rather than generic pickup city (e.g., "Tokyo, Japan")
      if (productDetails?.destination && productDetails.destination.trim() && productDetails.destination !== 'N/A') {
        const value = productDetails.destination.trim();
        resolvedLocationCacheRef.current[productId] = value;
        setResolvedLocation(value);
      } else if (productDetails?.location && productDetails.location.trim() && productDetails.location !== 'N/A') {
        const value = productDetails.location.trim();
        resolvedLocationCacheRef.current[productId] = value;
        setResolvedLocation(value);
      } else {
        setResolvedLocation(null);
      }
      
      setLoadingResolvedLocation(false);
    };

    if (isOpen && (fullBookingData || bookingData)) {
      if (productDetails) {
        fetchResolvedLocation();
      } else {
        // Wait for product details to load
        const timer = setTimeout(() => {
          if (productDetails) {
            fetchResolvedLocation();
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, fullBookingData?.product_id, bookingData?.product_id, productDetails]);

  const fetchBookingDetails = async () => {
    if (!bookingData?.id) return;
    
    setLoading(true);
    try {
      const response = await bookingService.getBookingById(bookingData.id);
      const data = response?.data || response; // apiService may already unwrap data
      if (data) {
        bookingCacheRef.current[bookingData.id] = data;
        setFullBookingData(data);
      } else {
        setFullBookingData(bookingData);
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

  // Format date helper (accepts Date object or date string)
  const formatDate = (value) => {
    if (!value) return 'N/A';
    try {
      const date = value instanceof Date ? value : new Date(value);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return String(value);
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
    
    const pickup = pickupLocation && pickupLocation !== 'N/A' ? pickupLocation.trim() : '';
    
    if (!pickup) {
      toast.info('No location available');
      return;
    }

    // If dropoffLocation is null or same as pickup, only copy pickup
    // If dropoffLocation exists and is different, copy both
    const dropoff = (dropoffLocation && dropoffLocation.trim() && dropoffLocation.trim() !== pickup) 
      ? dropoffLocation.trim() 
      : null;

    let locationText = pickup;
    if (dropoff) {
      locationText += `\n${dropoff}`;
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
    const address = pickupLocation && pickupLocation !== 'N/A' ? pickupLocation : '';
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else {
      toast.info('No location available');
    }
  };

  const handleGetDirections = () => {
    const address = pickupLocation && pickupLocation !== 'N/A' ? pickupLocation : '';
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
        'Vehicle Name': booking.vehicle || 'N/A',
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

  // Extract pickup and dropoff locations from product details or booking
  const pickupLocation = (() => {
    // Priority 1: From product details pickup_configurations (try to match vehicle from booking)
    if (productDetails?.pickup_dropoff) {
      const pd = productDetails.pickup_dropoff;
      
      // Check pickup_configurations first (most specific)
      if (Array.isArray(pd.pickup_configurations) && pd.pickup_configurations.length > 0) {
        // Try to find config matching the booking vehicle
        const bookingVehicleId = booking.vehicle_id || booking.metadata?.selectedVehicleId;
        let matchingConfig = null;
        
        if (bookingVehicleId) {
          matchingConfig = pd.pickup_configurations.find(c => {
            const configVehicleId = c.vehicle_id || c.vehicle?.id || c.vehicle?._id;
            return configVehicleId && String(configVehicleId) === String(bookingVehicleId);
          });
        }
        
        const config = matchingConfig || pd.pickup_configurations[0];
        
        if (config?.pickup_location) {
          return config.pickup_location.split(',')[0].trim();
        }
      }
      
      // Priority 2: From pickup_dropoff.pickup_location
      if (pd.pickup_location) {
        return pd.pickup_location;
      }
      
      // Priority 3: From pickup_locations array
      if (Array.isArray(pd.pickup_locations) && pd.pickup_locations.length > 0) {
        const loc = pd.pickup_locations[0];
        return typeof loc === 'string' ? loc : (loc.name || loc.address || loc);
      }
    }
    // Priority 4: From booking (only if product details not available)
    return booking.pick_up_location || booking.location || null;
  })();

  const dropoffLocation = (() => {
    // Priority 1: From booking (customer's selected dropoff location)
    const bookingDropoff = booking.drop_off_location || booking.dropOffLocation;
    const bookingPickup = booking.pick_up_location || booking.pickUpLocation || booking.location;
    
    if (bookingDropoff && bookingDropoff.trim() && 
        bookingDropoff.trim() !== (bookingPickup || '').trim()) {
      return bookingDropoff.trim();
    }
    
    // Priority 2: From product details (if booking doesn't have it)
    if (productDetails?.pickup_dropoff) {
      const pd = productDetails.pickup_dropoff;
      
      // Check pickup_configurations first (most specific)
      if (Array.isArray(pd.pickup_configurations) && pd.pickup_configurations.length > 0) {
        // Try to find config matching the booking vehicle
        const bookingVehicleId = booking.vehicle_id || booking.metadata?.selectedVehicleId;
        let matchingConfig = null;
        
        if (bookingVehicleId) {
          matchingConfig = pd.pickup_configurations.find(c => {
            const configVehicleId = c.vehicle_id || c.vehicle?.id || c.vehicle?._id;
            return configVehicleId && String(configVehicleId) === String(bookingVehicleId);
          });
        }
        
        const config = matchingConfig || pd.pickup_configurations[0];
        const configPickupLoc = config?.pickup_location ? config.pickup_location.split(',')[0].trim() : '';
        
        // If dropoff_location exists and is different from pickup_location, use it
        if (config?.dropoff_location && config.dropoff_location.trim() && 
            config.dropoff_location.trim() !== configPickupLoc) {
          return config.dropoff_location.trim();
        }
        // If dropoff_location is same as pickup_location or empty, return null (same location)
        if (configPickupLoc) {
          return null; // Same location - pickup = dropoff
        }
      }
      
      // Check dropoff_location field
      const pdPickupLoc = pd.pickup_location || (Array.isArray(pd.pickup_locations) && pd.pickup_locations.length > 0 
        ? (typeof pd.pickup_locations[0] === 'string' ? pd.pickup_locations[0] : (pd.pickup_locations[0].name || pd.pickup_locations[0].address || pd.pickup_locations[0]))
        : '');
      
      if (pd.dropoff_location && pd.dropoff_location.trim() && 
          pd.dropoff_location.trim() !== pdPickupLoc.trim()) {
        return pd.dropoff_location.trim();
      }
      
      // Check dropoff_locations array
      if (Array.isArray(pd.dropoff_locations) && pd.dropoff_locations.length > 0) {
        const loc = pd.dropoff_locations[0];
        const dropoffLoc = typeof loc === 'string' ? loc.trim() : ((loc.name || loc.address || loc) || '').trim();
        
        if (dropoffLoc && dropoffLoc !== pdPickupLoc.trim()) {
          return dropoffLoc;
        }
        // Same location
        return null;
      }
      
      // If we have pickup_location but no dropoff_location specified, they're the same
      if (pdPickupLoc) {
        return null; // Same location
      }
    }
    
    // If booking dropoff is same as pickup or not specified, return null
    return null;
  })();

  // Extract pickup time from product details
  const pickupTime = (() => {
    // Helper to format time to HH:MM
    const formatTimeString = (timeStr) => {
      if (!timeStr) return null;
      const str = String(timeStr).trim();
      // If already in HH:MM format, return as is
      if (/^\d{1,2}:\d{2}$/.test(str)) {
        const parts = str.split(':');
        const hours = String(parseInt(parts[0], 10)).padStart(2, '0');
        const minutes = String(parseInt(parts[1], 10)).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      // Try to parse other formats
      const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = String(parseInt(timeMatch[1], 10)).padStart(2, '0');
        const minutes = String(parseInt(timeMatch[2], 10)).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return null;
    };

    // Priority 1: From product details pickup_configurations (try to match vehicle from booking)
    if (productDetails?.pickup_dropoff) {
      const pd = productDetails.pickup_dropoff;
      if (Array.isArray(pd.pickup_configurations) && pd.pickup_configurations.length > 0) {
        // Try to find config matching the booking vehicle
        const bookingVehicleId = booking.vehicle_id || booking.metadata?.selectedVehicleId;
        if (bookingVehicleId) {
          const matchingConfig = pd.pickup_configurations.find(c => {
            const configVehicleId = c.vehicle_id || c.vehicle?.id || c.vehicle?._id;
            return configVehicleId && String(configVehicleId) === String(bookingVehicleId);
          });
          if (matchingConfig?.pickup_time) {
            const formatted = formatTimeString(matchingConfig.pickup_time);
            if (formatted) return formatted;
          }
        }
        // Fallback to first config
        if (pd.pickup_configurations[0]?.pickup_time) {
          const formatted = formatTimeString(pd.pickup_configurations[0].pickup_time);
          if (formatted) return formatted;
        }
      }
      // Priority 2: From pickup_dropoff.pickup_time
      if (pd.pickup_time) {
        const formatted = formatTimeString(pd.pickup_time);
        if (formatted) return formatted;
      }
    }
    // Priority 3: From booking metadata (selected time)
    if (booking.metadata?.selectedTime) {
      const formatted = formatTimeString(booking.metadata.selectedTime);
      if (formatted) return formatted;
    }
    // Priority 4: Extract from booking start_date time
    if (booking.start_date) {
      try {
        const date = new Date(booking.start_date);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      } catch (e) {
        console.warn('Failed to extract time from start_date:', e);
      }
    }
    return 'N/A';
  })();

  // Calculate participation date and end date based on selected tour date + product duration
  const { participationDate, endDate } = (() => {
    // 1) Base date should be the tour date the customer selected (not shifted by timezones)
    const resolveBaseDate = () => {
      const label =
        booking.tour_date ||
        booking.tourDate ||
        booking.tour_date_label ||
        booking.tourDateLabel;

      if (label) {
        const d = new Date(label);
        if (!isNaN(d.getTime())) {
          // Strip time part so it is always midnight local on the correct calendar day
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }

      if (booking.start_date) {
        const d = new Date(booking.start_date);
        if (!isNaN(d.getTime())) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }

      return null;
    };

    const baseDate = resolveBaseDate();
    if (!baseDate) {
      return { participationDate: 'N/A', endDate: 'N/A' };
    }

    // 2) Parse duration from product (how many days the tour lasts)
    let durationDays = 1; // Default to 1 day trip
    if (productDetails?.duration) {
      const durationStr = String(productDetails.duration).trim().toLowerCase();
      const dayMatch = durationStr.match(/(\d+)\s*(?:day|days|d)\b/i);
      const hourMatch = durationStr.match(/(\d+)\s*(?:hour|hours|h)\b/i);

      if (dayMatch) {
        durationDays = parseInt(dayMatch[1], 10) || 1;
      } else if (hourMatch) {
        const hours = parseInt(hourMatch[1], 10) || 0;
        // Any hour-based duration (<24h or >24h) is treated as same-day or a small multi-day tour.
        durationDays = hours >= 24 ? Math.min(Math.ceil(hours / 24), 30) : 1;
      }
      // If there is no clear "day" or "hour" unit, we keep default = 1 day
    }

    // 3) Participation date is always the first day of the tour
    const participation = new Date(baseDate);

    // 4) End date is the last day of the tour
    const end = new Date(baseDate);
    if (durationDays > 1) {
      // e.g. 3 days: 17,18,19 → end = base + 2
      end.setDate(end.getDate() + (durationDays - 1));
    }

    return {
      participationDate: participation,
      endDate: end,
    };
  })();

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
                        <span className="text-sm font-medium text-gray-500">Vehicle Name</span>
                        <p className="text-sm text-gray-900 mt-1">{booking.vehicle || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Participation Date</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {loadingProduct
                            ? 'Loading...'
                            : formatDate(participationDate)}
                        </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Pickup Time</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {loadingProduct ? 'Loading...' : (pickupTime !== 'N/A' ? pickupTime : (booking.start_date ? formatTime(booking.start_date) : 'N/A'))}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">End Date</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {loadingProduct
                            ? 'Loading...'
                            : formatDate(endDate)}
                        </p>
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
                    <div>
                      <span className="text-sm font-medium text-gray-500">Destination</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {loadingResolvedLocation ? 'Loading...' : (
                          resolvedLocation || 
                          productDetails?.destination || 
                          productDetails?.location || 
                          booking.destination || 
                          'N/A'
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {booking.customer_country 
                          || booking.customerCountry 
                          || booking.metadata?.customer_country 
                          || booking.metadata?.country 
                          || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departure Location */}
                {(pickupLocation && pickupLocation !== 'N/A') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Departure Location</h2>
                <div className="space-y-4">
                  <div>
                        <span className="text-sm font-medium text-gray-500">Pickup Location</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {loadingProduct ? 'Loading...' : pickupLocation}
                        </p>
                  </div>
                      {/* Always show dropoff location - if null, it means same as pickup */}
                  <div>
                          <span className="text-sm font-medium text-gray-500">Drop-off Location</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {loadingProduct ? 'Loading...' : (
                              dropoffLocation && dropoffLocation.trim() !== pickupLocation.trim() 
                                ? dropoffLocation 
                                : pickupLocation + ' (Same as pickup)'
                            )}
                          </p>
                  </div>
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Total Amount</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.metadata?.originalAmount &&
                      !Number.isNaN(Number(booking.metadata.originalAmount)) &&
                      Number(booking.metadata.originalAmount) > Number(booking.total_amount || 0) ? (
                        <>
                          <span className="text-gray-400 line-through mr-2">
                            {formatCurrency(Number(booking.metadata.originalAmount), booking.currency)}
                          </span>
                          <span>{formatCurrency(booking.total_amount, booking.currency)}</span>
                        </>
                      ) : (
                        formatCurrency(booking.total_amount, booking.currency)
                      )}
                    </span>
                  </div>
                  {booking.metadata?.couponCode &&
                    !Number.isNaN(Number(booking.metadata.discountAmount)) &&
                    Number(booking.metadata.discountAmount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Coupon Used</span>
                        <span className="text-sm text-gray-900">
                          {booking.metadata.couponCode}{' '}
                          (
                          -
                          {formatCurrency(
                            Number(booking.metadata.discountAmount),
                            booking.currency
                          )}
                          )
                        </span>
                      </div>
                    )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
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
                      {(booking.metadata?.cancellation_reason || booking.cancellation_reason) && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
                          <div className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">
                            Cancellation Reason
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {booking.metadata?.cancellation_reason || booking.cancellation_reason}
                          </p>
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
