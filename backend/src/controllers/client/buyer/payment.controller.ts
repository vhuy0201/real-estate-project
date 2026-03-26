// src/controllers/client/buyer/payment.controller.ts
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import * as paymentService from "../../../services/payment.service";

export const getBuyerPayments = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as any).user?.id;
    if (!buyerId) return errorResponse(req, res, "Unauthorized", 401);

    const filters = {
      dealId: req.query.dealId as string,
      type: req.query.type as string,
      status: req.query.status as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const result = await paymentService.getPaymentsByBuyer(buyerId, filters);

    return successResponse(req, res, "Lấy danh sách payments thành công", result);
  } catch (err: any) {
    console.error("getBuyerPayments error", err);
    return errorResponse(req, res, err.message || "Lỗi", err.status || 500);
  }
};


// Buyer creates escrow payment (returns QR)
export const createEscrowPayment = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as any).user?.id;
    const { dealId } = req.body;
    if (!buyerId) return errorResponse(req, res, "Unauthorized", 401);
    if (!dealId) return errorResponse(req, res, "Thiếu dealId", 400);

    const result = await paymentService.createEscrowPayment(buyerId, dealId);
    return successResponse(req, res, "Tạo QR thanh toán thành công", result);
  } catch (err: any) {
    console.error("createEscrowPayment error", err);
    return errorResponse(req, res, err.message || "Lỗi", err.status || 500);
  }
};

/**
 * PayOS webhook endpoint (public)
 * Example payload: { paymentId: "...", status: "success", externalRef: "..." }
 * In production: verify signature from header using PAYOS_WEBHOOK_SECRET
 */
export const payosWebhook = async (req: Request, res: Response) => {
  try {
    const { paymentId, status, externalRef } = req.body;

    if (!paymentId) return errorResponse(req, res, "payment_id_missing", 400);

    if (status !== "success") {
      // acknowledge non-success but do nothing
      return successResponse(req, res, "webhook_received");
    }

    const payment = await paymentService.confirmEscrowPayment(paymentId, { externalRef, paidAt: new Date() });

    return successResponse(req, res, "payment_webhook_processed", { paymentId: String(payment._id) });
  } catch (err: any) {
    console.error("payosWebhook error", err);
    return errorResponse(req, res, "webhook_processing_failed", 500);
  }
};

/**
 * Admin release endpoint (admin role required)
 * POST /payments/:dealId/release
 */
export const releaseEscrowController = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const { dealId } = req.params;
    if (!adminId) return errorResponse(req, res, "Unauthorized", 401);

    const result = await paymentService.releaseEscrow(adminId, dealId);
    return successResponse(req, res, "Đã giải ngân escrow", result);
  } catch (err: any) {
    console.error("releaseEscrowController error", err);
    return errorResponse(req, res, err.message || "Release failed", err.status || 500);
  }
};

export const getPaymentsByDealId = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as any).user?.id;
    const { dealId } = req.params;

    if (!buyerId) return errorResponse(req, res, "Unauthorized", 401);
    if (!dealId) return errorResponse(req, res, "Thiếu dealId", 400);

    const result = await paymentService.getPaymentsByDealId(buyerId, dealId);

    return successResponse(req, res, "Lấy thông tin thanh toán theo deal thành công", result);
  } catch (err: any) {
    console.error("getPaymentsByDealId error", err);
    return errorResponse(req, res, err.message || "Lỗi", err.status || 500);
  }
};
