import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  getMyAppointments,
  getAppointmentDetail,
  cancelAppointment,
} from "../services/appointmentService";
import { showAppNotice } from "../utils/appNotice";

/** Lấy danh sách lịch hẹn của buyer */
export function useMyAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["buyer-appointments", params],
    queryFn: () => getMyAppointments(params),
  });
}

/** Lấy chi tiết lịch hẹn của buyer */
export function useAppointmentDetails(id: string) {
  return useQuery({
    queryKey: ["buyer-appointment-detail", id],
    queryFn: () => getAppointmentDetail(id),
    enabled: !!id,
  });
}

/** Đặt lịch hẹn xem nhà */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-appointments"] });
      showAppNotice({
        type: "success",
        title: "Thành công",
        message: "Đặt lịch hẹn xem nhà thành công! Agent sẽ sớm phản hồi.",
      });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Không thể đặt lịch hẹn. Vui lòng thử lại.";
      showAppNotice({ type: "error", title: "Lỗi", message: msg });
    },
  });
}

/** Hủy lịch hẹn */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-appointments"] });
      showAppNotice({ type: "success", title: "Thành công", message: "Đã hủy lịch hẹn." });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Không thể hủy lịch hẹn. Vui lòng thử lại.";
      showAppNotice({ type: "error", title: "Lỗi", message: msg });
    },
  });
}
