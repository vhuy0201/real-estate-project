import { api } from "./api";
import type { AdminPropertiesPageResponse } from "../types/adminProperty";

export type AdminPropertiesParams = {
  page?: number;
  limit?: number;
  /** Bỏ qua khi undefined — backend liệt kê tất cả */
  status?: string;
};

/**
 * GET /admin/properties — JWT admin.
 */
export async function fetchAdminProperties(
  params: AdminPropertiesParams = {}
): Promise<AdminPropertiesPageResponse> {
  const { page = 1, limit = 10, status } = params;
  const response = await api.get<{
    success?: boolean;
    data?: AdminPropertiesPageResponse;
  }>("/admin/properties", {
    params: {
      page,
      limit,
      ...(status ? { status } : {}),
    },
  });

  const payload = response.data?.data;
  if (
    !payload?.pagination ||
    typeof payload.pagination.total !== "number" ||
    !Array.isArray(payload.data)
  ) {
    throw new Error("Dữ liệu bài đăng không hợp lệ từ server.");
  }
  return payload;
}

/**
 * PATCH /admin/properties/:id/status — body { status: 'approved' | 'rejected' }
 */
export async function patchAdminPropertyStatus(
  propertyId: string,
  status: "approved" | "rejected"
): Promise<void> {
  await api.patch(`/admin/properties/${propertyId}/status`, { status });
}
