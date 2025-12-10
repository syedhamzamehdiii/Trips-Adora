import { apiService } from './api';

export const reviewService = {
  getReviews: async (customerId, { limit = 50, productOnly = true, email = null } = {}) => {
    const params = { limit };
    if (productOnly) params.product_only = true;
    if (email) params.email = email;
    return await apiService.get(`/reviews/${customerId}`, params);
  },
};

