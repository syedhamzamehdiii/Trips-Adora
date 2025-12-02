import { apiService } from './api';

const BASE_PATH = '/auth';

export const teamService = {
  /**
   * Get team members with booking management or administration access
   */
  async getTeamMembersWithBookingAccess() {
    return apiService.get(`${BASE_PATH}/team-members`);
  },
};

export default teamService;

