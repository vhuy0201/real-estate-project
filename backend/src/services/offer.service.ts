import mongoose from "mongoose";
import Offer, { IOffer, OfferStatus, SUPPORTED_OFFER_CURRENCIES } from "../models/offer.model";
import Property from "../models/property.model";
import User from "../models/user.model";
import {
  notifyNewOffer,
  notifySellerNewOffer,
  notifyOfferForwarded,
  notifyOfferAccepted,
  notifyOfferRejected,
} from "../utils/notificationHelper";
import { dealService } from "./deal.service";

type SupportedCurrency = (typeof SUPPORTED_OFFER_CURRENCIES)[number];

interface CreateOfferInput {
  propertyId: string;
  amount: number;
  note?: string;
  currency?: SupportedCurrency;
  expiresAt?: Date | string;
  attachments?: string[];
  meta?: Record<string, any>;
}

interface OfferListFilters {
  page?: number;
  limit?: number;
  status?: OfferStatus | OfferStatus[];
  propertyId?: string;
  startDate?: string;
  endDate?: string;
}

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

const normalizePagination = ({ page, limit }: { page?: number; limit?: number }) => {
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Math.min(Number(limit) || 10, 50), 1);
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};

const ensureFutureDate = (date: Date, errorMessage: string) => {
  if (date <= new Date()) {
    const err: any = new Error(errorMessage);
    err.status = 400;
    throw err;
  }
};

const ensureNotExpired = (offer: IOffer) => {
  if (offer.expires_at && offer.expires_at <= new Date()) {
    const err: any = new Error("Offer đã hết hạn");
    err.status = 400;
    throw err;
  }
};

const parseOptionalDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const err: any = new Error("Giá trị ngày không hợp lệ");
    err.status = 400;
    throw err;
  }
  return parsed;
};

