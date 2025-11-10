const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to process wallet request');
  }
  return response.json();
};

export const getWallet = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to fetch wallet data');
  }
  const response = await fetch(`${API_BASE_URL}/wallet/${encodeURIComponent(userId)}`);
  return handleResponse(response);
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
  return handleResponse(response);
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
  return handleResponse(response);
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
  return handleResponse(response);
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
  return handleResponse(response);
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
  return handleResponse(response);
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
  return handleResponse(response);
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


