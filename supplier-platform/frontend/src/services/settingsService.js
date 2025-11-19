// Frontend/src/services/settingsService.js
import { apiService } from './api';

const BASE_PATH = '/settings';

// Cache for settings to avoid redundant API calls
let settingsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

export const settingsService = {
  async getSettings(forceRefresh = false) {
    // Return cached data if available and fresh
    const now = Date.now();
    if (!forceRefresh && settingsCache && (now - cacheTimestamp) < CACHE_TTL) {
      return settingsCache;
    }

    try {
      const response = await apiService.get(`${BASE_PATH}`);
      settingsCache = response;
      cacheTimestamp = now;
      return response;
    } catch (error) {
      // Return cached data on error if available
      if (settingsCache) {
        return settingsCache;
      }
      throw error;
    }
  },

  async saveSettings(settings) {
    const response = await apiService.put(`${BASE_PATH}`, { settings });
    // Update cache immediately
    settingsCache = { settings };
    cacheTimestamp = Date.now();
    return response;
  },

  async updateProfile(profileSettings) {
    return apiService.put(`${BASE_PATH}/profile`, { settings: profileSettings });
  },

  async updateAccount(accountSettings) {
    return apiService.put(`${BASE_PATH}/account`, { settings: accountSettings });
  },

  async updateBanking(bankingSettings) {
    return apiService.put(`${BASE_PATH}/banking`, { settings: bankingSettings });
  },

  async updateNotifications(notificationSettings) {
    return apiService.put(`${BASE_PATH}/notifications`, { settings: notificationSettings });
  },

  // Clear cache (useful after updates)
  clearCache() {
    settingsCache = null;
    cacheTimestamp = 0;
  },
};