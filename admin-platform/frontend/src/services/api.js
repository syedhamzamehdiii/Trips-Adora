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
    async (error) => {
      // Handle 401 errors - token expired or invalid
      if (error.response?.status === 401) {
        console.error('❌ Authentication failed (401): Token expired or invalid');
        console.error('💡 To fix this:');
        console.error('   1. Run: python supplier-platform/backend/create_admin_user.py');
        console.error('   2. Copy the new JWT token');
        console.error('   3. Set it in browser console: localStorage.setItem("supplier_access_token", "YOUR_TOKEN")');
        console.error('   4. Or add to .env: VITE_SUPPLIER_ADMIN_TOKEN=YOUR_TOKEN');
        console.error('   5. Refresh the page');
      }
      return Promise.reject(error);
    }
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

// Helper function to check and set supplier admin token
export const checkSupplierToken = () => {
  const envToken = config.SUPPLIER_ADMIN_TOKEN;
  const localToken = localStorage.getItem('supplier_access_token');
  const token = envToken || localToken;
  
  if (!token) {
    console.warn('⚠️ No supplier admin token found!');
    console.warn('💡 To set a token:');
    console.warn('   1. Run: python supplier-platform/backend/create_admin_user.py');
    console.warn('   2. Copy the JWT token');
    console.warn('   3. Run in console: localStorage.setItem("supplier_access_token", "YOUR_TOKEN")');
    return false;
  }
  
  // Check if token is expired (basic check - decode JWT if possible)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const exp = payload.exp;
      if (exp) {
        const now = Math.floor(Date.now() / 1000);
        if (exp < now) {
          console.warn('⚠️ Supplier admin token has expired!');
          console.warn('💡 Generate a new token using: python supplier-platform/backend/create_admin_user.py');
          return false;
        }
        const timeLeft = exp - now;
        const minutesLeft = Math.floor(timeLeft / 60);
        console.log(`✅ Supplier token valid (expires in ${minutesLeft} minutes)`);
      }
    }
  } catch (e) {
    // If we can't decode, assume it's valid and let the API handle it
    console.log('✅ Supplier token found (unable to verify expiration)');
  }
  
  return true;
};

// Export axios instances if ever needed directly
export default api;
