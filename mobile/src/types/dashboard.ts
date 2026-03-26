export interface DashboardStats {
  propertiesCount: number;
  acceptedAppointmentsCount: number;
  viewsCount: number;
  role: 'seller' | 'agent';
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}
