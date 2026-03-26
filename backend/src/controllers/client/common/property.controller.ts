import { Request, Response } from "express";
import { propertyService } from "../../../services/property.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";

export const getMyProperties = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id || (req as any).user?._id;
		if (!userId) return errorResponse(req, res, "Unauthorized", 401);

		const properties = await propertyService.getPropertiesByUser(String(userId), req.query);
		return successResponse(req, res, "Lấy danh sách bất động sản thành công", properties);
	} catch (error: any) {
		console.error("getMyProperties error:", error);
		return errorResponse(req, res, error.message || "Server error", error.status || 500);
	}
};

export const updateProperty = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id || (req as any).user?._id;
		if (!userId) return errorResponse(req, res, "Unauthorized", 401);

		const { id } = req.params;
		const body = req.body || {};

		// Merge ảnh cũ (existingImages[]) + ảnh mới (images từ middleware)
		const existingImages = req.body.existingImages || [];
		const newImages = req.body.images || [];
		
		// existingImages có thể là string hoặc array
		let existingImagesArray: string[] = [];
		if (typeof existingImages === 'string') {
			existingImagesArray = [existingImages];
		} else if (Array.isArray(existingImages)) {
			existingImagesArray = existingImages;
		}

		// newImages có thể là string hoặc array
		let newImagesArray: string[] = [];
		if (typeof newImages === 'string') {
			newImagesArray = [newImages];
		} else if (Array.isArray(newImages)) {
			newImagesArray = newImages;
		}

		// Merge: ảnh cũ trước, ảnh mới sau
		body.images = [...existingImagesArray, ...newImagesArray];

		// Xử lý coordinates từ FormData (coordinates[lat] và coordinates[lng])
		if (req.body.coordinates && typeof req.body.coordinates === 'object') {
			if (req.body.coordinates.lat !== undefined && req.body.coordinates.lng !== undefined) {
				body.coordinates = {
					lat: parseFloat(req.body.coordinates.lat),
					lng: parseFloat(req.body.coordinates.lng)
				};
			}
		}

		const updated = await propertyService.updateProperty(id, body, String(userId));
		return successResponse(req, res, "Cập nhật bất động sản thành công", updated);
	} catch (error: any) {
		console.error("updateProperty error:", error);
		return errorResponse(req, res, error.message || "Server error", error.status || 500);
	}
};

export const deleteProperty = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id || (req as any).user?._id;
		if (!userId) return errorResponse(req, res, "Unauthorized", 401);

		const { id } = req.params;
		await propertyService.deleteProperty(id, String(userId));
		return successResponse(req, res, "Xoá bất động sản (soft-delete) thành công", { id });
	} catch (error: any) {
		console.error("deleteProperty error:", error);
		return errorResponse(req, res, error.message || "Server error", error.status || 500);
	}
};
