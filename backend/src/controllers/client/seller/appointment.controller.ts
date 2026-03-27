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

export const getSellerAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.id || req.user?._id;
    if (!sellerId) {
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

    const result = await appointmentService.getAppointmentsBySeller(String(sellerId), filters);
    return successResponse(req, res, "Lấy danh sách lịch hẹn thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};
