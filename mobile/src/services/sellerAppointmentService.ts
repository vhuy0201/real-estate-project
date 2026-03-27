import { api } from "./api";

/** Lấy danh sách lịch hẹn của seller — GET /client/seller/appointments */
export async function getSellerAppointments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  property_id?: string;
}) {
  const response = await api.get("/client/seller/appointments", { params });
  return response.data?.data ?? response.data;
}
