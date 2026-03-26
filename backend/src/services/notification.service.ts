// src/services/notification.service.ts
import Notification, { NotificationType } from "../models/notification.model";
import mongoose from "mongoose";
import { createMultilangText } from "../utils/translateHelper";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  relatedId?: string;
  actionUrl?: string;
  meta?: Record<string, any>;
}

export const notificationService = {
  async createNotification(params: CreateNotificationParams) {
    const {
      userId,
      title,
      message,
      type = "system",
      relatedId,
      actionUrl,
      meta,
    } = params;

    const [titleMultilang, messageMultilang] = await Promise.all([
      createMultilangText(title),
      createMultilangText(message),
    ]);

    const relatedObjectId =
      relatedId && mongoose.Types.ObjectId.isValid(relatedId)
        ? new mongoose.Types.ObjectId(relatedId)
        : undefined;

    const notification = await Notification.create({
      user_id: new mongoose.Types.ObjectId(userId),
      title: titleMultilang,
      message: messageMultilang,
      type,
      related_id: relatedObjectId,
      action_url: actionUrl,
      meta,
      is_read: false,
    });

    return notification;
  },

  async getNotifications(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      is_read?: boolean;
      type?: NotificationType;
    } = {},
    lang: "vi" | "en" = "vi"
  ) {
    const { page = 1, limit = 10, is_read, type } = filters;
    const skip = (page - 1) * limit;

    const query: any = { user_id: new mongoose.Types.ObjectId(userId) };
    if (is_read !== undefined) query.is_read = is_read;
    if (type) query.type = type;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    const data = notifications.map((n) => ({
      ...n,
      title: n.title,
      message: n.message,
    }));

    return {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: data,
    };
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user_id: userId,
    });

    if (!notification) {
      const err: any = new Error("Notification not found");
      err.status = 404;
      throw err;
    }

    notification.is_read = true;
    await notification.save();

    return notification;
  },

  async markAllAsRead(userId: string) {
    const result = await Notification.updateMany(
      { user_id: new mongoose.Types.ObjectId(userId), is_read: false },
      { is_read: true }
    );

    return result;
  },

  async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({
      user_id: new mongoose.Types.ObjectId(userId),
      is_read: false,
    });

    return count;
  },
};
