import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { dealService } from "../../../services/deal.service";
import { DealStatus } from "../../../models/deal.model";

const getUserIdFromRequest = (req: Request) => {
  const user = (req as any).user;
  return user?.id || user?._id;
};

export const getMyDealById = async (req: Request, res: Response) => {
  try {
    const sellerId = getUserIdFromRequest(req);
    const { dealId } = req.params;

    if (!sellerId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    const deal = await dealService.getDealForSeller(dealId, String(sellerId));
    if (!deal) {
      return errorResponse(req, res, "Deal không tồn tại hoặc bạn không có quyền truy cập", 404);
    }

    return successResponse(req, res, "Lấy deal thành công", deal);
  } catch (error: any) {
    console.error("getMyDealById (seller) error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Lấy deal thất bại", status);
  }
};

export const getMyDeals = async (req: Request, res: Response) => {
  try {
    const sellerId = getUserIdFromRequest(req);
    if (!sellerId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    const { status, property_id, fromDate, toDate } = req.query;

    const deals = await dealService.getDealsForSeller(String(sellerId), {
      status: status as DealStatus | undefined,
      propertyId: property_id as string | undefined,
      fromDate: fromDate as string | undefined,
      toDate: toDate as string | undefined,
    });

    return successResponse(req, res, "Lấy danh sách deal thành công", deals);
  } catch (error: any) {
    console.error("getMyDeals (seller) error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Lấy danh sách deal thất bại", status);
  }
};