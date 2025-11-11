import { apiService } from './api';

const BASE_PATH = '/dashboard';

export const getOverview = async () => {
  return apiService.get(`${BASE_PATH}/overview`);
};

export default {
  getOverview,
};

