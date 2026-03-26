// src/controllers/client/common/notification.controller.ts
import { Request, Response } from "express";
import { notificationService } from "../../../services/notification.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { NotificationType } from "../../../models/notification.model";

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return errorResponse(req, res, "User ID not found", 401);
    }

    const { page, limit, is_read, type } = req.query;

    const filters: any = {};
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);
    if (is_read !== undefined) filters.is_read = is_read === "true";
    if (type) filters.type = type as NotificationType;
    const lang = req.language || "vi";

    const result = await notificationService.getNotifications(userId, filters, lang);
    return successResponse(req, res, "Lấy danh sách notifications thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return errorResponse(req, res, "User ID not found", 401);
    }

    const { id } = req.params;
    const result = await notificationService.markAsRead(id, userId);
    return successResponse(req, res, "Đánh dấu đã đọc thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return errorResponse(req, res, "User ID not found", 401);
    }

    const result = await notificationService.markAllAsRead(userId);
    return successResponse(req, res, "Đánh dấu tất cả đã đọc thành công", {
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

export const getUnreadCount = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return errorResponse(req, res, "User ID not found", 401);
    }

    const count = await notificationService.getUnreadCount(userId);
    return successResponse(req, res, "Lấy số lượng notifications chưa đọc thành công", {
      unreadCount: count,
    });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};