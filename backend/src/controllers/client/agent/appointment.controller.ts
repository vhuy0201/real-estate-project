import { Request, Response } from "express";
import { appointmentService } from "../../../services/appointment.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { AppointmentStatus } from "../../../models/appointment.model";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
    role?: string;
  };
}

export const getMyAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.user?.id || req.user?._id;
    if (!agentId) {
      return errorResponse(req, res, "Unauthorized", 401);
    }

    const { page, limit, status, property_id, startDate, endDate } = req.query || {};

    const filters: any = {};
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);
    if (status) filters.status = status as AppointmentStatus;
    if (property_id) filters.property_id = String(property_id);
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await appointmentService.getAppointmentsByAgent(String(agentId), filters);
    return successResponse(req, res, "Lấy danh sách lịch hẹn thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

export const acceptAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.user?.id || req.user?._id;
    if (!agentId) {
      return errorResponse(req, res, "Unauthorized", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Appointment ID không hợp lệ", 400);
    }

    const { selectedTime } = req.body || {};
    if (!selectedTime) {
      return errorResponse(req, res, "Vui lòng chọn thời gian cần chốt", 400);
    }

    const appointment = await appointmentService.acceptAppointment(
      String(id),
      String(agentId),
      selectedTime
    );
    return successResponse(req, res, "Chấp nhận lịch hẹn thành công", appointment);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

export const rejectAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.user?.id || req.user?._id;
    if (!agentId) {
      return errorResponse(req, res, "Unauthorized", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Appointment ID không hợp lệ", 400);
    }

    const { reason } = req.body || {};

    const appointment = await appointmentService.rejectAppointment(
      String(id),
      String(agentId),
      reason
    );
    return successResponse(req, res, "Từ chối lịch hẹn thành công", appointment);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};
export const completeAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const appointment = await appointmentService.completeAppointment(String(id), String(agentId));
    return successResponse(req, res, "Đánh dấu hoàn tất lịch hẹn thành công", appointment);
  } catch (error: any) {
    return errorResponse(req, res, error.message, error.status);
  }
};


