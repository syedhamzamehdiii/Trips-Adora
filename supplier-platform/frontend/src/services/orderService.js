import { apiService } from './api';
import config from '@/config';

export const orderService = {
  getOrders: async (params = {}) => {
    return await apiService.get(config.endpoints.orders.list, params);
  },

  getOrder: async (id) => {
    return await apiService.get(config.endpoints.orders.detail(id));
  },

  updateOrder: async (id, orderData) => {
    return await apiService.put(config.endpoints.orders.update(id), orderData);
  },
};
