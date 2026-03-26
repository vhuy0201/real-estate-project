import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { assignmentService } from "../../../services/assignment.service";

export const createAssignmentRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const propertyId = req.params.id;
    const { agent_id, note } = req.body;
    if (!agent_id) return errorResponse(req, res, "Thiếu agent_id", 400);

    const doc = await assignmentService.createRequest(propertyId, agent_id, user.id || user._id, note);
    return successResponse(req, res, "Tạo yêu cầu gán agent thành công", doc);
  } catch (error: any) {
    console.error("createAssignmentRequest error:", error);
    return errorResponse(req, res, error.message, error.status || 500);
  }
};

export const cancelAssignmentRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const doc = await assignmentService.cancelRequest(id, user.id || user._id);
    return successResponse(req, res, "Hủy yêu cầu gán agent thành công", doc);
  } catch (error: any) {
    console.error("cancelAssignmentRequest error:", error);
    return errorResponse(req, res, error.message, error.status || 500);
  }
};


export const listRequestsForSeller = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // seller
    const filters = req.query;

    const data = await assignmentService.getRequestsForSeller(
      user.id || user._id,
      filters
    );

    return successResponse(req, res, "Danh sách yêu cầu từ agent", data);
  } catch (err: any) {
    return errorResponse(req, res, err.message, err.status || 500);
  }
};

export const sellerAcceptRequest = async (req: Request, res: Response) => {
  try {
    const seller = (req as any).user;
    const { id } = req.params;

    const result = await assignmentService.sellerAcceptRequest(
      id,
      seller.id || seller._id
    );

    return successResponse(req, res, "Seller đã chấp nhận yêu cầu", result);
  } catch (err: any) {
    return errorResponse(req, res, err.message, err.status || 500);
  }
};

export const sellerRejectRequest = async (req: Request, res: Response) => {
  try {
    const seller = (req as any).user;
    const { id } = req.params;
    const { reason } = req.body;

    const result = await assignmentService.sellerRejectRequest(
      id,
      seller.id || seller._id,
      reason
    );

    return successResponse(req, res, "Seller đã từ chối yêu cầu", result);
  } catch (err: any) {
    return errorResponse(req, res, err.message, err.status || 500);
  }
};
