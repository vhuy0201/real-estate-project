import { Request, Response } from "express";
import * as cityService from "../../services/admin/city.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";


export const getAllCities = async (_req: Request, res: Response) => {
  try {
    const cities = await cityService.getAllCities();
    return successResponse(res, "Lấy danh sách thành phố thành công", cities);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};


export const createCity = async (req: Request, res: Response) => {
  try {
    const newCity = await cityService.createCity(req.body);
    return successResponse(res, "Tạo thành phố mới thành công", newCity);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const updatedCity = await cityService.updateCity(req.params.id, req.body);
    return successResponse(res, "Cập nhật thành phố thành công", updatedCity);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};


export const deleteCity = async (req: Request, res: Response) => {
  try {
    await cityService.deleteCity(req.params.id);
    return successResponse(res, "Xóa thành phố thành công.");
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
