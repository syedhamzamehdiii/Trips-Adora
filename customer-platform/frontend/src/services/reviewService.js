const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tripsadora.com/api/v1';

// Cache keys
const CACHE_KEY_PREFIX = 'customer_reviews_cache_';
const CACHE_TIMESTAMP_PREFIX = 'customer_reviews_cache_ts_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to process review request');
  }
  return response.json();
};

const getCachedReviews = (userId) => {
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

const setCachedReviews = (userId, data) => {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(data));
    localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`, Date.now().toString());
  } catch (_) {
    // Ignore cache errors
  }
};

export const getReviews = async (userId, useCache = true) => {
  if (!userId) {
    throw new Error('userId is required to fetch reviews');
  }
  
  // Return cached data immediately if available and fresh
  if (useCache) {
    const cached = getCachedReviews(userId);
    if (cached) {
      // Fetch fresh data in background
      fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(userId)}`)
        .then(handleResponse)
        .then(data => {
          const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
          setCachedReviews(userId, reviews);
        })
        .catch(() => {
          // Ignore background fetch errors
        });
      return cached;
    }
  }
  
  // Fetch fresh data
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(userId)}`);
  const data = await handleResponse(response);
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  setCachedReviews(userId, reviews);
  return reviews;
};

export const createReview = async (userId, review) => {
  if (!userId) {
    throw new Error('userId is required to submit a review');
  }
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(review)
  });
  const data = await handleResponse(response);
  // Invalidate cache - fetch fresh reviews
  const freshReviews = await getReviews(userId, false);
  setCachedReviews(userId, freshReviews);
  return data;
};

export const deleteReview = async (userId, reviewId) => {
  if (!userId) {
    throw new Error('userId is required to delete a review');
  }
  if (!reviewId) {
    throw new Error('reviewId is required to delete a review');
  }
  const response = await fetch(
    `${API_BASE_URL}/reviews/${encodeURIComponent(userId)}/${encodeURIComponent(reviewId)}`,
    {
      method: 'DELETE'
    }
  );
  await handleResponse(response);
  // Invalidate cache - fetch fresh reviews
  const freshReviews = await getReviews(userId, false);
  setCachedReviews(userId, freshReviews);
  return null;
};

export default {
  getReviews,
  createReview,
  deleteReview
};

