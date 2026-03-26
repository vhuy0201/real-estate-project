import { Request, Response } from "express";
import { adminPropertyService } from "../../services/admin/property.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";

export const approveOrRejectProperty = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: "approved" | "rejected" };
    const adminId = req.user?.id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return errorResponse(res, "status must be 'approved' or 'rejected'", 400);
    }

    const result = await adminPropertyService.updateStatus(id, status, adminId);
    return successResponse(res, `Property ${status} successfully`, result);
  } catch (err: any) {
    return errorResponse(
      res,
      err.message || "Failed to update property status",
      err.status || 500
    );
  }
};

export const adminListProperties = async (req: Request, res: Response) => {
  try {
    const data = await adminPropertyService.list({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10),
      status: (req.query.status as string) || undefined,
    });
    return successResponse(res, "Danh sách property (admin)", data);
  } catch (err: any) {
    return errorResponse(
      res,
      err.message || "Failed to list properties",
      err.status || 500
    );
  }
};

export const hideProperty = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { note } = req.body as { note?: string };
    const result = await adminPropertyService.hide(id, adminId, note);
    return successResponse(res, "Ẩn bài đăng thành công", result);
  } catch (err: any) {
    return errorResponse(
      res,
      err.message || "Failed to hide property",
      err.status || 500
    );
  }
};

export const restoreProperty = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const result = await adminPropertyService.restore(id, adminId);
    return successResponse(res, "Khôi phục bài đăng thành công", result);
  } catch (err: any) {
    return errorResponse(
      res,
      err.message || "Failed to restore property",
      err.status || 500
    );
  }
};

// Lấy chi tiết property theo ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await adminPropertyService.getPropertyById(id);

    // Nếu tìm thấy -> trả kết quả thành công
    return successResponse(
      req,
      res,
      "Lấy chi tiết bất động sản thành công.",
      property
    );
  } catch (error: any) {
    console.error("Lỗi khi lấy chi tiết property:", error.message);
    return errorResponse(
      req,
      res,
      error.message || "Không thể lấy thông tin bất động sản.",
      error.status || 500
    );
  }
};