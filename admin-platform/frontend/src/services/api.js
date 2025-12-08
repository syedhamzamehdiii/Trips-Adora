// API Service - Centralized axios instance with interceptors
import axios from 'axios';
import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;
const SUPPLIER_API_BASE_URL = config.SUPPLIER_API_BASE_URL;

const createApi = (baseURL, { staticToken = '', localTokenKey = 'access_token' } = {}) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(
    (cfg) => {
      const localToken = localStorage.getItem(localTokenKey) || localStorage.getItem('access_token');
      const token = staticToken || localToken;
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => Promise.reject(error)
  );

  return instance;
};

// Admin API (existing)
const api = createApi(`${API_BASE_URL}/api/v1`);
// Supplier platform API (single source of truth for onboarding)
const supplierApi = createApi(`${SUPPLIER_API_BASE_URL}/api/v1`, {
  staticToken: config.SUPPLIER_ADMIN_TOKEN,
  localTokenKey: 'supplier_access_token',
});

const wrap = (instance) => ({
  get: async (url, params = {}) => (await instance.get(url, { params })).data,
  post: async (url, data = {}) => (await instance.post(url, data)).data,
  put: async (url, data = {}) => (await instance.put(url, data)).data,
  patch: async (url, data = {}) => (await instance.patch(url, data)).data,
  delete: async (url) => (await instance.delete(url)).data,
});

// API Service object with common methods
export const apiService = wrap(api);
export const supplierApiService = wrap(supplierApi);

// Export axios instances if ever needed directly
export default api;
