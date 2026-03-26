import { api } from "./api";
import type { AdminUsersResponse, AdminUserRole, AdminUserRow } from "../types/adminUser";

export type AdminUsersParams = {
  role?: AdminUserRole | "";
  page?: number;
  limit?: number;
};

/**
 * GET /api/admin/users — yêu cầu JWT role admin.
 */
export async function fetchAdminUsers(
  params: AdminUsersParams = {}
): Promise<AdminUsersResponse> {
  const { role, page = 1, limit = 15 } = params;
  const response = await api.get<{ success?: boolean; data?: AdminUsersResponse }>(
    "/admin/users",
    {
      params: {
        page,
        limit,
        ...(role ? { role } : {}),
      },
    }
  );

  const payload = response.data?.data;
  if (!payload?.results || !payload?.meta) {
    throw new Error("Dữ liệu người dùng không hợp lệ từ server.");
  }
  return payload;
}

/**
 * PATCH /api/admin/users/:id/status
 * Payload: { isActive: boolean }
 * Khóa hoặc mở khóa tài khoản người dùng.
 */
export async function updateUserStatus(
  id: string,
  isActive: boolean
): Promise<AdminUserRow> {
  const response = await api.patch<{ success?: boolean; data?: AdminUserRow }>(
    `/admin/users/${id}/status`,
    { isActive }
  );
  // API có thể trả về { success, data } hoặc trực tiếp object
  return response.data?.data ?? (response.data as unknown as AdminUserRow);
}
