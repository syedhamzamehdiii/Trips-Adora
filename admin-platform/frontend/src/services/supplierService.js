import { apiService, supplierApiService } from './api';

const BASE_PATH = '/suppliers';
const SUPPLIER_ONBOARDING_PATH = '/supplier-onboarding';

/**
 * Get all active suppliers with pagination and search
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @param {string} search - Optional search term
 * @returns {Promise} Supplier list with pagination info
 */
export const getActiveSuppliers = async (page = 1, pageSize = 10, search = null) => {
  const params = {
    page,
    page_size: pageSize,
  };
  
  if (search) {
    params.search = search;
  }
  
  return await apiService.get(BASE_PATH, params);
};

/**
 * Get supplier statistics
 * @returns {Promise} Supplier statistics (total, active, pending, earnings)
 */
export const getSupplierStats = async () => {
  return await apiService.get(`${BASE_PATH}/stats`);
};

/**
 * Get detailed supplier profile
 * @param {string} supplierId - supplier_code (e.g., SUP-XXXX)
 * @returns {Promise} Supplier detail payload
 */
export const getSupplierDetail = async (supplierId) => {
  return await apiService.get(`${BASE_PATH}/${encodeURIComponent(supplierId)}`);
};

/**
 * Get products for a supplier (published)
 * @param {string} supplierId - supplier_code (e.g., SUP-XXXX)
 * @param {number} page
 * @param {number} pageSize
 */
export const getSupplierProducts = async (supplierId, page = 1, pageSize = 10) => {
  const params = { page, page_size: pageSize };
  return await apiService.get(`${BASE_PATH}/${encodeURIComponent(supplierId)}/products`, params);
};

export const getBlockedSuppliers = async (page = 1, pageSize = 10, search = null) => {
  const params = { page, page_size: pageSize };
  if (search) params.search = search;
  return await apiService.get(`${BASE_PATH}/blocked`, params);
};

export const blockSupplier = async (supplierId, reason = null) => {
  return await apiService.post(`${BASE_PATH}/${encodeURIComponent(supplierId)}/block`, { reason });
};

export const unblockSupplier = async (supplierId) => {
  return await apiService.post(`${BASE_PATH}/${encodeURIComponent(supplierId)}/unblock`, {});
};

export const getPendingOnboardings = async (status = 'pending') => {
  const params = status ? { status_filter: status } : {};
  return await supplierApiService.get(SUPPLIER_ONBOARDING_PATH, params);
};

export const updateOnboardingStatus = async (onboardingId, status, rejection_reason = null) => {
  return await supplierApiService.put(
    `${SUPPLIER_ONBOARDING_PATH}/${encodeURIComponent(onboardingId)}/status`,
    { status, rejection_reason }
  );
};

export default {
  getActiveSuppliers,
  getSupplierStats,
  getSupplierDetail,
  getSupplierProducts,
  getPendingOnboardings,
  updateOnboardingStatus,
  getBlockedSuppliers,
  blockSupplier,
  unblockSupplier,
};
