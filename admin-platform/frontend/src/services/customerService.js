// Customer Service - API calls for customer management
import { apiService } from './api';

export const customerService = {
  /**
   * Get paginated list of customers with search
   * @param {number} page - Page number (starts from 1)
   * @param {number} pageSize - Items per page
   * @param {string} search - Optional search term
   * @returns {Promise<Object>} Customer list response
   */
  getCustomers: async (page = 1, pageSize = 10, search = null) => {
    const params = {
      page,
      page_size: pageSize,
    };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return await apiService.get('/customers', params);
  },

  /**
   * Get customer statistics
   * @returns {Promise<Object>} Customer stats response
   */
  getCustomerStats: async () => {
    return await apiService.get('/customers/stats');
  },

  /**
   * Get detailed customer information
   * @param {string} customerId - Customer user ID
   * @returns {Promise<Object>} Customer details response
   */
  getCustomerDetails: async (customerId) => {
    return await apiService.get(`/customers/${customerId}/details`);
  },

  /**
   * Send message from admin to customer
   * @param {string} customerId - Customer user ID
   * @param {string} message - Message content
   * @param {string} adminName - Admin name (optional)
   * @returns {Promise<Object>} Response
   */
  sendMessageToCustomer: async (customerId, message, adminName = 'Admin') => {
    return await apiService.post(`/customers/${customerId}/message`, {
      message,
      admin_name: adminName,
    });
  },
};

