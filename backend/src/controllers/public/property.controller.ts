import { Request, Response } from "express";
import { propertyService } from "../../services/property.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const result = await propertyService.getAllProperties(req.query);
    return successResponse(req, res, "Danh sách bất động sản", result);
  } catch (error) {
    console.error("getAllProperties error:", error);
    return errorResponse(req, res, "Server error", 500);
  }
};

// [U004] Lấy danh sách tất cả tọa độ property để hiển thị trên bản đồ
export const getAllCoordinates = async (req: Request, res: Response) => {
  try {
    const data = await propertyService.getAllCoordinates();
    return successResponse(req, res, "Danh sách tọa độ property", data);
  } catch (error: any) {
    console.error("getAllCoordinates error:", error.message);
    return errorResponse(
      req,
      res,
      error.message || "Không thể lấy danh sách tọa độ property.",
      error.status || 500
    );
  }
};

// [U005] Lấy chi tiết property theo ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await propertyService.getPropertyById(id);

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
