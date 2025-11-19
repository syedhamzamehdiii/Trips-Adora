// src/services/notificationService.js
import api from './api';

const notificationService = {
  /**
   * Get all notifications for the current supplier
   * @param {Object} params - Query parameters (limit, skip, unread_only)
   * @returns {Promise} API response with notifications
   */
  getNotifications: async (params = {}) => {
    try {
      const { limit = 50, skip = 0, unread_only = false } = params;
      const response = await api.get('/notifications/', {
        params: { limit, skip, unread_only }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise} API response with unread_count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { unread_count: 0 };
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} API response
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} API response
   */
  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} API response
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export default notificationService;

