import { apiService } from './api';

export const adminProductService = {
  listProducts: async ({
    page = 1,
    pageSize = 12,
    status = null,
    search = '',
    country = '',
    category = '',
  } = {}) => {
    const params = { page, page_size: pageSize };
    if (status) params.status = status;
    if (search) params.search = search;
    if (country) params.country = country;
    if (category) params.category = category;
    return await apiService.get('/products', params);
  },

  getPendingCount: async () => {
    return await apiService.get('/products/pending/count');
  },

  approveProduct: async (productId) => {
    return await apiService.post(`/products/${encodeURIComponent(productId)}/approve`, {});
  },

  rejectProduct: async (productId, reason = '') => {
    return await apiService.post(`/products/${encodeURIComponent(productId)}/reject`, { reason });
  },
};

export default adminProductService;


