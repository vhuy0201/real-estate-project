import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  getAgentAppointments,
  acceptAppointment,
  rejectAppointment,
} from "../services/agentAppointmentService";
import { getSellerAppointments } from "../services/sellerAppointmentService";

/** Lấy danh sách lịch hẹn của agent */
export function useAgentAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  property_id?: string;
}) {
  return useQuery({
    queryKey: ["agent-appointments", params],
    queryFn: () => getAgentAppointments(params),
  });
}

/** Lấy danh sách lịch hẹn của seller */
export function useSellerAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  property_id?: string;
}) {
  return useQuery({
    queryKey: ["seller-appointments", params],
    queryFn: () => getSellerAppointments(params),
  });
}

/** Chấp nhận lịch hẹn */
export function useAcceptAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, selectedTime }: { id: string; selectedTime: string }) =>
      acceptAppointment(id, selectedTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-appointments"] });
      // Cũng invalidate dashboard stats nếu cần
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      Alert.alert("Thành công", "Đã chốt lịch hẹn với khách hàng.");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Không thể chấp nhận lịch hẹn. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    },
  });
}

/** Từ chối lịch hẹn */
export function useRejectAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      Alert.alert("Thành công", "Đã từ chối lịch hẹn.");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Không thể từ chối lịch hẹn. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    },
  });
}
