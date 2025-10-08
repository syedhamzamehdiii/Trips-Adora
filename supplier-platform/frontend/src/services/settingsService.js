import { apiService } from './api';
import config from '@/config';

export const settingsService = {
  getProfile: async () => {
    return await apiService.get(config.endpoints.settings.profile);
  },

  updateProfile: async (profileData) => {
    return await apiService.put(config.endpoints.settings.profile, profileData);
  },

  updateAccount: async (accountData) => {
    return await apiService.put(config.endpoints.settings.account, accountData);
  },

  updateBanking: async (bankingData) => {
    return await apiService.put(config.endpoints.settings.banking, bankingData);
  },

  updateNotifications: async (notificationData) => {
    return await apiService.put(config.endpoints.settings.notifications, notificationData);
  },
};