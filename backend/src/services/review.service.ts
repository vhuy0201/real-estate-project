import mongoose from "mongoose";
import Review, { IReview } from "../models/review.model";
import User from "../models/user.model";
import Property from "../models/property.model";
import Appointment from "../models/appointment.model";
import Deal from "../models/deal.model";
import { createMultilangText } from "../utils/translateHelper";

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

interface CreateReviewInput {
  target_id: string;
  target_type: "agent" | "property";
  rating: number;
  comment?: string;
}

interface ReviewListFilters {
  page?: number;
  limit?: number;
  target_type?: "agent" | "property";
  rating?: number;
  buyerId?: string; // Optional: để check canReview và isCommented
}

const normalizePagination = ({
  page,
  limit,
}: {
  page?: number;
  limit?: number;
}) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Math.min(Number(limit) || 10, 50), 1);
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};

/**
 * Kiểm tra buyer có tương tác thực với target không
 * - Với property: có appointment accepted hoặc deal completed liên quan property đó
 * - Với agent: có appointment accepted hoặc deal completed với agent đó
 */
const checkBuyerInteraction = async (
  buyerId: string,
  targetId: string,
  targetType: "agent" | "property" | "project"
): Promise<boolean> => {
  if (targetType === "property") {
    // Kiểm tra appointment accepted hoặc completed với property
    const appointmentExists = await Appointment.findOne({
      buyer_id: toObjectId(buyerId),
      property_id: toObjectId(targetId),
      status: { $in: ["accepted", "completed"] },
    }).lean();

    if (appointmentExists) return true;

    // Kiểm tra deal completed với property
    const dealExists = await Deal.findOne({
      buyer_id: toObjectId(buyerId),
      property_id: toObjectId(targetId),
      status: "completed",
    }).lean();

    return !!dealExists;
  } else if (targetType === "agent") {
    // Kiểm tra appointment accepted hoặc completed với agent
    const appointmentExists = await Appointment.findOne({
      buyer_id: toObjectId(buyerId),
      agent_id: toObjectId(targetId),
      status: { $in: ["accepted", "completed"] },
    }).lean();

    if (appointmentExists) return true;

    // Kiểm tra deal completed với agent
    const dealExists = await Deal.findOne({
      buyer_id: toObjectId(buyerId),
      agent_id: toObjectId(targetId),
      status: "completed",
    }).lean();

    return !!dealExists;
  }

  return false;
};

