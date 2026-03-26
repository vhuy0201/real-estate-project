import mongoose from "mongoose";
import Deal, { DealStatus, IDeal } from "../models/deal.model";
import Offer, { IOffer } from "../models/offer.model";
import Property from "../models/property.model";
import { notifyDealCreated } from "../utils/notificationHelper";


const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);
const CONTRACT_UPLOADABLE_DEAL_STATUSES: DealStatus[] = ["awaiting_contract", "contract_under_review"];

const calculateFees = (amount: number) => {
  const platformFeeRate = Number(process.env.DEFAULT_PLATFORM_FEE_RATE ?? 0) / 100;
  const agentFeeRate = Number(process.env.DEFAULT_AGENT_FEE_RATE ?? 0) / 100;

  const platform_fee = Math.max(Math.round(amount * platformFeeRate), 0);
  const agent_fee = Math.max(Math.round(amount * agentFeeRate), 0);
  const seller_payout = Math.max(amount - platform_fee - agent_fee, 0);

  return { platform_fee, agent_fee, seller_payout };
};

interface DealListFilters {
  status?: DealStatus;
  propertyId?: string;
  fromDate?: string; // ISO date string
  toDate?: string;   // ISO date string
}


export const dealService = {
  async getDealsByBuyer(
    buyerId: string,
    options?: { status?: string | string[]; limit?: number; sortDesc?: boolean }
  ) {
    if (!mongoose.Types.ObjectId.isValid(buyerId)) return [];

    const query: any = { buyer_id: toObjectId(buyerId) };

    if (options?.status) {
      if (Array.isArray(options.status)) query.status = { $in: options.status };
      else query.status = options.status;
    }

    const limit = options?.limit ?? 100; 
    const sort: any = { createdAt: options?.sortDesc === false ? 1 : -1 };

    return Deal.find(query)
      .populate("property_id", "title address price") // populate thông tin property
      .populate("seller_id", "fullName email phone") // seller cơ bản
      .populate("agent_id", "fullName email phone") // agent cơ bản
      .sort(sort)
      .limit(limit)
      .lean();
  },

  async createDealFromOffer(offerId: string) {
    if (!mongoose.isValidObjectId(offerId)) {
      const err: any = new Error("Offer không hợp lệ");
      err.status = 400;
      throw err;
    }

    const offer = (await Offer.findById(offerId)) as (IOffer & { property_id: any }) | null;
    if (!offer) {
      const err: any = new Error("Offer không tồn tại");
      err.status = 404;
      throw err;
    }

    if (offer.status !== "accepted") {
      const err: any = new Error("Offer chưa được chấp nhận");
      err.status = 400;
      throw err;
    }

    const property = await Property.findById(offer.property_id).lean();
    if (!property) {
      const err: any = new Error("Property liên quan không tồn tại");
      err.status = 404;
      throw err;
    }

    if (!offer.agent_id) {
      const err: any = new Error("Offer chưa có agent phụ trách");
      err.status = 400;
      throw err;
    }

    const existingDeal = await Deal.findOne({ offer_id: offer._id });
    if (existingDeal) {
      return existingDeal;
    }

    const agreedPrice = offer.amount;
    const { platform_fee, agent_fee, seller_payout } = calculateFees(agreedPrice);

    const deal = await Deal.create({
      property_id: offer.property_id,
      offer_id: offer._id,
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      agent_id: offer.agent_id,
      status: "awaiting_contract",
      amounts: {
        agreed_price: agreedPrice,
        currency: offer.currency,
        platform_fee,
        agent_fee,
        seller_payout,
      },
      audit: {
        created_from_offer_at: new Date(),
      },
    });

    const propertyTitle =
      typeof property.title === "object" && property.title
        ? property.title.vi || property.title.en || "property"
        : "property";

    notifyDealCreated(
      String(offer.buyer_id),
      String(offer.seller_id),
      String(offer.agent_id),
      propertyTitle,
      String(deal._id)
    ).catch((error) => {
      console.error("Failed to send deal created notifications:", error);
    });

    return deal;
  },

  async updateDealStatus(dealId: string, status: DealStatus, updatedBy: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId)) {
      const err: any = new Error("DealId không hợp lệ");
      err.status = 400;
      throw err;
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      const err: any = new Error("Deal không tồn tại");
      err.status = 404;
      throw err;
    }

    deal.status = status;

    await deal.save();
    return deal;
  },

  async getDealById(dealId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId)) {
      return null;
    }

    return Deal.findById(dealId)
      .populate("property_id")
      .populate("buyer_id")
      .populate("seller_id")
      .populate("agent_id")
      .populate("offer_id");
  },

  async getDealForBuyer(dealId: string, buyerId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId) || !mongoose.Types.ObjectId.isValid(buyerId)) {
      return null;
    }

    return Deal.findOne({
      _id: toObjectId(dealId),
      buyer_id: toObjectId(buyerId),
    })
      .populate("property_id")
      .populate("buyer_id")
      .populate("seller_id")
      .populate("agent_id")
      .populate("offer_id");
  },

  async getDealForAgent(dealId: string, agentId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId) || !mongoose.Types.ObjectId.isValid(agentId)) {
      return null;
    }

    return Deal.findOne({
      _id: toObjectId(dealId),
      agent_id: toObjectId(agentId),
    })
      .populate("property_id")
      .populate("buyer_id")
      .populate("seller_id")
      .populate("agent_id")
      .populate("offer_id");
  },

  async getDealForSeller(dealId: string, sellerId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return null;
    }

    return Deal.findOne({
      _id: toObjectId(dealId),
      seller_id: toObjectId(sellerId),
    })
      .populate("property_id")
      .populate("buyer_id")
      .populate("seller_id")
      .populate("agent_id")
      .populate("offer_id");
  },

  isStatusAllowingContractUpload(status: DealStatus) {
    const allowedStatuses: DealStatus[] = ["active", "awaiting_contract", "contract_under_review"];
    return allowedStatuses.includes(status);
  },

  async getDealsForAgent(agentId: string, filters: DealListFilters = {}) {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return [];
    }

    const query: any = {
      agent_id: toObjectId(agentId),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.propertyId && mongoose.Types.ObjectId.isValid(filters.propertyId)) {
      query.property_id = toObjectId(filters.propertyId);
    }

    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
      if (filters.fromDate) {
        query.createdAt.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        query.createdAt.$lte = new Date(filters.toDate);
      }
    }

    return Deal.find(query)
      .sort({ createdAt: -1 })
      .populate("property_id")
      .populate("buyer_id")
      .populate("seller_id")
      .populate("agent_id")
      .populate("offer_id");
  },

  async getDealsForSeller(sellerId: string, filters: DealListFilters = {}) {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return [];
    }

    const query: any = {
      seller_id: toObjectId(sellerId),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.propertyId && mongoose.Types.ObjectId.isValid(filters.propertyId)) {
      query.property_id = toObjectId(filters.propertyId);
    }

    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
      if (filters.fromDate) {
        query.createdAt.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        query.createdAt.$lte = new Date(filters.toDate);
      }
    }

    return Deal.find(query)
      .sort({ createdAt: -1 })
      .populate("property_id")
      .populate("buyer_id")
      .populate("seller_id")
      .populate("agent_id")
      .populate("offer_id");
  },

  async updateStatus(
    dealId: string,
    status: DealStatus,
    options: Partial<Pick<IDeal, "audit" | "amounts" | "compliance" | "meta">> = {}
  ) {
    return Deal.findByIdAndUpdate(
      dealId,
      {
        status,
        ...options,
      },
      { new: true }
    );
  },
};