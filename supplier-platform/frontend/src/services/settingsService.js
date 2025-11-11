// Frontend/src/services/settingsService.js
import { apiService } from './api';

const BASE_PATH = '/settings';

export const settingsService = {
  async getSettings() {
    return apiService.get(`${BASE_PATH}`);
  },

  async saveSettings(settings) {
    return apiService.put(`${BASE_PATH}`, { settings });
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
};