export const reviewService = {
  /**
   * Tạo review mới
   * - Validate rating (1-5)
   * - Kiểm tra target tồn tại
   * - Chống duplicate (unique theo buyer-target-type)
   * - Kiểm tra buyer có tương tác thực với target (nếu khả thi)
   */
  async createReview(buyerId: string, payload: CreateReviewInput) {
    const { target_id, target_type, rating, comment } = payload;

    // Validate ObjectId
    if (!mongoose.isValidObjectId(target_id)) {
      const err: any = new Error("Target ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    if (!mongoose.isValidObjectId(buyerId)) {
      const err: any = new Error("Buyer ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      const err: any = new Error("Rating phải là số nguyên từ 1 đến 5");
      err.status = 400;
      throw err;
    }

    // Validate target_type
    if (!["agent", "property"].includes(target_type)) {
      const err: any = new Error("Target type phải là 'agent' hoặc 'property'");
      err.status = 400;
      throw err;
    }

    // Kiểm tra target tồn tại
    if (target_type === "property") {
      const property = await Property.findOne({
        _id: target_id,
        deleted: false,
      }).lean();

      if (!property) {
        const err: any = new Error("Property không tồn tại");
        err.status = 404;
        throw err;
      }
    } else if (target_type === "agent") {
      const agent = await User.findOne({
        _id: target_id,
        role: "agent",
        isActive: true,
      }).lean();

      if (!agent) {
        const err: any = new Error("Agent không tồn tại");
        err.status = 404;
        throw err;
      }
    }

    // Kiểm tra duplicate (unique composite index sẽ tự động bắt, nhưng check trước để có message rõ ràng)
    const existingReview = await Review.findOne({
      user_id: toObjectId(buyerId),
      target_id: toObjectId(target_id),
      target_type,
    }).lean();

    if (existingReview) {
      const err: any = new Error("Bạn đã review target này rồi");
      err.status = 409;
      throw err;
    }

    // Kiểm tra buyer có tương tác thực với target (nếu khả thi)
    const hasInteraction = await checkBuyerInteraction(
      buyerId,
      target_id,
      target_type
    );
    if (!hasInteraction) {
      const err: any = new Error(
        "Bạn chỉ có thể review khi đã có tương tác thực (appointment accepted hoặc deal completed)"
      );
      err.status = 403;
      throw err;
    }

    // Tạo review
    const review = new Review({
      user_id: toObjectId(buyerId),
      target_id: toObjectId(target_id),
      target_type,
      rating,
      comment: await createMultilangText(comment || ""),
    });

    await review.save();

    // Populate để trả về thông tin đầy đủ
    await review.populate([
      { path: "user_id", select: "fullName email avatar" },
      {
        path: "target_id",
        select:
          target_type === "property"
            ? "title address"
            : "fullName email avatar",
      },
    ]);

    return review;
  },

  /**
   * Lấy danh sách reviews của user với pagination và filter
   */
  async getReviewsByUser(userId: string, filters: ReviewListFilters = {}) {
    if (!mongoose.isValidObjectId(userId)) {
      const err: any = new Error("User ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    const { pageNum, limitNum, skip } = normalizePagination({
      page: filters.page,
      limit: filters.limit,
    });

    const query: any = {
      user_id: toObjectId(userId),
    };

    if (filters.target_type) {
      query.target_type = filters.target_type;
    }

    if (filters.rating !== undefined) {
      query.rating = Number(filters.rating);
    }

    const reviews = await Review.find(query)
      .populate("user_id", "fullName email avatar")
      .populate("target_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Transform reviews to select appropriate fields based on target_type
    const transformedReviews = reviews.map((review: any) => {
      const reviewObj = { ...review };
      if (review.target_id) {
        if (review.target_type === "property") {
          reviewObj.target_id = {
            _id: review.target_id._id,
            title: review.target_id.title,
            address: review.target_id.address,
          };
        } else if (review.target_type === "agent") {
          reviewObj.target_id = {
            _id: review.target_id._id,
            fullName: review.target_id.fullName,
            email: review.target_id.email,
            avatar: review.target_id.avatar,
          };
        }
      }
      return reviewObj;
    });

    const total = await Review.countDocuments(query);

    return {
      data: transformedReviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  /**
   * Cập nhật review (chỉ owner)
   */
  async updateReview(
    reviewId: string,
    userId: string,
    payload: { rating?: number; comment?: string }
  ) {
    if (!mongoose.isValidObjectId(reviewId)) {
      const err: any = new Error("Review ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    if (!mongoose.isValidObjectId(userId)) {
      const err: any = new Error("User ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    const review = await Review.findOne({
      _id: reviewId,
      user_id: toObjectId(userId),
    });

    if (!review) {
      const err: any = new Error(
        "Review không tồn tại hoặc không thuộc quyền quản lý của bạn"
      );
      err.status = 404;
      throw err;
    }

    // Validate rating nếu có
    if (payload.rating !== undefined) {
      if (
        !Number.isInteger(payload.rating) ||
        payload.rating < 1 ||
        payload.rating > 5
      ) {
        const err: any = new Error("Rating phải là số nguyên từ 1 đến 5");
        err.status = 400;
        throw err;
      }
      review.rating = payload.rating;
    }

    if (payload.comment !== undefined) {
      review.comment = await createMultilangText(payload.comment);
    }

    await review.save();

    // Populate để trả về thông tin đầy đủ
    await review.populate([
      { path: "user_id", select: "fullName email avatar" },
      {
        path: "target_id",
        select:
          review.target_type === "property"
            ? "title address"
            : "fullName email avatar",
      },
    ]);

    return review;
  },

  /**
   * Xóa review (chỉ owner)
   */
  async deleteReview(reviewId: string, userId: string) {
    if (!mongoose.isValidObjectId(reviewId)) {
      const err: any = new Error("Review ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    if (!mongoose.isValidObjectId(userId)) {
      const err: any = new Error("User ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user_id: toObjectId(userId),
    });

    if (!review) {
      const err: any = new Error(
        "Review không tồn tại hoặc không thuộc quyền quản lý của bạn"
      );
      err.status = 404;
      throw err;
    }

    return review;
  },

  /**
   * Lấy danh sách reviews theo property
   * Chỉ lấy reviews của property còn cho thuê được (status: "available" hoặc "approved", deleted: false)
   */
  async getReviewsByProperty(
    propertyId: string,
    filters: ReviewListFilters = {}
  ) {
    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Property ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    // Kiểm tra property tồn tại và còn cho thuê được
    const property = await Property.findOne({
      _id: toObjectId(propertyId),
      deleted: false,
      status: { $in: ["available", "approved", "sold", "rented"] },
    }).lean();

    if (!property) {
      const err: any = new Error(
        "Property không tồn tại hoặc không còn cho thuê"
      );
      err.status = 404;
      throw err;
    }

    const { pageNum, limitNum, skip } = normalizePagination({
      page: filters.page,
      limit: filters.limit,
    });

    const query: any = {
      target_id: toObjectId(propertyId),
      target_type: "property",
    };

    if (filters.rating !== undefined) {
      query.rating = Number(filters.rating);
    }

    const reviews = await Review.find(query)
      .populate("user_id", "fullName email avatar")
      .populate({
        path: "target_id",
        select: "title address",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Transform reviews to select appropriate fields
    const transformedReviews = reviews.map((review: any) => {
      const reviewObj = { ...review };
      if (review.target_id) {
        reviewObj.target_id = {
          _id: review.target_id._id,
          title: review.target_id.title,
          address: review.target_id.address,
        };
      }
      return reviewObj;
    });

    const total = await Review.countDocuments(query);

    // Kiểm tra buyer có thể review và đã comment chưa
    let canReview = false;
    let isCommented = false;

    if (filters.buyerId && mongoose.isValidObjectId(filters.buyerId)) {
      // Check buyer đã mua/thuê chưa
      canReview = await checkBuyerInteraction(
        filters.buyerId,
        propertyId,
        "property"
      );

      // Check buyer đã comment chưa
      if (canReview) {
        const existingReview = await Review.findOne({
          user_id: toObjectId(filters.buyerId),
          target_id: toObjectId(propertyId),
          target_type: "property",
        }).lean();
        isCommented = !!existingReview;
      }
    }

    return {
      data: transformedReviews,
      canReview, // Buyer đã mua/thuê chưa (có thể comment)
      isCommented, // Buyer đã comment chưa
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  /**
   * Lấy danh sách reviews theo agent
   */
  async getReviewsByAgent(agentId: string, filters: ReviewListFilters = {}) {
    if (!mongoose.isValidObjectId(agentId)) {
      const err: any = new Error("Agent ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    // Kiểm tra agent tồn tại và active
    const agent = await User.findOne({
      _id: toObjectId(agentId),
      role: "agent",
      isActive: true,
    }).lean();

    if (!agent) {
      const err: any = new Error("Agent không tồn tại hoặc không hoạt động");
      err.status = 404;
      throw err;
    }

    const { pageNum, limitNum, skip } = normalizePagination({
      page: filters.page,
      limit: filters.limit,
    });

    const query: any = {
      target_id: toObjectId(agentId),
      target_type: "agent",
    };

    if (filters.rating !== undefined) {
      query.rating = Number(filters.rating);
    }

    const reviews = await Review.find(query)
      .populate("user_id", "fullName email avatar")
      .populate({
        path: "target_id",
        select: "fullName email avatar",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Transform reviews to select appropriate fields
    const transformedReviews = reviews.map((review: any) => {
      const reviewObj = { ...review };
      if (review.target_id) {
        reviewObj.target_id = {
          _id: review.target_id._id,
          fullName: review.target_id.fullName,
          email: review.target_id.email,
          avatar: review.target_id.avatar,
        };
      }
      return reviewObj;
    });

    const total = await Review.countDocuments(query);

    // Kiểm tra buyer có thể review và đã comment chưa
    let canReview = false;
    let isCommented = false;

    if (filters.buyerId && mongoose.isValidObjectId(filters.buyerId)) {
      // Check buyer đã mua/thuê chưa
      canReview = await checkBuyerInteraction(
        filters.buyerId,
        agentId,
        "agent"
      );

      // Check buyer đã comment chưa
      if (canReview) {
        const existingReview = await Review.findOne({
          user_id: toObjectId(filters.buyerId),
          target_id: toObjectId(agentId),
          target_type: "agent",
        }).lean();
        isCommented = !!existingReview;
      }
    }

    return {
      data: transformedReviews,
      canReview, // Buyer đã mua/thuê chưa (có thể comment)
      isCommented, // Buyer đã comment chưa
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },
};
