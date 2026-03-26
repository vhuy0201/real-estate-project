// e:\Ki6\Ass\Project\real-estate-project\mobile\src\hooks\useNotifications.ts
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Query lấy danh sách thông báo (Infinite Scroll)
  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) => notificationService.getNotifications(pageParam),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Query lấy số lượng chưa đọc
  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    // Refresh mỗi 1 phút hoặc khi focus lại app (tùy chọn)
    refetchInterval: 60000, 
  });

  // Mutation đánh dấu đã đọc
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      // Refresh dữ liệu sau khi đánh dấu
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  // Mutation đánh dấu tất cả đã đọc
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  return {
    notificationsQuery,
    unreadCountQuery,
    markAsReadMutation,
    markAllAsReadMutation,
  };
};
