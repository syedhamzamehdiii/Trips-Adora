const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to fetch profile data');
  }
  return response.json();
};

export const getProfile = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to fetch profile data');
  }
  const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(userId)}`);
  return handleResponse(response);
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
  return handleResponse(response);
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
  return handleResponse(response);
};

export default {
  getProfile,
  updateProfile,
  upsertProfile
};


