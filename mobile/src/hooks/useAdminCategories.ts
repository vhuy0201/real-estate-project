import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  fetchTaxonomy,
  createTaxonomy,
  updateTaxonomy,
  deleteTaxonomy,
  TaxonomyResource,
} from "../services/adminCategoryService";

/** Lấy danh sách taxonomy items */
export function useTaxonomyList(resource: TaxonomyResource) {
  return useQuery({
    queryKey: ["taxonomy", resource],
    queryFn: () => fetchTaxonomy(resource),
  });
}

/** Thêm mới taxonomy item */
export function useCreateTaxonomy(resource: TaxonomyResource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, any>) => createTaxonomy(resource, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy", resource] });
      Alert.alert("Thành công", "Đã thêm mới thành công.");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể thêm mới. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    },
  });
}

/** Sửa taxonomy item */
export function useUpdateTaxonomy(resource: TaxonomyResource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, any> }) =>
      updateTaxonomy(resource, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy", resource] });
      Alert.alert("Thành công", "Đã cập nhật thành công.");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể cập nhật. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    },
  });
}

/** Xóa taxonomy item */
export function useDeleteTaxonomy(resource: TaxonomyResource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTaxonomy(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomy", resource] });
      Alert.alert("Thành công", "Đã xóa thành công.");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể xóa. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    },
  });
}
