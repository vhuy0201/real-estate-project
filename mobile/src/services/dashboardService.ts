import { api } from './api';
import { DashboardStatsResponse } from '../types/dashboard';

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get('/client/dashboard/stats');
    return response.data;
  },
};
