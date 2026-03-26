import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utils/responseHandler";
import { dealAdminService } from "../../services/admin/deal.admin.service";
import { DealStatus } from "../../models/deal.model";

const VALID_DEAL_STATUSES: DealStatus[] = [
  "active",
  "awaiting_contract",
  "contract_under_review",
  "escrow_funded",
  "completed",
  "cancelled",
];

// GET /api/admin/deals
export const getDeals = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await dealAdminService.getDeals(req.query);
    return successResponse(req, res, "Lấy danh sách deals thành công", { data, pagination });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

// GET /api/admin/deals/:id
export const getDealById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deal = await dealAdminService.getDealById(id);

    if (!deal) {
      return errorResponse(req, res, "Không tìm thấy deal", 404);
    }

    return successResponse(req, res, "Lấy chi tiết deal thành công", deal);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

// PATCH /api/admin/deals/:id/status
export const updateDealStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason } = req.body;

    if (!status || !VALID_DEAL_STATUSES.includes(status)) {
      return errorResponse(req, res, "Trạng thái không hợp lệ", 400);
    }

    const adminName = (req as any).user?.fullName || "Admin";

    const updatedDeal = await dealAdminService.updateDealStatus(
      id,
      status,
      adminName,
      cancellation_reason
    );

    return successResponse(req, res, "Cập nhật trạng thái deal thành công", updatedDeal);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};
