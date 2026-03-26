import Deal, { DealStatus, IDeal } from "../../models/deal.model";
import mongoose from "mongoose";
import { notifyDealStatusChange } from "../../utils/notificationHelper";

const parsePagination = (query: any) => {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const dealAdminService = {
    async getDeals(queryParams: any) {
        const { skip, limit, page } = parsePagination(queryParams);
        const { status, property_id, buyer_id, seller_id, agent_id } = queryParams;

        const query: mongoose.FilterQuery<IDeal> = {};

        if (status) query.status = status;
        if (property_id && mongoose.Types.ObjectId.isValid(property_id)) {
            query.property_id = new mongoose.Types.ObjectId(property_id);
        }
        if (buyer_id && mongoose.Types.ObjectId.isValid(buyer_id)) {
            query.buyer_id = new mongoose.Types.ObjectId(buyer_id);
        }
        if (seller_id && mongoose.Types.ObjectId.isValid(seller_id)) {
            query.seller_id = new mongoose.Types.ObjectId(seller_id);
        }
        if (agent_id && mongoose.Types.ObjectId.isValid(agent_id)) {
            query.agent_id = new mongoose.Types.ObjectId(agent_id);
        }

        const deals = await Deal.find(query)
            .populate("property_id", "title")
            .populate("buyer_id", "fullName email")
            .populate("seller_id", "fullName email")
            .populate("agent_id", "fullName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalDocs = await Deal.countDocuments(query);
        const totalPages = Math.ceil(totalDocs / limit);

        return {
            data: deals,
            pagination: { totalDocs, totalPages, page, limit },
        };
    },

    async getDealById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("ID Deal không hợp lệ");
        }
        return Deal.findById(id)
            .populate("property_id")
            .populate("offer_id")
            .populate("buyer_id", "fullName email phone")
            .populate("seller_id", "fullName email phone")
            .populate("agent_id", "fullName email phone");
    },

    async updateDealStatus(
        id: string,
        status: DealStatus,
        adminName: string,
        cancellation_reason?: string
    ) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("ID Deal không hợp lệ");
        }

        const deal = await Deal.findById(id)
            .populate("property_id", "title")
            .populate("buyer_id", "_id")
            .populate("seller_id", "_id")
            .populate("agent_id", "_id");

        if (!deal) {
            throw new Error("Không tìm thấy deal");
        }

        // Khởi tạo audit nếu chưa có
        if (!deal.audit) {
            deal.audit = {};
        }

        // Cập nhật status
        deal.status = status;

        // Cập nhật các trường audit
        if (status === "cancelled") {
            deal.audit.cancelled_at = new Date();
            if (cancellation_reason) {
                deal.audit.cancellation_reason = cancellation_reason;
            }
        }

        if (status === "completed") {
            deal.audit.completed_at = new Date();
        }

        // Lưu deal
        const updatedDeal = await deal.save();

        // Gửi notification
        await notifyDealStatusChange({
            deal: updatedDeal,
            newStatus: status,
            adminName,
        });

        return updatedDeal;
    },
};
