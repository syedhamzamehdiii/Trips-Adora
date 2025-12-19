import { apiService } from './api';

export const platformSettingsService = {
  getPlatformSettings: async () => {
    return await apiService.get('/settings/platform');
  },

  updatePlatformSettings: async ({ commissionPercent, payoutSchedule, refundPolicy, platformName, platformUrl, supportEmail, contactNumber }) => {
    const payload = {};
    if (commissionPercent !== undefined && commissionPercent !== null && commissionPercent !== '') {
      payload.commission_percent = Number(commissionPercent);
    }
    if (payoutSchedule) payload.payout_schedule = payoutSchedule;
    if (refundPolicy) payload.refund_policy = refundPolicy;
    if (platformName !== undefined) payload.platform_name = platformName;
    if (platformUrl !== undefined) payload.platform_url = platformUrl;
    if (supportEmail !== undefined) payload.support_email = supportEmail;
    if (contactNumber !== undefined) payload.contact_number = contactNumber;
    return await apiService.put('/settings/platform', payload);
  },
};

export default platformSettingsService;


