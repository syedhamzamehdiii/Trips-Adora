const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

// Cache keys
const CACHE_KEY_PREFIX = 'customer_profile_cache_';
const CACHE_TIMESTAMP_PREFIX = 'customer_profile_cache_ts_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to fetch profile data');
  }
  return response.json();
};

const getCachedProfile = (userId) => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
    if (cached) {
      // Always return cached data, even if expired
      return JSON.parse(cached);
    }
  } catch (_) {
    // Ignore cache errors
  }
  return null;
};

// Synchronous function to get cached profile immediately (for initial render)
export const getCachedProfileSync = (userId) => {
  return getCachedProfile(userId);
};

const setCachedProfile = (userId, data) => {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(data));
    localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`, Date.now().toString());
  } catch (_) {
    // Ignore cache errors
  }
};

// Lightweight summary for header (only user info)
const SUMMARY_CACHE_KEY_PREFIX = 'customer_profile_summary_cache_';
const SUMMARY_CACHE_TIMESTAMP_PREFIX = 'customer_profile_summary_cache_ts_';
const SUMMARY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for summary

const getCachedSummary = (userId) => {
  try {
    const cached = localStorage.getItem(`${SUMMARY_CACHE_KEY_PREFIX}${userId}`);
    const timestamp = localStorage.getItem(`${SUMMARY_CACHE_TIMESTAMP_PREFIX}${userId}`);
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age < SUMMARY_CACHE_TTL) {
        return JSON.parse(cached);
      }
    }
  } catch (_) {
    // Ignore cache errors
  }
  return null;
};

const setCachedSummary = (userId, data) => {
  try {
    localStorage.setItem(`${SUMMARY_CACHE_KEY_PREFIX}${userId}`, JSON.stringify(data));
    localStorage.setItem(`${SUMMARY_CACHE_TIMESTAMP_PREFIX}${userId}`, Date.now().toString());
  } catch (_) {
    // Ignore cache errors
  }
};

export const getProfileSummary = async (userId, useCache = true) => {
  if (!userId) {
    throw new Error('userId is required to fetch profile summary');
  }
  
  // Return cached summary immediately if available
  if (useCache) {
    const cached = getCachedSummary(userId);
    if (cached) {
      // Fetch fresh summary in background
      fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}/summary`)
        .then(handleResponse)
        .then(data => setCachedSummary(userId, data))
        .catch(() => {
          // Ignore background fetch errors
        });
      return cached;
    }
  }
  
  // Fetch fresh summary
  const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}/summary`);
  const data = await handleResponse(response);
  setCachedSummary(userId, data);
  return data;
};

export const getProfile = async (userId, useCache = true) => {
  if (!userId) {
    throw new Error('userId is required to fetch profile data');
  }
  
  // Always return cached data immediately if available (even if expired)
  if (useCache) {
    const cached = getCachedProfile(userId);
    if (cached) {
      // Refresh in background (don't await)
      fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}`)
        .then(handleResponse)
        .then(data => setCachedProfile(userId, data))
        .catch(() => {
          // Ignore background fetch errors
        });
      // Return immediately resolved Promise to avoid microtask delay
      return Promise.resolve(cached);
    }
  }
  
  // If no cache → make API call
  const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}`);
  const data = await handleResponse(response);
  setCachedProfile(userId, data);
  return data;
};

export const updateProfile = async (userId, payload) => {
  if (!userId) {
    throw new Error('userId is required to update profile data');
  }
  const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await handleResponse(response);
  setCachedProfile(userId, data);
  return data;
};

export const upsertProfile = async (userId, payload) => {
  if (!userId) {
    throw new Error('userId is required to save profile data');
  }
  const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await handleResponse(response);
  setCachedProfile(userId, data);
  return data;
};

export default {
  getProfile,
  getProfileSummary,
  updateProfile,
  upsertProfile,
  getCachedProfileSync
};


