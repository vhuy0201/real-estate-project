// e:\Ki6\Ass\Project\real-estate-project\mobile\src\services\notificationService.ts
import { api } from "./api";
import { 
  NotificationResponse, 
  UnreadCountResponse, 
  Notification 
} from "../types/notification";

export const notificationService = {
  /**
   * Lấy danh sách thông báo có phân trang
   */
  async getNotifications(page = 1, limit = 10): Promise<NotificationResponse> {
    const response = await api.get<any>("/client/notifications", {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<any>("/client/notifications/unread-count");
    return response.data.data.unreadCount;
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<any>(`/client/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.patch<any>("/client/notifications/read-all");
    return response.data.data;
  },
};
