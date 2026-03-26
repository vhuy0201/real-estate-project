import { Request, Response } from "express";
import { propertyService } from "../../../services/property.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";

export const listPropertiesWithoutAgent = async (req: Request, res: Response) => {
  try {
    const filters = req.query;

    const data = await propertyService.getPropertiesWithoutAgent(filters);

    return successResponse(req, res, "Danh sách properties chưa có agent", data);
  } catch (err: any) {
    console.error("listPropertiesWithoutAgent error:", err);
    return errorResponse(req, res, err.message, 500);
  }
};
