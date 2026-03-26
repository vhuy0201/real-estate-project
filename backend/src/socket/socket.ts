// src/socket/socket.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { notificationService } from "../services/notification.service";

const userSocketMap = new Map<string, string>();

const socketUserMap = new Map<string, string>();

let ioInstance: Server | null = null;

/**
 * Authenticate socket connection bằng JWT
 */
function authenticateSocket(socket: Socket): string | null {
  try {
    // Lấy token từ auth object hoặc headers
    const token = 
      socket.handshake.auth.token || 
      socket.handshake.headers.authorization?.split(" ")[1] ||
      socket.handshake.query.token as string;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return decoded.id || decoded._id;
  } catch (error) {
    console.error("Socket authentication error:", error);
    return null;
  }
}

/**
 * Emit notification đến user cụ thể
 */
export function emitNotification(userId: string, notification: any) {
  if (!ioInstance) return;
  
  ioInstance.to(`user:${userId}`).emit("new_notification", notification);
  console.log(`[Socket] Emitted 'new_notification' to room: ${`user:${userId}`}`);
  
  // Emit unread count update
  notificationService.getUnreadCount(userId).then((count) => {
    ioInstance?.to(`user:${userId}`).emit("unread_count_update", { unreadCount: count });
    console.log(`[Socket] Emitted 'unread_count_update' to room: ${`user:${userId}`}`);
  }).catch((err) => {
    console.error("Error getting unread count:", err);
  });
}

/**
 * Emit notification đến nhiều users
 */
export function emitNotificationsToUsers(userIds: string[], notification: any) {
  if (!ioInstance) return;
  
  userIds.forEach((userId) => {
    emitNotification(userId, notification);
  });
}

/**
 * Get Socket.IO instance
 */
export function getIO(): Server | null {
  return ioInstance;
}

export function isUserOnline(userId: string): boolean {
  return userSocketMap.has(userId);
}

/**
 * Setup Socket.IO server cho notifications
 */
export function setupSocketIO(io: Server) {
  ioInstance = io;

  // Middleware để authenticate
  io.use((socket, next) => {
    const userId = authenticateSocket(socket);
    if (!userId) {
      return next(new Error("Authentication failed"));
    }
    (socket as any).userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`✅ User ${userId} connected: ${socket.id}`);

    userSocketMap.set(userId, socket.id);
    socketUserMap.set(socket.id, userId);

    socket.join(`user:${userId}`);

    // Event: Client yêu cầu unread count khi connect
    socket.on("get_unread_count", async () => {
      try {
        const unreadCount = await notificationService.getUnreadCount(userId);
        socket.emit("unread_count_update", { unreadCount });
      } catch (error: any) {
        console.error("Error getting unread count:", error);
      }
    });

    // Event: Client đánh dấu notification đã đọc
    socket.on("notification_read", async (data: { notificationId: string }) => {
      try {
        const { notificationId } = data;
        await notificationService.markAsRead(notificationId, userId);
        
        // Emit unread count update
        const unreadCount = await notificationService.getUnreadCount(userId);
        socket.emit("unread_count_update", { unreadCount });
      } catch (error: any) {
        console.error("Error marking notification as read:", error);
        socket.emit("error", { 
          message: error.message || "Failed to mark notification as read" 
        });
      }
    });

    // Event: Client đánh dấu tất cả notifications đã đọc
    socket.on("mark_all_notifications_read", async () => {
      try {
        await notificationService.markAllAsRead(userId);
        const unreadCount = await notificationService.getUnreadCount(userId);
        socket.emit("unread_count_update", { unreadCount });
      } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        socket.emit("error", { 
          message: error.message || "Failed to mark all as read" 
        });
      }
    });


    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected: ${socket.id}`);
      userSocketMap.delete(userId);
      socketUserMap.delete(socket.id);
    });
  });
}