import { apiService } from './api';
import axios from 'axios';
import { config } from '../config';

export const feedbackService = {
  getFeedbacks: async (search = '', month = '', limit = 100) => {
    const params = { limit };
    if (search && search.trim()) params.search = search.trim();
    if (month && month !== 'All') params.month = month;
    return await apiService.get('/feedbacks', params);
  },
  getStats: async (month = '') => {
    const params = {};
    if (month && month !== 'All') params.month = month;
    return await apiService.get('/feedbacks/stats', params);
  },
  deleteFeedback: async (reviewId) => {
    if (!reviewId) {
      throw new Error('reviewId is required to delete a feedback');
    }
    try {
      // Use direct axios call with timeout for faster deletion (6 seconds)
      const API_BASE_URL = config.API_BASE_URL;
      const token = localStorage.getItem('access_token') || '';
      
      await axios.delete(
        `${API_BASE_URL}/v1/feedbacks/${encodeURIComponent(reviewId)}`,
        {
          timeout: 6000, // 6 second timeout
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return true;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Delete operation timed out. Please try again.');
      }
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }
};
