import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminUsers, updateUserStatus } from "../services/adminUserService";
import type { AdminUserRole, AdminUsersResponse } from "../types/adminUser";
import { Alert } from "react-native";

export const ADMIN_USERS_PAGE_SIZE = 10;

type RoleFilter = AdminUserRole | "all";

export function useAdminUsersPage(roleFilter: RoleFilter, page: number) {
  const roleParam = roleFilter === "all" ? undefined : roleFilter;

  return useQuery({
    queryKey: ["admin", "users", "page", roleParam ?? "all", page],
    queryFn: () =>
      fetchAdminUsers({
        role: roleParam,
        page,
        limit: ADMIN_USERS_PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });
}

/**
 * Mutation hook: khóa / mở khóa tài khoản.
 * - Optimistic update: cập nhật cache ngay lập tức.
 * - Rollback on error: khôi phục cache cũ nếu API thất bại.
 * - Toast message: Alert thông báo thành công / lỗi.
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),

    onMutate: async ({ id, isActive }) => {
      // Hủy mọi refetch đang chờ để tránh ghi đè optimistic update
      await queryClient.cancelQueries({ queryKey: ["admin", "users", "page"] });

      // Snapshot toàn bộ cache của danh sách users
      const previousQueries = queryClient.getQueriesData<AdminUsersResponse>({
        queryKey: ["admin", "users", "page"],
      });

      // Optimistic update: cập nhật isActive trong cache
      queryClient.setQueriesData<AdminUsersResponse>(
        { queryKey: ["admin", "users", "page"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            results: old.results.map((user) =>
              user.id === id ? { ...user, isActive } : user
            ),
          };
        }
      );

      return { previousQueries };
    },

    onError: (_error, _variables, context) => {
      // Rollback: khôi phục cache trước khi optimistic update
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      const message =
        (_error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.";
      Alert.alert("Lỗi", message);
    },

    onSuccess: (data) => {
      const userName = (data as any)?.fullName || "Người dùng";
      Alert.alert("Thành công", `Đã cập nhật trạng thái cho ${userName}.`);
    },

    onSettled: () => {
      // Luôn refetch lại từ server để đảm bảo dữ liệu chính xác
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "page"] });
    },
  });
}
