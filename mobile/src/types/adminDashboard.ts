export type AdminSummary = {
  totalUsers: number;
  totalProperties: number;
  totalDealsCompleted: number;
  totalRevenue: number;
  totalLeads: number;
};

export type RevenuePoint = {
  _id: { month: number };
  revenue: number;
};

export type DealPoint = {
  _id: { month: number };
  totalDeals: number;
};

export type AdminRevenueChart = {
  year: number;
  revenueByMonth: RevenuePoint[];
  dealsByMonth: DealPoint[];
};

export type TopAgent = {
  agent_id?: string;
  fullName?: string;
  email?: string;
  totalDeals?: number;
  totalAgentFee?: number;
};

export type TopSeller = {
  seller_id?: string;
  fullName?: string;
  email?: string;
  totalDeals?: number;
  totalValue?: number;
};

export type UserRolesSummary = {
  buyers: number;
  sellers: number;
  agents: number;
  admins: number;
};

