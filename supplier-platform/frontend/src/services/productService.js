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
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Get all products for the current supplier
   * @param {Object} params - Query parameters (status, page, page_size)
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
  }
};

export default productService;
