import { api } from "./api";

/** Đặt lịch hẹn xem nhà — POST /client/buyer/appointments */
export async function createAppointment(body: {
  propertyId: string;
  times: { time: string; note?: string }[];
  location?: string;
}) {
  const response = await api.post("/client/buyer/appointments", body);
  return response.data?.data ?? response.data;
}

/** Lấy danh sách lịch hẹn — GET /client/buyer/appointments */
export async function getMyAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const response = await api.get("/client/buyer/appointments", { params });
  return response.data?.data ?? response.data;
}

/** Hủy lịch hẹn — PATCH /client/buyer/appointments/:id/cancel */
export async function cancelAppointment(id: string) {
  const response = await api.patch(`/client/buyer/appointments/${id}/cancel`);
  return response.data?.data ?? response.data;
}

/** Lấy chi tiết lịch hẹn — GET /client/buyer/appointments/:id */
export async function getAppointmentDetail(id: string) {
  const response = await api.get(`/client/buyer/appointments/${id}`);
  return response.data?.data ?? response.data;
}
