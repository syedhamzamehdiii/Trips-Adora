const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

// Cache keys
const CACHE_KEY_PREFIX = 'customer_wallet_cache_';
const CACHE_TIMESTAMP_PREFIX = 'customer_wallet_cache_ts_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to process wallet request');
  }
  return response.json();
};

const getCachedWallet = (userId) => {
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

const setCachedWallet = (userId, data) => {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(data));
    localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`, Date.now().toString());
  } catch (_) {
    // Ignore cache errors
  }
};

export const getWallet = async (userId, useCache = true) => {
  if (!userId) {
    throw new Error('userId is required to fetch wallet data');
  }
  
  // Return cached data immediately if available and fresh
  if (useCache) {
    const cached = getCachedWallet(userId);
    if (cached) {
      // Fetch fresh data in background
      fetch(`${API_BASE_URL}/wallet/${encodeURIComponent(userId)}`)
        .then(handleResponse)
        .then(data => setCachedWallet(userId, data))
        .catch(() => {
          // Ignore background fetch errors
        });
      return cached;
    }
  }
  
  // Fetch fresh data
  const response = await fetch(`${API_BASE_URL}/wallet/${encodeURIComponent(userId)}`);
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export const updateWallet = async (userId, payload) => {
  if (!userId) {
    throw new Error('userId is required to update wallet data');
  }
  const response = await fetch(`${API_BASE_URL}/wallet/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export const addPaymentMethod = async (userId, payload) => {
  if (!userId) {
    throw new Error('userId is required to add a payment method');
  }
  const response = await fetch(`${API_BASE_URL}/wallet/${encodeURIComponent(userId)}/payment-methods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export const setDefaultPaymentMethod = async (userId, methodId) => {
  if (!userId) {
    throw new Error('userId is required to set default payment method');
  }
  if (!methodId) {
    throw new Error('methodId is required to set default payment method');
  }
  const response = await fetch(
    `${API_BASE_URL}/wallet/${encodeURIComponent(userId)}/payment-methods/${encodeURIComponent(methodId)}/default`,
    {
      method: 'POST'
    }
  );
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export const removePaymentMethod = async (userId, methodId) => {
  if (!userId) {
    throw new Error('userId is required to remove a payment method');
  }
  if (!methodId) {
    throw new Error('methodId is required to remove a payment method');
  }
  const response = await fetch(
    `${API_BASE_URL}/wallet/${encodeURIComponent(userId)}/payment-methods/${encodeURIComponent(methodId)}`,
    {
      method: 'DELETE'
    }
  );
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export const addBankAccount = async (userId, payload) => {
  if (!userId) {
    throw new Error('userId is required to add a bank account');
  }
  const response = await fetch(`${API_BASE_URL}/wallet/${encodeURIComponent(userId)}/bank-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export const removeBankAccount = async (userId, accountId) => {
  if (!userId) {
    throw new Error('userId is required to remove a bank account');
  }
  if (!accountId) {
    throw new Error('accountId is required to remove a bank account');
  }
  const response = await fetch(
    `${API_BASE_URL}/wallet/${encodeURIComponent(userId)}/bank-accounts/${encodeURIComponent(accountId)}`,
    {
      method: 'DELETE'
    }
  );
  const data = await handleResponse(response);
  setCachedWallet(userId, data);
  return data;
};

export default {
  getWallet,
  updateWallet,
  addPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod,
  addBankAccount,
  removeBankAccount
};


