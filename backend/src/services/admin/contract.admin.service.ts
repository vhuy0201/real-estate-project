// src/services/admin/contract.admin.service.ts
import Contract, { IContract } from "../../models/contract.model";
import Deal, { IDeal } from "../../models/deal.model";
import mongoose from "mongoose";
import { notifyContractReviewResult } from "../../utils/notificationHelper";


const parsePagination = (query: any) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

const getPopulatedDeal = async (dealId: mongoose.Types.ObjectId): Promise<IDeal | null> => {
  return Deal.findById(dealId)
    .populate("property_id", "title")
    .populate("buyer_id", "_id fullName email")
    .populate("seller_id", "_id fullName email")
    .populate("agent_id", "_id fullName email")
    .exec();
};

export const contractAdminService = {
  async getContracts(queryParams: any) {
    const { skip, limit, page } = parsePagination(queryParams);
    const { deal_id, status, contract_type, uploaded_by } = queryParams;

    const query: mongoose.FilterQuery<IContract> = { deleted: { $ne: true } };

    if (deal_id && mongoose.Types.ObjectId.isValid(deal_id)) query.deal_id = toObjectId(deal_id);
    if (status) query.status = status;
    if (contract_type) query.contract_type = contract_type;
    if (uploaded_by && mongoose.Types.ObjectId.isValid(uploaded_by)) query.uploaded_by = toObjectId(uploaded_by);

    const contracts = await Contract.find(query)
      .populate("deal_id", "status")
      .populate("uploaded_by", "fullName email role")
      .populate("approved_by", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDocs = await Contract.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    return { data: contracts, pagination: { totalDocs, totalPages, page, limit } };
  },

  async getContractById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID Hợp đồng không hợp lệ");

    return Contract.findOne({ _id: toObjectId(id), deleted: { $ne: true } })
      .populate("deal_id")
      .populate("uploaded_by", "fullName email role")
      .populate("approved_by", "fullName email")
      .populate({
        path: "deal_id",
        select: "buyer_id seller_id agent_id property_id amounts status", 
        populate: [
          { path: "buyer_id", select: "fullName email phone avatar" },
          { path: "seller_id", select: "fullName email phone avatar" },
          { path: "agent_id", select: "fullName email phone avatar" },
          { path: "property_id", select: "title address" } 
        ]
      });
  },

  async approveContract(id: string, adminId: string, adminName: string) {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(adminId)) {
      throw new Error("ID không hợp lệ");
    }

    const contract = await Contract.findById(id);
    if (!contract || contract.deleted) throw new Error("Không tìm thấy hợp đồng");

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        status: "approved",
        approved_by: toObjectId(adminId),
        approved_at: new Date(),
      },
      { new: true }
    );

    const deal = updatedContract ? await getPopulatedDeal(updatedContract.deal_id as mongoose.Types.ObjectId) : null;

    if (updatedContract && deal) {
      await notifyContractReviewResult({
        contract: updatedContract,
        deal,
        result: "approved",
        adminName,
      });
    }

    return { contract: updatedContract as IContract, deal };
  },

  async rejectContract(id: string, adminId: string, notes?: string, adminName?: string) {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(adminId)) {
      throw new Error("ID không hợp lệ");
    }

    const contract = await Contract.findById(id);
    if (!contract || contract.deleted) throw new Error("Không tìm thấy hợp đồng");

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        approved_by: toObjectId(adminId), // ghi nhận người reject
        approved_at: new Date(),
        notes: notes || "Contract rejected by admin",
      },
      { new: true }
    );

    const deal = updatedContract ? await getPopulatedDeal(updatedContract.deal_id as mongoose.Types.ObjectId) : null;

    if (updatedContract && deal) {
      await notifyContractReviewResult({
        contract: updatedContract,
        deal,
        result: "rejected",
        adminName: adminName || "Admin",
        notes,
      });
    }

    return { contract: updatedContract as IContract, deal };
  },

  async deleteContract(id: string, adminId: string, adminName: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID Hợp đồng không hợp lệ");

    const contract = await Contract.findById(id);
    if (!contract || contract.deleted) throw new Error("Không tìm thấy hợp đồng");

    contract.deleted = true;
    contract.deleted_at = new Date();
    await contract.save();

    const deal = await getPopulatedDeal(contract.deal_id as mongoose.Types.ObjectId);

    if (deal) {
      await notifyContractReviewResult({
        contract,
        deal,
        result: "rejected",
        adminName,
        notes: "Hợp đồng đã bị xóa bởi admin",
      });
    }

    return { deleted: true, id };
  },
};
