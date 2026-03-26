import User from "../models/user.model";
import Property from "../models/property.model";
import Deal from "../models/deal.model";
import Review from "../models/review.model";
import mongoose from "mongoose";
class AgentService {
  async getPublicAgentInfo(agentId: string) {
    if (!mongoose.isValidObjectId(agentId)) return null;

    const agent = await User.findOne({
      _id: agentId,
      role: "agent",
      isActive: true
    }).select("fullName email phone avatar");

    if (!agent) return null;

    const soldCount = await Property.countDocuments({
      agent_id: agentId,
      status: "sold",
      deleted: false
    });

    const sellingCount = await Property.countDocuments({
      agent_id: agentId,
      status: { $in: ["approved", "available"] },
      deleted: false
    });

    return {
      agent,
      stats: {
        sold_properties: soldCount,
        active_listings: sellingCount
      }
    };
  }

  async getAgentSoldProperties(agentId: string) {
    return Property.find({
      agent_id: agentId,
      status: { $in: ["sold", "rented"] },
      deleted: false
    }).select("title price images address bedrooms bathrooms area city_id district_id ward_id")
      .populate("city_id", "city_name")
      .populate("district_id", "district_name")
      .populate("ward_id", "ward_name")
      .sort({ updatedAt: -1 });
  }

  async getAgentReviews(agentId: string) {
    return Review.find({
      target_id: agentId,
      target_type: "agent",
      is_hidden: false
    })
      .populate("user_id", "fullName avatar")
      .sort({ createdAt: -1 });
  }

  async getPublicAgents() {
    return User.find({
      role: "agent",
      isActive: true
    })
      .select("fullName email phone avatar createdAt")
      .sort({ createdAt: -1 });
  }
}

export const agentService = new AgentService();
