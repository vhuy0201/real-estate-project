import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utils/responseHandler";
import { paymentAdminService } from "../../services/admin/payment.admin.service";

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await paymentAdminService.getPayments(req.query);
    return successResponse(req, res, "Lấy danh sách thanh toán thành công", { data, pagination });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    if (!paymentData.processed_by) {
      paymentData.processed_by = (req as any).user?._id;
    }

    const { payment, deal } = await paymentAdminService.createPayment(paymentData);

    return successResponse(req, res, "Tạo thanh toán thành công", { payment, deal });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentAdminService.getPaymentById(id);

    if (!payment) return errorResponse(req, res, "Không tìm thấy thanh toán", 404);

    return successResponse(req, res, "Lấy chi tiết thanh toán thành công", payment);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.status && !updateData.processed_by) {
      updateData.processed_by = (req as any).user?._id;
    }

    const { payment, deal } = await paymentAdminService.updatePayment(id, updateData);

    return successResponse(req, res, "Cập nhật thanh toán thành công", { payment, deal });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await paymentAdminService.deletePayment(id);
    return successResponse(req, res, "Xóa thanh toán thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};
