import { apiService } from './api';

export const platformSettingsService = {
  getPlatformSettings: async () => {
    return await apiService.get('/settings/platform');
  },

  updatePlatformSettings: async ({ commissionPercent, payoutSchedule }) => {
    const payload = {};
    if (commissionPercent !== undefined && commissionPercent !== null && commissionPercent !== '') {
      payload.commission_percent = Number(commissionPercent);
    }
    if (payoutSchedule) payload.payout_schedule = payoutSchedule;
    return await apiService.put('/settings/platform', payload);
  },
};

export default platformSettingsService;


