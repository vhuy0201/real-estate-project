// src/controllers/client/agent/assignment.controller.ts
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { assignmentService } from "../../../services/assignment.service";

export const listMyRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const filters = req.query;
    const data = await assignmentService.getRequestsForAgent(user.id || user._id, filters);
    return successResponse(req, res, "Danh sách yêu cầu", data);
  } catch (err: any) { return errorResponse(req, res, err.message, err.status || 500); }
};

export const acceptRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const result = await assignmentService.acceptRequest(id, user.id || user._id);
    return successResponse(req, res, "Đã chấp nhận yêu cầu", result);
  } catch (err: any) { return errorResponse(req, res, err.message, err.status || 500); }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { reason } = req.body;
    const result = await assignmentService.rejectRequest(id, user.id || user._id, reason);
    return successResponse(req, res, "Đã từ chối yêu cầu", result);
  } catch (err: any) { return errorResponse(req, res, err.message, err.status || 500); }
};

export const cancelAssignmentByAgent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const result = await assignmentService.cancelRequestByAgent(
      id,
      user.id || user._id
    );

    return successResponse(req, res, "Agent đã hủy yêu cầu thành công", result);
  } catch (error: any) {
    console.error("cancelAssignmentByAgent error:", error);
    return errorResponse(req, res, error.message, error.status || 500);
  }
};

