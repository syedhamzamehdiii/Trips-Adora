// API Service - Centralized axios instance with interceptors
import axios from 'axios';
import { config } from '@/config';

const API_BASE_URL = config.API_BASE_URL;

// Create axios instance
// API_BASE_URL already includes '/api', so we just need to add '/v1'
const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Service object with common methods
export const apiService = {
  get: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
  },

  post: async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
  },

  put: async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
  },

  patch: async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
  },

  delete: async (url) => {
    const response = await api.delete(url);
    return response.data;
  },

  upload: async (url, formData, onUploadProgress) => {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
};

// Export axios instance as default (for productService and authService compatibility)
export default api;

