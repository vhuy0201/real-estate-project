import { Request, Response } from "express";
import { propertyService } from "../../../services/property.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { assignmentService } from "../../../services/assignment.service";

export async function listBuyerPurchasedProperties(req: Request, res: Response) {
  try {
    const buyerId = req.user?.id;

    if (!buyerId) {
      return errorResponse(res, "buyer_id_required", 400);
    }

    const properties = await propertyService.getBuyerPurchasedProperties(buyerId);

    return successResponse(res, "buyer_properties_listed", properties);
  } catch (err) {
    console.error("Get buyer properties error:", err);
    return errorResponse(res, "internal_server_error", 500);
  }
}

// agent gửi yêu cầu quản lý property
export const agentRequestManage = async (req: Request, res: Response) => {
  try {
    const agent = (req as any).user;
    const propertyId = req.params.id;
    const { note } = req.body;

    const doc = await assignmentService.agentRequestManage(
      propertyId,
      agent.id || agent._id,
      note
    );

    return successResponse(req, res, "Agent gửi yêu cầu quản lý thành công", doc);
  } catch (error: any) {
    console.error("agentRequestManage error:", error);
    return errorResponse(req, res, error.message, error.status || 500);
  }
};

