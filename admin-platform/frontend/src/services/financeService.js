import { apiService } from './api';

export const financeService = {
  getSummary: async () => {
    return await apiService.get('/finance/summary');
  },
  getTrend: async (months = 6) => {
    return await apiService.get('/finance/trend', { months });
  },
  getSupplierPayouts: async ({ page = 1, pageSize = 10, search = '', month = 'All' } = {}) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (month) params.month = month;
    return await apiService.get('/finance/supplier-payouts', params);
  },
  getSupplierPayoutHistory: async ({ page = 1, pageSize = 10, search = '', month = 'All' } = {}) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (month) params.month = month;
    return await apiService.get('/finance/supplier-payout-history', params);
  },
  getAdminCommission: async ({ page = 1, pageSize = 10, search = '', month = 'All' } = {}) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (month) params.month = month;
    return await apiService.get('/finance/admin-commission', params);
  },
};

export default financeService;


