export type AdminUserRole = "buyer" | "seller" | "agent" | "admin";

export interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  role: AdminUserRole | string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminUsersMeta {
  totalUsers: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  meta: AdminUsersMeta;
  results: AdminUserRow[];
}
