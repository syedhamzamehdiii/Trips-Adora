import { apiService } from './api';

const BASE_PATH = '/dashboard';

// Cache keys
const CACHE_KEY = 'supplier_dashboard_cache';
const CACHE_TIMESTAMP_KEY = 'supplier_dashboard_cache_ts';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (dashboard data changes frequently)

const getCachedOverview = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age < CACHE_TTL) {
        return JSON.parse(cached);
      }
    }
  } catch (_) {
    // Ignore cache errors
  }
  return null;
};

const setCachedOverview = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (_) {
    // Ignore cache errors
  }
};

export const getOverview = async (useCache = true) => {
  // Return cached data immediately if available and fresh
  if (useCache) {
    const cached = getCachedOverview();
    if (cached) {
      // Fetch fresh data in background
      apiService.get(`${BASE_PATH}/overview`)
        .then(data => setCachedOverview(data))
        .catch(() => {
          // Ignore background fetch errors
        });
      return cached;
    }
  }
  
  // Fetch fresh data
  const data = await apiService.get(`${BASE_PATH}/overview`);
  setCachedOverview(data);
  return data;
};

// Synchronous function to get cached overview immediately (for initial render)
export const getCachedOverviewSync = () => {
  return getCachedOverview();
};

export default {
  getOverview,
  getCachedOverviewSync,
};

