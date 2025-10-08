import { apiService } from './api';
import config from '@/config';

export const productService = {
  getProducts: async (params = {}) => {
    return await apiService.get(config.endpoints.products.list, params);
  },

  getProduct: async (id) => {
    return await apiService.get(config.endpoints.products.detail(id));
  },

  createProduct: async (productData) => {
    return await apiService.post(config.endpoints.products.create, productData);
  },

  updateProduct: async (id, productData) => {
    return await apiService.put(config.endpoints.products.update(id), productData);
  },

  deleteProduct: async (id) => {
    return await apiService.delete(config.endpoints.products.delete(id));
  },

  uploadImages: async (formData, onUploadProgress) => {
    return await apiService.upload(config.endpoints.products.upload, formData, onUploadProgress);
  },

  shareProduct: async (id) => {
    return await apiService.post(config.endpoints.products.share(id));
  },
};