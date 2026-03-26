import { api } from "./api";
import type {
  AdminRevenueChart,
  AdminSummary,
  TopAgent,
  TopSeller,
  UserRolesSummary,
} from "../types/adminDashboard";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

const unwrap = <T>(response: { data?: ApiEnvelope<T> }) => {
  if (!response?.data?.data) throw new Error("Dữ liệu dashboard không hợp lệ.");
  return response.data.data;
};

export const adminDashboardService = {
  async getSummary(): Promise<AdminSummary> {
    const response = await api.get<ApiEnvelope<AdminSummary>>("/admin/reports/summary");
    return unwrap(response);
  },

  async getRevenueChart(year: number): Promise<AdminRevenueChart> {
    const response = await api.get<ApiEnvelope<AdminRevenueChart>>(
      "/admin/reports/revenue-chart",
      { params: { year } },
    );
    return unwrap(response);
  },

  async getTopAgents(limit = 5): Promise<TopAgent[]> {
    const response = await api.get<ApiEnvelope<TopAgent[]>>("/admin/reports/top-agents", {
      params: { limit },
    });
    return unwrap(response);
  },

  async getTopSellers(limit = 5): Promise<TopSeller[]> {
    const response = await api.get<ApiEnvelope<TopSeller[]>>("/admin/reports/top-sellers", {
      params: { limit },
    });
    return unwrap(response);
  },

  async getRolesSummary(): Promise<UserRolesSummary> {
    const response = await api.get<ApiEnvelope<UserRolesSummary>>(
      "/admin/reports/user-roles-summary",
    );
    return unwrap(response);
  },
};

