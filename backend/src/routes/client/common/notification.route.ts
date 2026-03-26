// src/routes/client/common/notification.route.ts
import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../../../controllers/client/common/notification.controller";

const router = express.Router();

// GET /api/client/notifications - Lấy danh sách notifications
router.get("", verifyToken, getNotifications);

// GET /api/client/notifications/unread-count - Lấy số lượng chưa đọc
router.get("/unread-count", verifyToken, getUnreadCount);

// PATCH /api/client/notifications/:id/read - Đánh dấu đã đọc
router.patch("/:id/read", verifyToken, markAsRead);

// PATCH /api/client/notifications/read-all - Đánh dấu tất cả đã đọc
router.patch("/read-all", verifyToken, markAllAsRead);

export default router;