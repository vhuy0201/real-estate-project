import { Request, Response } from "express";
import { offerService } from "../../../services/offer.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { OfferStatus } from "../../../models/offer.model";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}

export const createOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { propertyId, amount, note, currency, expiresAt, attachments, meta } = req.body || {};

    if (!propertyId || amount === undefined) {
      return errorResponse(req, res, "Thiếu propertyId hoặc amount", 400);
    }

    const offer = await offerService.createOffer(buyerId, {
      propertyId,
      amount: Number(amount),
      note,
      currency,
      expiresAt,
      attachments,
      meta,
    });

    return successResponse(req, res, "Tạo offer thành công", offer);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể tạo offer", statusCode);
  }
};

export const getMyOffers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { status, propertyId, page, limit } = req.query;

    let parsedStatus: OfferStatus | OfferStatus[] | undefined;
    if (status) {
      if (Array.isArray(status)) {
        parsedStatus = status as OfferStatus[];
      } else if (typeof status === "string") {
        parsedStatus = status.split(",").map((item) => item.trim()) as OfferStatus[];
      }
    }

    const data = await offerService.getOffersByBuyer(buyerId, {
      status: parsedStatus,
      propertyId: propertyId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return successResponse(req, res, "Lấy danh sách offer thành công", data);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy danh sách offer", statusCode);
  }
};

export const cancelOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu offer id", 400);
    }

    const offer = await offerService.cancelOffer(id, buyerId);

    return successResponse(req, res, "Huỷ offer thành công", offer);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể huỷ offer", statusCode);
  }
};

