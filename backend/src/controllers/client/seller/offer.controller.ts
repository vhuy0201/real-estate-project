import { Request, Response } from "express";
import { offerService } from "../../../services/offer.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { OfferStatus } from "../../../models/offer.model";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id?: string;
    role?: string;
  };
}

export const getMyOffers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.id || req.user?._id;
    if (!sellerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { status, propertyId, page, limit, startDate, endDate } = req.query;

    let parsedStatus: OfferStatus | OfferStatus[] | undefined;
    if (status) {
      if (Array.isArray(status)) {
        parsedStatus = status as OfferStatus[];
      } else if (typeof status === "string") {
        parsedStatus = status.split(",").map((item) => item.trim()) as OfferStatus[];
      }
    }

    const data = await offerService.getOffersBySeller(String(sellerId), {
      status: parsedStatus,
      propertyId: propertyId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    return successResponse(req, res, "Lấy danh sách offer thành công", data);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy danh sách offer", statusCode);
  }
};

//Xem chi tiết offer
export const getOfferById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.id || req.user?._id;
    if (!sellerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }
    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu offer id", 400);
    }
    const offer = await offerService.getOfferById(id);   
    if (!offer) {
      return errorResponse(req, res, "Không tìm thấy offer", 404);
    }
    const offerSellerId = String(offer.seller_id?._id || offer.seller_id);
    if (offerSellerId !== String(sellerId)) {
      return errorResponse(req, res, "Bạn không có quyền xem offer này", 403);
    }
    return successResponse(req, res, "Lấy chi tiết offer thành công", offer);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy chi tiết offer", statusCode);
  }
};

export const acceptOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.id || req.user?._id;
    if (!sellerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu offer id", 400);
    }

    const result = await offerService.acceptOffer(String(id), String(sellerId));

    return successResponse(req, res, "Đã chấp nhận offer", result);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể chấp nhận offer", statusCode);
  }
};

export const rejectOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user?.id || req.user?._id;
    if (!sellerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu offer id", 400);
    }

    const { reason } = req.body || {};

    const offer = await offerService.rejectOffer(String(id), String(sellerId), reason);

    return successResponse(req, res, "Đã từ chối offer", offer);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể từ chối offer", statusCode);
  }
};
