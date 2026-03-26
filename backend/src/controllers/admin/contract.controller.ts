// src/controllers/admin/contract.controller.ts
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utils/responseHandler";
import { contractAdminService } from "../../services/admin/contract.admin.service";

const getAdminIdFromRequest = (req: Request) => {
  const user = (req as any).user;
  return user?._id || user?.id;
};

// GET /api/admin/contracts
export const getContracts = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await contractAdminService.getContracts(req.query);
    return successResponse(req, res, "Lấy danh sách hợp đồng thành công", { data, pagination });
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

// GET /api/admin/contracts/:id
export const getContractById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await contractAdminService.getContractById(id);
    if (!contract) return errorResponse(req, res, "Không tìm thấy hợp đồng", 404);
    return successResponse(req, res, "Lấy chi tiết hợp đồng thành công", contract);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

// PATCH /api/admin/contracts/:id/approve
export const approveContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = getAdminIdFromRequest(req);
    const adminName = (req as any).user?.fullName || "Admin";

    const result = await contractAdminService.approveContract(id, adminId, adminName);
    return successResponse(req, res, "Phê duyệt hợp đồng thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

// PATCH /api/admin/contracts/:id/reject
export const rejectContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = getAdminIdFromRequest(req);
    const adminName = (req as any).user?.fullName || "Admin";

    const result = await contractAdminService.rejectContract(id, adminId, notes, adminName);
    return successResponse(req, res, "Từ chối hợp đồng thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};

// DELETE /api/admin/contracts/:id
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = getAdminIdFromRequest(req);
    const adminName = (req as any).user?.fullName || "Admin";

    const result = await contractAdminService.deleteContract(id, adminId, adminName);
    return successResponse(req, res, "Xóa hợp đồng thành công", result);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Lỗi máy chủ", error.status || 500);
  }
};
