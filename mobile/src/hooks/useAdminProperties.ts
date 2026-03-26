import { Alert } from "react-native";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchAdminProperties,
  patchAdminPropertyStatus,
} from "../services/adminPropertyService";
import type { AdminPropertyStatusFilter } from "../types/adminProperty";

function mutationErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string } } })
      .response?.data;
    if (data?.message) return String(data.message);
  }
  if (err instanceof Error) return err.message;
  return "Không cập nhật được trạng thái bài đăng.";
}

export const ADMIN_PROPERTIES_PAGE_SIZE = 10;

export function useAdminPropertiesPage(
  statusFilter: AdminPropertyStatusFilter,
  page: number
) {
  const statusParam =
    statusFilter === "all" ? undefined : statusFilter;

  return useQuery({
    queryKey: ["admin", "properties", "page", statusParam ?? "all", page],
    queryFn: () =>
      fetchAdminProperties({
        status: statusParam,
        page,
        limit: ADMIN_PROPERTIES_PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPropertyStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      status,
    }: {
      propertyId: string;
      status: "approved" | "rejected";
    }) => patchAdminPropertyStatus(propertyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
    onError: (err) => {
      Alert.alert("Lỗi", mutationErrorMessage(err));
    },
  });
}
