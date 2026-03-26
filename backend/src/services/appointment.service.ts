import mongoose from "mongoose";
import Appointment, {
  AppointmentStatus,
  AppointmentTimeSlot,
} from "../models/appointment.model";
import Property from "../models/property.model";
import User from "../models/user.model";
import {
  notifyNewAppointment,
  notifySellerNewAppointment,
  notifyAppointmentCancelled,
  notifyAppointmentStatusToBuyerAndSeller,
  notifyAppointmentCompleted,
} from "../utils/notificationHelper";

interface AppointmentTimeInput {
  time: string | Date;
  note?: string;
}

interface CreateAppointmentParams {
  propertyId: string;
  buyerId: string;
  times: AppointmentTimeInput[];
  location?: string;
}

interface BuyerAppointmentFilters {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  property_id?: string;
}

interface AgentAppointmentFilters {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  property_id?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

function ensureValidObjectId(id: string, message: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw Object.assign(new Error(message), { status: 400 });
  }
}

function formatDateTimeVi(date: Date) {
  return date.toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatTimesSummary(slots: AppointmentTimeSlot[]) {
  return slots
    .map((slot, index) => {
      const label = `${index + 1}. ${formatDateTimeVi(slot.time)}`;
      return slot.note ? `${label} — ${slot.note}` : label;
    })
    .join("\n");
}

function normalizeTimeSlots(times: AppointmentTimeInput[]): AppointmentTimeSlot[] {
  if (!Array.isArray(times) || times.length === 0) {
    throw Object.assign(new Error("Vui lòng cung cấp danh sách khung giờ"), {
      status: 400,
    });
  }

  if (times.length > 3) {
    throw Object.assign(new Error("Chỉ được chọn tối đa 3 khung giờ"), {
      status: 400,
    });
  }

  const now = new Date();

  const normalized = times.map((slot) => {
    if (!slot || !slot.time) {
      throw Object.assign(new Error("Khung giờ thiếu thông tin thời gian"), {
        status: 400,
      });
    }

    const parsedTime = new Date(slot.time);
    if (Number.isNaN(parsedTime.valueOf())) {
      throw Object.assign(new Error("Thời gian không hợp lệ"), { status: 400 });
    }
    if (parsedTime <= now) {
      throw Object.assign(
        new Error("Thời gian lịch hẹn phải ở tương lai"),
        { status: 400 }
      );
    }

    return {
      time: parsedTime,
      note: slot.note,
    };
  });

  const seen = new Set<number>();
  normalized.forEach((slot) => {
    const value = slot.time.getTime();
    if (seen.has(value)) {
      throw Object.assign(new Error("Các khung giờ không được trùng nhau"), {
        status: 400,
      });
    }
    seen.add(value);
  });

  return normalized.sort((a, b) => a.time.getTime() - b.time.getTime());
}

export const appointmentService = {
  async createAppointment(params: CreateAppointmentParams) {
    const { propertyId, buyerId, times, location } = params;

    ensureValidObjectId(propertyId, "Property ID không hợp lệ");
    ensureValidObjectId(buyerId, "Buyer ID không hợp lệ");
    const normalizedTimes = normalizeTimeSlots(times);

    const property = await Property.findOne({
      _id: propertyId,
      deleted: false,
    })
      .select("title owner_id agent_id status")
      .lean();

    if (!property) {
      throw Object.assign(new Error("Property không tồn tại"), { status: 404 });
    }

    if (!property.agent_id) {
      throw Object.assign(
        new Error("Property chưa được chỉ định agent"),
        { status: 400 }
      );
    }

    const sellerId = property.owner_id?.toString();
    if (!sellerId) {
      throw Object.assign(
        new Error("Không xác định được seller của property"),
        { status: 400 }
      );
    }

    const existingActive = await Appointment.findOne({
      property_id: new mongoose.Types.ObjectId(propertyId),
      buyer_id: new mongoose.Types.ObjectId(buyerId),
      status: { $in: ["pending", "accepted"] },
    }).lean();

    if (existingActive) {
      throw Object.assign(
        new Error("Bạn đã có lịch hẹn đang chờ xử lý cho bất động sản này"),
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      property_id: new mongoose.Types.ObjectId(propertyId),
      buyer_id: new mongoose.Types.ObjectId(buyerId),
      agent_id: property.agent_id,
      seller_id: new mongoose.Types.ObjectId(sellerId),
      times: normalizedTimes,
      final_time: null,
      location,
      status: "pending",
    });

    const buyer = await User.findById(buyerId).select("fullName").lean();
    const buyerName = buyer?.fullName || "Người mua";
    const propertyTitle =
      (property.title as any)?.vi ||
      (property.title as any)?.en ||
      "Bất động sản";
    const timesSummary = formatTimesSummary(normalizedTimes);

    try {
      const appointmentId = appointment.id;
      await notifyNewAppointment(
        property.agent_id.toString(),
        buyerName,
        propertyTitle,
        appointmentId,
        timesSummary
      );

      await notifySellerNewAppointment(
        sellerId,
        buyerName,
        propertyTitle,
        appointmentId,
        timesSummary
      );
    } catch (error) {
      console.error("Failed to send appointment notifications:", error);
    }

    return appointment.populate([
      { path: "property_id", select: "title images price status address" },
      { path: "agent_id", select: "fullName email phone avatar" },
      { path: "seller_id", select: "fullName email phone avatar" },
    ]);
  },

  async getAppointmentsByBuyer(
    buyerId: string,
    filters: BuyerAppointmentFilters = {}
  ) {
    ensureValidObjectId(buyerId, "Buyer ID không hợp lệ");

    const { page = 1, limit = 10, status, property_id } = filters;
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, any> = {
      buyer_id: new mongoose.Types.ObjectId(buyerId),
    };

    if (status) {
      query.status = status;
    }

    if (property_id) {
      ensureValidObjectId(property_id, "Property ID không hợp lệ");
      query.property_id = new mongoose.Types.ObjectId(property_id);
    }

    const [items, total] = await Promise.all([
      Appointment.find(query)
        .sort({ "times.0.time": 1 })
        .skip(skip)
        .limit(limitNum)
        .populate("property_id", "title images price address status")
        .populate("agent_id", "fullName email phone avatar")
        .populate("seller_id", "fullName email phone avatar")
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: items,
    };
  },

  async cancelAppointment(appointmentId: string, buyerId: string) {
    ensureValidObjectId(appointmentId, "Appointment ID không hợp lệ");
    ensureValidObjectId(buyerId, "Buyer ID không hợp lệ");

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      buyer_id: buyerId,
    });

    if (!appointment) {
      throw Object.assign(new Error("Lịch hẹn không tồn tại"), { status: 404 });
    }

    if (appointment.status !== "pending") {
      throw Object.assign(
        new Error("Chỉ có thể hủy lịch hẹn đang ở trạng thái pending"),
        { status: 400 }
      );
    }

    appointment.status = "cancelled";
    await appointment.save();

    const [populatedAppointment, buyer, property] = await Promise.all([
      appointment.populate([
        { path: "property_id", select: "title" },
        { path: "agent_id", select: "fullName email phone avatar" },
        { path: "seller_id", select: "fullName email phone avatar" },
      ]),
      User.findById(buyerId).select("fullName").lean(),
      Property.findById(appointment.property_id).select("title").lean(),
    ]);

    const buyerName = buyer?.fullName || "Người mua";
    const propertyTitle =
      (property?.title as any)?.vi ||
      (property?.title as any)?.en ||
      "bất động sản";

    try {
      const appointmentId = appointment.id;
      await notifyAppointmentCancelled(
        appointment.agent_id.toString(),
        appointment.seller_id.toString(),
        buyerName,
        propertyTitle,
        appointmentId
      );
    } catch (error) {
      console.error("Failed to notify appointment cancellation:", error);
    }

    return populatedAppointment;
  },

  async getAppointmentsByAgent(
    agentId: string,
    filters: AgentAppointmentFilters = {}
  ) {
    ensureValidObjectId(agentId, "Agent ID không hợp lệ");

    const { page = 1, limit = 10, status, property_id, startDate, endDate } = filters;
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, any> = {
      agent_id: new mongoose.Types.ObjectId(agentId),
    };

    if (status) {
      query.status = status;
    }

    if (property_id) {
      ensureValidObjectId(property_id, "Property ID không hợp lệ");
      query.property_id = new mongoose.Types.ObjectId(property_id);
    }

    if (startDate || endDate) {
      query["times.time"] = {};
      if (startDate) {
        query["times.time"].$gte = new Date(startDate);
      }
      if (endDate) {
        query["times.time"].$lte = new Date(endDate);
      }
    }

    const [items, total] = await Promise.all([
      Appointment.find(query)
        .sort({ "times.0.time": 1 })
        .skip(skip)
        .limit(limitNum)
        .populate("property_id", "title images price address status")
        .populate("buyer_id", "fullName email phone avatar")
        .populate("seller_id", "fullName email phone avatar")
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: items,
    };
  },

  async acceptAppointment(
    appointmentId: string,
    agentId: string,
    selectedTime: string | Date
  ) {
    ensureValidObjectId(appointmentId, "Appointment ID không hợp lệ");
    ensureValidObjectId(agentId, "Agent ID không hợp lệ");

    if (!selectedTime) {
      throw Object.assign(new Error("Vui lòng chọn thời gian cần chốt"), { status: 400 });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      agent_id: agentId,
    });

    if (!appointment) {
      throw Object.assign(new Error("Lịch hẹn không tồn tại hoặc không thuộc quyền quản lý của bạn"), { status: 404 });
    }

    if (appointment.status !== "pending") {
      throw Object.assign(
        new Error("Chỉ có thể chấp nhận lịch hẹn đang ở trạng thái pending"),
        { status: 400 }
      );
    }

    const targetTime = new Date(selectedTime);
    if (Number.isNaN(targetTime.valueOf())) {
      throw Object.assign(new Error("Thời gian chốt không hợp lệ"), { status: 400 });
    }

    const matchedSlot = appointment.times?.find(
      (slot) => slot.time && slot.time.getTime() === targetTime.getTime()
    );

    if (!matchedSlot) {
      throw Object.assign(
        new Error("Thời gian chốt không nằm trong danh sách đề xuất"),
        { status: 400 }
      );
    }

    appointment.final_time = matchedSlot.time;
    appointment.status = "accepted";
    await appointment.save();

    const [populatedAppointment, agent, property] = await Promise.all([
      appointment.populate([
        { path: "property_id", select: "title" },
        { path: "buyer_id", select: "fullName email phone avatar" },
        { path: "seller_id", select: "fullName email phone avatar" },
      ]),
      User.findById(agentId).select("fullName").lean(),
      Property.findById(appointment.property_id).select("title").lean(),
    ]);

    const agentName = agent?.fullName || "Agent";
    const propertyTitle =
      (property?.title as any)?.vi ||
      (property?.title as any)?.en ||
      "bất động sản";

    const finalTimeText = appointment.final_time
      ? formatDateTimeVi(appointment.final_time)
      : undefined;

    try {
      const appointmentIdStr = appointment.id;
      await notifyAppointmentStatusToBuyerAndSeller(
        appointment.buyer_id.toString(),
        appointment.seller_id.toString(),
        agentName,
        propertyTitle,
        "accepted",
        appointmentIdStr,
        finalTimeText
      );
    } catch (error) {
      console.error("Failed to notify appointment acceptance:", error);
    }

    return populatedAppointment;
  },

  async rejectAppointment(appointmentId: string, agentId: string, reason?: string) {
    ensureValidObjectId(appointmentId, "Appointment ID không hợp lệ");
    ensureValidObjectId(agentId, "Agent ID không hợp lệ");

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      agent_id: agentId,
    });

    if (!appointment) {
      throw Object.assign(new Error("Lịch hẹn không tồn tại hoặc không thuộc quyền quản lý của bạn"), { status: 404 });
    }

    if (appointment.status !== "pending") {
      throw Object.assign(
        new Error("Chỉ có thể từ chối lịch hẹn đang ở trạng thái pending"),
        { status: 400 }
      );
    }

    appointment.status = "rejected";
    appointment.final_time = null;
    await appointment.save();

    const [populatedAppointment, agent, property] = await Promise.all([
      appointment.populate([
        { path: "property_id", select: "title" },
        { path: "buyer_id", select: "fullName email phone avatar" },
        { path: "seller_id", select: "fullName email phone avatar" },
      ]),
      User.findById(agentId).select("fullName").lean(),
      Property.findById(appointment.property_id).select("title").lean(),
    ]);

    const agentName = agent?.fullName || "Agent";
    const propertyTitle =
      (property?.title as any)?.vi ||
      (property?.title as any)?.en ||
      "bất động sản";

    try {
      const appointmentIdStr = appointment.id;
      await notifyAppointmentStatusToBuyerAndSeller(
        appointment.buyer_id.toString(),
        appointment.seller_id.toString(),
        agentName,
        propertyTitle,
        "rejected",
        appointmentIdStr
      );
    } catch (error) {
      console.error("Failed to notify appointment rejection:", error);
    }

    return populatedAppointment;
  },
  async completeAppointment(appointmentId: string, agentId: string) {
    ensureValidObjectId(appointmentId, "Appointment ID không hợp lệ");
    ensureValidObjectId(agentId, "Agent ID không hợp lệ");
  
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      agent_id: agentId,
    });
  
    if (!appointment) {
      throw Object.assign(
        new Error("Không tìm thấy lịch hẹn hoặc không thuộc quyền quản lý của bạn"),
        { status: 404 }
      );
    }
  
    if (appointment.status !== "accepted") {
      throw Object.assign(
        new Error("Chỉ có thể hoàn tất lịch hẹn ở trạng thái 'accepted'"),
        { status: 400 }
      );
    }
    if (!appointment.final_time) {
      throw Object.assign(
        new Error("Lịch hẹn chưa có thời gian chốt để hoàn tất"),
        { status: 400 }
      );
    }
    if (appointment.final_time > new Date()) {
      throw Object.assign(
        new Error("Chưa thể hoàn tất lịch hẹn trước khi diễn ra"),
        { status: 400 }
      );
    }
    appointment.status = "completed";
    await appointment.save();
   
    const [agent, property] = await Promise.all([
      User.findById(agentId).select("fullName").lean(),
      Property.findById(appointment.property_id).select("title").lean(),
    ]);
  
    const agentName = agent?.fullName || "Agent";
  
    const propertyTitle =
      (property?.title as any)?.vi ||
      (property?.title as any)?.en ||
      "bất động sản";
  
    
    try {
      const finalTimeText = formatDateTimeVi(appointment.final_time);
      await notifyAppointmentCompleted({
        buyerId: appointment.buyer_id.toString(),
        sellerId: appointment.seller_id.toString(),
        agentName,
        propertyTitle,
        appointmentId: appointment.id,
        finalTimeText,
      });
    } catch (error) {
      console.error("Failed to notify appointment completion:", error);
    }
  
    return appointment;
  },
};

