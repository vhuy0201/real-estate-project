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
    const agentId = req.user?.id || req.user?._id;
    if (!agentId) {
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

    const data = await offerService.getOffersByAgent(agentId, {
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
    const agentId = req.user?.id || req.user?._id;
    if (!agentId) {
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
    const offerAgentId = String(offer.agent_id?._id || offer.agent_id);
    if (offerAgentId !== String(agentId)) {
      return errorResponse(req, res, "Bạn không có quyền xem offer này", 403);
    }
    return successResponse(req, res, "Lấy chi tiết offer thành công", offer);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy chi tiết offer", statusCode);
  }
};

export const forwardOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.user?.id || req.user?._id;
    if (!agentId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu offer id", 400);
    }

    const offer = await offerService.forwardOffer(id, String(agentId));

    return successResponse(req, res, "Đã forward offer tới seller", offer);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể forward offer", statusCode);
  }
};
