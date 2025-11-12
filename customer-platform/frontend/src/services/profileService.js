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
    const timestamp = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`);
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

export const getProfile = async (userId, useCache = true) => {
  if (!userId) {
    throw new Error('userId is required to fetch profile data');
  }
  
  // Return cached data immediately if available and fresh
  if (useCache) {
    const cached = getCachedProfile(userId);
    if (cached) {
      // Fetch fresh data in background
      fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}`)
        .then(handleResponse)
        .then(data => setCachedProfile(userId, data))
        .catch(() => {
          // Ignore background fetch errors
        });
      return cached;
    }
  }
  
  // Fetch fresh data
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
  updateProfile,
  upsertProfile
};


