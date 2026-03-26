import { Request, Response } from "express";
import * as typeService from "../../services/admin/type.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";


export const getAllTypes = async (_req: Request, res: Response) => {
  try {
    const types = await typeService.getAllTypes();
    return successResponse(res, "Lấy danh mục bất động sản thành công", types);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};


export const createType = async (req: Request, res: Response) => {
  try {
    const newType = await typeService.createType(req.body);
    return successResponse(res, "Tạo danh mục bất động sản mới thành công", newType);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};


export const updateType = async (req: Request, res: Response) => {
  try {
    const updatedType = await typeService.updateType(req.params.id, req.body);
    return successResponse(res, "Cập nhật danh mục bất động sản thành công", updatedType);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};


export const deleteType = async (req: Request, res: Response) => {
  try {
    await typeService.deleteType(req.params.id);
    return successResponse(res, "Xóa danh mục bất động sản thành công.");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