export const offerService = {
  async createOffer(buyerId: string, payload: CreateOfferInput) {
    const { propertyId, amount, note, currency = "VND", expiresAt, attachments, meta } = payload;

    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Property không hợp lệ");
      err.status = 400;
      throw err;
    }

    if (!amount || Number(amount) <= 0) {
      const err: any = new Error("Giá trị offer phải lớn hơn 0");
      err.status = 400;
      throw err;
    }

    if (!SUPPORTED_OFFER_CURRENCIES.includes(currency)) {
      const err: any = new Error("Loại tiền tệ không được hỗ trợ");
      err.status = 400;
      throw err;
    }

    const property = await Property.findOne({ _id: propertyId, deleted: false }).lean();
    if (!property) {
      const err: any = new Error("Property không tồn tại");
      err.status = 404;
      throw err;
    }

    if (String(property.owner_id) === buyerId) {
      const err: any = new Error("Không thể tạo offer cho property của chính bạn");
      err.status = 400;
      throw err;
    }

    if (property.status === "rejected" || property.status === "sold") {
      const err: any = new Error("Property không khả dụng để tạo offer");
      err.status = 400;
      throw err;
    }

    let expiresDate: Date | undefined;
    if (expiresAt) {
      expiresDate = new Date(expiresAt);
      if (Number.isNaN(expiresDate.getTime())) {
        const err: any = new Error("Thời hạn offer không hợp lệ");
        err.status = 400;
        throw err;
      }
      ensureFutureDate(expiresDate, "Thời hạn offer phải ở tương lai");
    }

    const buyer = await User.findById(buyerId).select("fullName").lean();
    if (!buyer) {
      const err: any = new Error("Người mua không tồn tại");
      err.status = 404;
      throw err;
    }

    const sellerId = String(property.owner_id);
    const agentId = property.agent_id ? String(property.agent_id) : undefined;

    const offerData: Partial<IOffer> = {
      property_id: toObjectId(propertyId),
      buyer_id: toObjectId(buyerId),
      seller_id: toObjectId(sellerId),
      agent_id: agentId ? toObjectId(agentId) : undefined,
      amount: Number(amount),
      currency,
      note,
      status: "pending",
      expires_at: expiresDate,
      attachments: Array.isArray(attachments) ? attachments.filter((item) => typeof item === "string") : undefined,
      meta: meta && typeof meta === "object" && !Array.isArray(meta) ? meta : undefined,
    };

    const offer = await Offer.create(offerData);

    // Notifications (best-effort)
    const propertyTitle =
      typeof property.title === "object" && property.title
        ? property.title.vi || property.title.en || "property"
        : "property";

    const notifyTasks: Promise<any>[] = [];
    if (agentId) {
      notifyTasks.push(notifyNewOffer(agentId, buyer.fullName || "Buyer", propertyTitle, Number(amount), String(offer._id)));
    }
    if (sellerId) {
      notifyTasks.push(
        notifySellerNewOffer(sellerId, buyer.fullName || "Buyer", propertyTitle, Number(amount), String(offer._id))
      );
    }
    if (notifyTasks.length) {
      Promise.allSettled(notifyTasks).catch((err) => {
        console.error("Failed to send offer notifications:", err);
      });
    }

    return offer;
  },

  async getOffersByBuyer(buyerId: string, filters: OfferListFilters = {}) {
    const { status, propertyId } = filters;
    const { pageNum, limitNum, skip } = normalizePagination(filters);

    const query: any = {
      buyer_id: toObjectId(buyerId),
    };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (propertyId) {
      if (!mongoose.isValidObjectId(propertyId)) {
        const err: any = new Error("property_id không hợp lệ");
        err.status = 400;
        throw err;
      }
      query.property_id = toObjectId(propertyId);
    }

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate("property_id", "title price images status owner_id agent_id")
        .populate("agent_id", "fullName email phone avatar")
        .populate("seller_id", "fullName email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Offer.countDocuments(query),
    ]);

    return {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: offers,
    };
  },

  async cancelOffer(offerId: string, buyerId: string) {
    if (!mongoose.isValidObjectId(offerId)) {
      const err: any = new Error("Offer không hợp lệ");
      err.status = 400;
      throw err;
    }

    const offer = await Offer.findOne({
      _id: offerId,
      buyer_id: toObjectId(buyerId),
    });

    if (!offer) {
      const err: any = new Error("Offer không tồn tại");
      err.status = 404;
      throw err;
    }

    if (offer.status !== "pending") {
      const err: any = new Error("Chỉ có thể huỷ offer khi đang chờ xử lý");
      err.status = 400;
      throw err;
    }

    offer.status = "cancelled";
    await offer.save();

    return offer;
  },

  async getOffersByAgent(agentId: string, filters: OfferListFilters = {}) {
    const { status, propertyId, startDate, endDate } = filters;
    const { pageNum, limitNum, skip } = normalizePagination(filters);

    const query: any = {
      agent_id: toObjectId(agentId),
    };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (propertyId) {
      if (!mongoose.isValidObjectId(propertyId)) {
        const err: any = new Error("property_id không hợp lệ");
        err.status = 400;
        throw err;
      }
      query.property_id = toObjectId(propertyId);
    }

    const start = parseOptionalDate(startDate);
    const end = parseOptionalDate(endDate);
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = start;
      if (end) query.createdAt.$lte = end;
    }

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate("property_id", "title price images status owner_id agent_id")
        .populate("buyer_id", "fullName email phone avatar")
        .populate("seller_id", "fullName email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Offer.countDocuments(query),
    ]);

    return {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: offers,
    };
  },

  async forwardOffer(offerId: string, agentId: string) {
    if (!mongoose.isValidObjectId(offerId)) {
      const err: any = new Error("Offer không hợp lệ");
      err.status = 400;
      throw err;
    }

    const offer = await Offer.findOne({
      _id: offerId,
      agent_id: toObjectId(agentId),
    });

    if (!offer) {
      const err: any = new Error("Offer không tồn tại hoặc không thuộc quyền quản lý");
      err.status = 404;
      throw err;
    }

    if (offer.status !== "pending") {
      const err: any = new Error("Chỉ có thể forward offer khi đang pending");
      err.status = 400;
      throw err;
    }

    ensureNotExpired(offer);

    offer.status = "forwarded_to_seller";
    offer.forwarded_at = new Date();
    await offer.save();

    const [agent, property] = await Promise.all([
      User.findById(agentId).select("fullName").lean(),
      Property.findById(offer.property_id).select("title").lean(),
    ]);

    const propertyTitle =
      property && typeof property.title === "object"
        ? property.title.vi || property.title.en || "property"
        : "property";

    if (offer.seller_id) {
      notifyOfferForwarded(
        String(offer.seller_id),
        agent?.fullName || "Agent",
        propertyTitle,
        offer.amount,
        String(offer._id)
      ).catch((err) => console.error("Failed to notify seller about forwarded offer:", err));
    }

    return offer;
  },

  async getOffersBySeller(sellerId: string, filters: OfferListFilters = {}) {
    const { status, propertyId, startDate, endDate } = filters;
    const { pageNum, limitNum, skip } = normalizePagination(filters);

    const query: any = {
      seller_id: toObjectId(sellerId),
    };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (propertyId) {
      if (!mongoose.isValidObjectId(propertyId)) {
        const err: any = new Error("property_id không hợp lệ");
        err.status = 400;
        throw err;
      }
      query.property_id = toObjectId(propertyId);
    }

    const start = parseOptionalDate(startDate);
    const end = parseOptionalDate(endDate);
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = start;
      if (end) query.createdAt.$lte = end;
    }

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate("property_id", "title price images status owner_id agent_id")
        .populate("buyer_id", "fullName email phone avatar")
        .populate("agent_id", "fullName email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Offer.countDocuments(query),
    ]);

    return {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: offers,
    };
  },

  async acceptOffer(offerId: string, sellerId: string, options?: { sellerName?: string }) {
    if (!mongoose.isValidObjectId(offerId)) {
      const err: any = new Error("Offer không hợp lệ");
      err.status = 400;
      throw err;
    }

    const offer = await Offer.findOne({
      _id: offerId,
      seller_id: toObjectId(sellerId),
    });

    if (!offer) {
      const err: any = new Error("Offer không tồn tại hoặc không thuộc seller");
      err.status = 404;
      throw err;
    }

    if (!offer.agent_id) {
      const err: any = new Error("Offer chưa được agent phụ trách");
      err.status = 400;
      throw err;
    }

    if (!["forwarded_to_seller", "seller_reviewing"].includes(offer.status)) {
      const err: any = new Error("Chỉ chấp nhận offer đã được forward");
      err.status = 400;
      throw err;
    }

    ensureNotExpired(offer);

    offer.status = "accepted";
    offer.reviewed_by = offer.seller_id;
    offer.reviewed_at = new Date();
    offer.rejection_reason = undefined;
    await offer.save();

    const [seller, property] = await Promise.all([
      options?.sellerName
        ? Promise.resolve({ fullName: options.sellerName })
        : User.findById(sellerId).select("fullName").lean(),
      Property.findById(offer.property_id).select("title").lean(),
    ]);

    const propertyTitle =
      property && typeof property.title === "object"
        ? property.title.vi || property.title.en || "property"
        : "property";

    const deal = await dealService.createDealFromOffer(String(offer._id));
//update property status to sold
    try {
      await Property.findByIdAndUpdate(offer.property_id, {
        status: "sold",
      });
    } catch (error) {
      console.error("Failed to update property status:", error);
    }

    notifyOfferAccepted(
      String(offer.buyer_id),
      String(offer.agent_id),
      seller?.fullName || "Seller",
      propertyTitle,
      String(offer._id),
      String(deal._id)
    ).catch((err) => console.error("Failed to notify offer accepted:", err));

    return { offer, deal };
  },

  async rejectOffer(offerId: string, sellerId: string, reason?: string) {
    if (!mongoose.isValidObjectId(offerId)) {
      const err: any = new Error("Offer không hợp lệ");
      err.status = 400;
      throw err;
    }

    const offer = await Offer.findOne({
      _id: offerId,
      seller_id: toObjectId(sellerId),
    });

    if (!offer) {
      const err: any = new Error("Offer không tồn tại hoặc không thuộc seller");
      err.status = 404;
      throw err;
    }

    if (!offer.agent_id) {
      const err: any = new Error("Offer chưa được agent phụ trách");
      err.status = 400;
      throw err;
    }

    if (!["forwarded_to_seller", "seller_reviewing"].includes(offer.status)) {
      const err: any = new Error("Chỉ từ chối offer đã được forward");
      err.status = 400;
      throw err;
    }

    ensureNotExpired(offer);

    offer.status = "rejected";
    offer.reviewed_by = offer.seller_id;
    offer.reviewed_at = new Date();
    offer.rejection_reason = reason;
    await offer.save();

    const [seller, property] = await Promise.all([
      User.findById(sellerId).select("fullName").lean(),
      Property.findById(offer.property_id).select("title").lean(),
    ]);

    const propertyTitle =
      property && typeof property.title === "object"
        ? property.title.vi || property.title.en || "property"
        : "property";

    notifyOfferRejected(
      String(offer.buyer_id),
      String(offer.agent_id),
      seller?.fullName || "Seller",
      propertyTitle,
      String(offer._id),
      reason
    ).catch((err) => console.error("Failed to notify offer rejected:", err));

    return offer;
  },


    //Xem chi tiết offer
  async getOfferById(offerId: string) {
    if (!mongoose.isValidObjectId(offerId)) {
      const err: any = new Error("Offer không hợp lệ");
      err.status = 400;
      throw err;
    }

    const offer = await Offer.findById(offerId)
      .populate("property_id", "title price images status address owner_id agent_id category_id type_id")
      .populate("buyer_id", "fullName email phone avatar")
      .populate("seller_id", "fullName email phone avatar")
      .populate("agent_id", "fullName email phone avatar")
      .lean();

    return offer;
  },
};
