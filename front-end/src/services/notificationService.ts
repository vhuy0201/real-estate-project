import type { NotificationType } from "../types/Notification";
import { httpClient } from "../utils/httpClient";
const RESOURCE = "/notifications";

export const getNotifications = async (
  page: number
): Promise<{ data: NotificationType[]; pagination: any }> => {
  const res = await httpClient.get(RESOURCE, { params: { page } });
  const notifications = res?.data?.data?.data;
  const pagination = res?.data?.data?.pagination;
  return {
    data: notifications,
    pagination,
  };
};

export const getAllNotifications = async (): Promise<{
  data: NotificationType[];
}> => {
  const res = await httpClient.get(RESOURCE, { params: { limit: 100 } });
  return res?.data?.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await httpClient.get(`${RESOURCE}/unread-count`);
  return res?.data?.data?.unreadCount;
};

export const markAsRead = async (
  id: string
): Promise<NotificationType | null> => {
  try {
    const res = await httpClient.patch(`${RESOURCE}/${id}/read`);
    return res?.data?.data;
  } catch (error: any) {
    console.log("Lỗi khi đánh dấu đã đọc:", error);
    throw new Error(
      error?.response?.data?.message || "Đánh dấu đã đọc thất bại"
    );
  }
};

export const markAllAsRead = async (): Promise<boolean> => {
  try {
    const res = await httpClient.patch(`${RESOURCE}/read-all`);
    return !!(res?.data?.success ?? true);
  } catch (error: any) {
    console.log("Lỗi khi đánh dấu tất cả đã đọc:", error);
    throw new Error(
      error?.response?.data?.message || "Đánh dấu tất cả thất bại"
    );
  }
};
