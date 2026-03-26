import { Request, Response } from "express";
import { reviewService } from "../../../services/review.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { target_id, target_type, rating, comment } = req.body || {};

    if (!target_id || !target_type || rating === undefined) {
      return errorResponse(req, res, "Thiếu target_id, target_type hoặc rating", 400);
    }

    const review = await reviewService.createReview(buyerId, {
      target_id,
      target_type,
      rating: Number(rating),
      comment,
    });

    return successResponse(req, res, "Tạo review thành công", review);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể tạo review", statusCode);
  }
};

export const getMyReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { target_type, rating, page, limit } = req.query;

    const data = await reviewService.getReviewsByUser(buyerId, {
      target_type: target_type as "agent" | "property" | undefined,
      rating: rating ? Number(rating) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return successResponse(req, res, "Lấy danh sách review thành công", data);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy danh sách review", statusCode);
  }
};

export const updateMyReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu review id", 400);
    }

    const { rating, comment } = req.body || {};

    if (rating === undefined && comment === undefined) {
      return errorResponse(req, res, "Cần cung cấp rating hoặc comment để cập nhật", 400);
    }

    const review = await reviewService.updateReview(id, buyerId, {
      rating: rating !== undefined ? Number(rating) : undefined,
      comment,
    });

    return successResponse(req, res, "Cập nhật review thành công", review);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể cập nhật review", statusCode);
  }
};

export const deleteMyReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return errorResponse(req, res, "Không xác thực được người dùng", 401);
    }

    const { id } = req.params;
    if (!id) {
      return errorResponse(req, res, "Thiếu review id", 400);
    }

    const review = await reviewService.deleteReview(id, buyerId);

    return successResponse(req, res, "Xóa review thành công", review);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể xóa review", statusCode);
  }
};

export const getReviewsByProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    if (!propertyId) {
      return errorResponse(req, res, "Thiếu property id", 400);
    }

    const { rating, page, limit } = req.query;
    // Lấy buyerId từ token (nếu đã đăng nhập)
    const buyerId = req.user?.id || undefined;

    const data = await reviewService.getReviewsByProperty(propertyId, {
      rating: rating ? Number(rating) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      buyerId, // Truyền buyerId để check canReview và isCommented
    });

    return successResponse(req, res, "Lấy danh sách review theo property thành công", data);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy danh sách review", statusCode);
  }
};

export const getReviewsByAgent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    if (!agentId) {
      return errorResponse(req, res, "Thiếu agent id", 400);
    }

    const { rating, page, limit } = req.query;
    // Lấy buyerId từ token (nếu đã đăng nhập)
    const buyerId = req.user?.id || undefined;

    const data = await reviewService.getReviewsByAgent(agentId, {
      rating: rating ? Number(rating) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      buyerId, // Truyền buyerId để check canReview và isCommented
    });

    return successResponse(req, res, "Lấy danh sách review theo agent thành công", data);
  } catch (error: any) {
    const statusCode = error?.status || 500;
    return errorResponse(req, res, error.message || "Không thể lấy danh sách review", statusCode);
  }
};

