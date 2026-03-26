import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import * as paymentService from "../../../services/payment.service";

export const getSellerPayments = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user?.id;
    if (!sellerId) return errorResponse(req, res, "Unauthorized", 401);

    const filters = {
      dealId: req.query.dealId as string,
      type: req.query.type as string,
      status: req.query.status as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const result = await paymentService.getPaymentsBySeller(sellerId, filters);

    return successResponse(req, res, "Lấy danh sách payments thành công", result);
  } catch (err: any) {
    console.error("getSellerPayments error", err);
    return errorResponse(req, res, err.message || "Lỗi", err.status || 500);
  }
};
