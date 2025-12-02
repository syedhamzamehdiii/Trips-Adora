import { apiService } from './api';

const BASE_PATH = '/bookings';

export const bookingService = {
  /**
   * Get all bookings for the authenticated supplier
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by booking status
   * @param {number} params.limit - Maximum number of bookings
   * @param {number} params.skip - Number of bookings to skip
   */
  async getBookings(params = {}) {
    const { status, limit = 100, skip = 0 } = params;
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('limit', limit.toString());
    queryParams.append('skip', skip.toString());
    
    const url = `${BASE_PATH}?${queryParams.toString()}`;
    return apiService.get(url);
  },

  /**
   * Get booking statistics
   */
  async getBookingStats() {
    return apiService.get(`${BASE_PATH}/stats`);
  },

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - Booking ID
   */
  async getBookingById(bookingId) {
    return apiService.get(`${BASE_PATH}/${bookingId}`);
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   */
  async cancelBooking(bookingId, reason) {
    return apiService.post(`${BASE_PATH}/${bookingId}/cancel`, { reason });
  },

  /**
   * Divert booking to another supplier
   * @param {string} bookingId - Booking ID
   * @param {string} recipientEmail - Email of the supplier to divert to
   * @param {string} recipientName - Name of the supplier
   * @param {string} reason - Reason for diversion
   */
  async divertBooking(bookingId, recipientEmail, recipientName, reason) {
    return apiService.post(`${BASE_PATH}/${bookingId}/divert`, {
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      reason: reason
    });
  },

  /**
   * Send email to customer
   * @param {string} bookingId - Booking ID
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   */
  async contactCustomer(bookingId, subject, message) {
    return apiService.post(`${BASE_PATH}/${bookingId}/contact-customer`, {
      subject,
      message
    });
  },
};

export default bookingService;

