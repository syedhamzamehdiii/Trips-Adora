import { apiService } from './api';

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
  }
};

