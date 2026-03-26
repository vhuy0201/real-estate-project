import { api } from "./api";

/** Lấy danh sách lịch hẹn của agent — GET /client/agent/appointments */
export async function getAgentAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  property_id?: string;
}) {
  const response = await api.get("/client/agent/appointments", { params });
  return response.data?.data ?? response.data;
}

/** Chấp nhận lịch hẹn — PATCH /client/agent/appointments/:id/accept */
export async function acceptAppointment(id: string, selectedTime: string) {
  const response = await api.patch(`/client/agent/appointments/${id}/accept`, {
    selectedTime,
  });
  return response.data?.data ?? response.data;
}

/** Từ chối lịch hẹn — PATCH /client/agent/appointments/:id/reject */
export async function rejectAppointment(id: string, reason?: string) {
  const response = await api.patch(`/client/agent/appointments/${id}/reject`, {
    reason,
  });
  return response.data?.data ?? response.data;
}
