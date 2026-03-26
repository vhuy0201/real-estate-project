import { Request, Response } from "express";
import { taxonomyService } from "../../services/taxonomy.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await taxonomyService.getAllCities();
    return successResponse(res, "Lấy danh sách thành phố thành công", cities);
  } catch (err) {
    return errorResponse(res, "Lấy danh sách thành phố thất bại", 500);
  }
};

export const getDistricts = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    const districts = await taxonomyService.getDistrictsByCity(cityId);
    return successResponse(res, "Lấy danh sách quận/huyện thành công", districts);
  } catch (err) {
    return errorResponse(res, "Lấy danh sách quận/huyện thất bại", 500);
  }
};

export const getWards = async (req: Request, res: Response) => {
  try {
    const { districtId } = req.params;
    const wards = await taxonomyService.getWardsByDistrict(districtId);
    return successResponse(res, "Lấy danh sách phường/xã thành công", wards);
  } catch (err) {
    return errorResponse(res, "Lấy danh sách phường/xã thất bại", 500);
  }
};

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const data = await taxonomyService.getAllLocations();
    return successResponse(res, "Lấy toàn bộ danh sách locations thành công", data);
  } catch (err) {
    return errorResponse(res, "Lấy toàn bộ danh sách locations thất bại", 500);
  }
};
