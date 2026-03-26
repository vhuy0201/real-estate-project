// src/controllers/client/buyer/favorite.controller.ts
import { Request, Response } from "express";
import { favoriteService } from "../../../services/favorite.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const addFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { property_id } = req.body;

    if (!property_id) {
      return errorResponse(req, res, "Vui lòng truyền property_id", 400);
    }

    const data = await favoriteService.addFavorite(userId!, property_id);
    return successResponse(req, res, "Thêm yêu thích thành công", data);
  } catch (err: any) {
    return errorResponse(req, res, err.message, err.status || 500);
  }
};

export const removeFavorite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    const data = await favoriteService.removeFavorite(userId!, propertyId);
    return successResponse(req, res, "Xoá yêu thích thành công", data);
  } catch (err: any) {
    return errorResponse(req, res, err.message, err.status || 500);
  }
};

export const getMyFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = await favoriteService.getMyFavorites(String(userId));

    return successResponse(req, res, "favorite.list", { data: result });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, "favorite.list_failed", 500);
  }
};

export const checkFavorite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    const favorite = await favoriteService.isFavorite(userId!, propertyId);

    return successResponse(req, res, "Trạng thái yêu thích", {
      isFavorite: !!favorite,
      favorite,
    });
  } catch (err: any) {
    return errorResponse(req, res, err.message, err.status || 500);
  }
};
