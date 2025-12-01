// src/services/productService.js
import api from './api';

const productService = {
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise} API response
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products/', productData);
      return response.data;
    } catch (error) {
      const { response } = error || {};
      const details = response?.data?.detail ?? response?.data ?? error?.message;

      let friendlyMessage = '';
      if (Array.isArray(details)) {
        friendlyMessage = details
          .map((item) => item?.msg || item?.detail || item?.message || JSON.stringify(item))
          .join(', ');
      } else if (typeof details === 'string') {
        friendlyMessage = details;
      } else if (details && typeof details === 'object') {
        friendlyMessage = details.message || details.error || JSON.stringify(details);
      }

      if (friendlyMessage) {
        error.friendlyMessage = friendlyMessage;
      }

      console.error('Error creating product:', details);
      throw error;
    }
  },

  /**
   * Get all products for the current supplier
   * @param {Object} params - Query parameters (status, page, page_size, summary)
   * @param {boolean} params.summary - If true, returns lightweight summary (excludes images) for faster loading
   * @returns {Promise} API response with products list
   */
  getMyProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get all published products (for customer view)
   * @param {Object} params - Query parameters (page, page_size, category, destination)
   * @returns {Promise} API response with products list
   */
  getPublishedProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/published', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching published products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   * @param {string} productId - Product ID
   * @returns {Promise} API response with product details
   */
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} API response
   */
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Update product availability (inactive dates and vehicle-level inactive dates)
   * @param {string} productId
   * @param {Object} availabilityData
   */
  updateAvailability: async (productId, availabilityData) => {
    try {
      const response = await api.put(`/products/${productId}/availability`, availabilityData);
      return response.data;
    } catch (error) {
      console.error('Error updating product availability:', error);
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Publish a product (submit for review)
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  publishProduct: async (productId) => {
    try {
      const response = await api.post(`/products/${productId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error publishing product:', error);
      throw error;
    }
  },

  /**
   * Save product as draft
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  saveAsDraft: async (productId) => {
    try {
      const response = await api.post(`/products/${productId}/draft`);
      return response.data;
    } catch (error) {
      console.error('Error saving as draft:', error);
      throw error;
    }
  },

  /**
   * Search products
   * @param {string} searchTerm - Search query
   * @param {Object} params - Query parameters (page, page_size)
   * @returns {Promise} API response with search results
   */
  searchProducts: async (searchTerm, params = {}) => {
    try {
      const response = await api.get('/products/search/query', {
        params: { q: searchTerm, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Sync products to backend cache for customer platform access
   */
  syncToBackendCache: async (products) => {
    try {
      const response = await api.post('/products/localstorage/sync', products);
      return response.data;
    } catch (error) {
      console.error('Error syncing to backend cache:', error);
      throw error;
    }
  },

  /**
   * Sync full product data (including images) to backend cache
   */
  syncFullProductData: async (productId, fullData) => {
    try {
      const response = await api.post(`/products/localstorage/sync-full/${productId}`, fullData);
      return response.data;
    } catch (error) {
      console.error('Error syncing full product data:', error);
      throw error;
    }
  }
};

export default productService;
