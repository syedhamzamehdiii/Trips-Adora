const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

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

export const getReviews = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to fetch reviews');
  }
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(userId)}`);
  const data = await handleResponse(response);
  return Array.isArray(data?.reviews) ? data.reviews : [];
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
  return handleResponse(response);
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
  return handleResponse(response);
};

export default {
  getReviews,
  createReview,
  deleteReview
};

