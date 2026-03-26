import { Request, Response } from "express";
import { propertyService } from "../../services/property.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = (req as any).user as { id: string };

    const payload: any = { ...req.body };

    // Nếu có images từ middleware upload multiple -> đảm bảo là mảng string
    if (payload.images && typeof payload.images === "string") {
      payload.images = [payload.images];
    }

    const updated = await propertyService.updateProperty(id, payload, user.id);
    return successResponse(res, "Cập nhật bất động sản thành công", updated);
  } catch (error: any) {
    const status = error.status || 500;
    return errorResponse(res, error.message || "Không thể cập nhật bất động sản", status);
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = (req as any).user as { id: string };

    await propertyService.deleteProperty(id, user.id);
    return successResponse(res, "Xóa mềm bất động sản thành công", { id });
  } catch (error: any) {
    const status = error.status || 500;
    return errorResponse(res, error.message || "Không thể xóa bất động sản", status);
  }
};


