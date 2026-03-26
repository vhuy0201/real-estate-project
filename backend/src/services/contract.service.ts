import mongoose from "mongoose";
import Contract, {
  ContractStatus,
  ContractType,
  ContractUploaderRole,
} from "../models/contract.model";
import Deal, { DealStatus } from "../models/deal.model";
import { notifyBuyerContractDecision, notifyBuyerToPayEscrow } from "../utils/notificationHelper";
import User from "../models/user.model";


const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

interface CreateOrReplaceParams {
  dealId: string;
  actorId: string;
  actorRole: ContractUploaderRole;
  fileUrl: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  contractType?: ContractType;
  status?: ContractStatus;
  notes?: string;
  allowReplace?: boolean;
}

const BUYER_CONTRACT_ALLOWED_STATUSES: DealStatus[] = [
  "active",
  "awaiting_contract",
  "contract_under_review",
  "awaiting_escrow_payment",  
  "escrow_funded",
  "completed",
];

const BUYER_CONTRACT_UPLOADABLE_STATUSES: DealStatus[] = [
  "awaiting_contract",
  "contract_under_review",
  "awaiting_escrow_payment",
];

interface BuyerContractUploadParams {
  dealId: string;
  buyerId: string;
  fileUrl: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  notes?: string;
}

interface BuyerContractListOptions {
  includeHistory?: boolean;
}

type BuyerContractDecision = "approved" | "rejected";
const BUYER_DECISION_ALLOWED_CONTRACT_STATUSES: ContractStatus[] = [
  "submitted",
  "under_review",
];

const ensureBuyerDealAccess = async (
  dealId: string,
  buyerId: string,
  allowedStatuses: DealStatus[],
) => {
  if (!mongoose.Types.ObjectId.isValid(dealId) || !mongoose.Types.ObjectId.isValid(buyerId)) {
    const err: any = new Error("Invalid identifiers");
    err.status = 400;
    throw err;
  }

  const deal = await Deal.findOne({
    _id: toObjectId(dealId),
    buyer_id: toObjectId(buyerId),
  });

  if (!deal) {
    const err: any = new Error("Deal không tồn tại hoặc bạn không có quyền truy cập");
    err.status = 404;
    throw err;
  }

  if (!allowedStatuses.includes(deal.status as DealStatus)) {
    const err: any = new Error("Deal không ở trạng thái cho phép thao tác hợp đồng");
    err.status = 403;
    throw err;
  }

  return deal;
};

export const contractService = {
  async getLatestByDeal(dealId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId)) return null;

    return Contract.findOne({
      deal_id: toObjectId(dealId),
      deleted: { $ne: true },
    }).sort({ version: -1 });
  },

  async getHistoryByDeal(dealId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId)) return [];

    return Contract.find({
      deal_id: toObjectId(dealId),
      deleted: { $ne: true },
    }).sort({ version: -1 });
  },

  async createOrReplaceByDeal(params: CreateOrReplaceParams) {
    const {
      dealId,
      actorId,
      actorRole,
      fileUrl,
      originalFilename,
      mimeType,
      fileSize,
      contractType,
      status = "submitted",
      notes,
      allowReplace = false,
    } = params;

    if (!mongoose.Types.ObjectId.isValid(dealId) || !mongoose.Types.ObjectId.isValid(actorId)) {
      const err: any = new Error("Invalid identifiers");
      err.status = 400;
      throw err;
    }

    const dealObjectId = toObjectId(dealId);
    const actorObjectId = toObjectId(actorId);

    const latest = await Contract.findOne({
      deal_id: dealObjectId,
      deleted: { $ne: true },
    }).sort({ version: -1 });

    if (!allowReplace && latest && latest.status !== "superseded") {
      const err: any = new Error("Contract already exists for this deal. Use replace endpoint.");
      err.status = 409;
      throw err;
    }

    const nextVersion = (latest?.version ?? 0) + 1;

    if (latest && latest.status !== "superseded") {
      latest.status = "superseded";
      latest.replaced_at = new Date();
      await latest.save();
    }

    const contract = await Contract.create({
      deal_id: dealObjectId,
      file_url: fileUrl,
      version: nextVersion,
      uploaded_by: actorObjectId,
      role_of_uploader: actorRole,
      original_filename: originalFilename,
      mime_type: mimeType,
      file_size: fileSize,
      contract_type: contractType || "initial",
      status,
      notes,
    });

    return contract;
  },

  async deleteLatestByDeal(dealId: string) {
    if (!mongoose.Types.ObjectId.isValid(dealId)) {
      const err: any = new Error("Invalid deal id");
      err.status = 400;
      throw err;
    }

    const latest = await Contract.findOne({
      deal_id: toObjectId(dealId),
      deleted: { $ne: true },
    }).sort({ version: -1 });

    if (!latest) {
      const err: any = new Error("No contract found for this deal");
      err.status = 404;
      throw err;
    }

    latest.deleted = true;
    latest.deleted_at = new Date();
    await latest.save();

    const nextContract = await Contract.findOne({
      deal_id: toObjectId(dealId),
      deleted: { $ne: true },
    }).sort({ version: -1 });

    if (nextContract && nextContract.status === "superseded") {
      nextContract.status = "submitted";
      nextContract.replaced_at = undefined;
      await nextContract.save();
    }

    return { deleted: true };
  },

  async deleteContractById(contractId: string, dealId: string) {
    if (!mongoose.Types.ObjectId.isValid(contractId) || !mongoose.Types.ObjectId.isValid(dealId)) {
      const err: any = new Error("Invalid identifiers");
      err.status = 400;
      throw err;
    }

    const contract = await Contract.findOne({
      _id: toObjectId(contractId),
      deal_id: toObjectId(dealId),
    });

    if (!contract) {
      const err: any = new Error("Hợp đồng không tồn tại hoặc đã bị xóa");
      err.status = 404;
      throw err;
    }

    await Contract.deleteOne({ _id: contract._id });

    return { deleted: true, contractId: contract._id, hardDelete: true };
  },

  async getContractByDeal(dealId: string, buyerId: string) {
    await ensureBuyerDealAccess(dealId, buyerId, BUYER_CONTRACT_ALLOWED_STATUSES);

    const contract = await contractService.getLatestByDeal(dealId);
    if (!contract) {
      const err: any = new Error("Chưa có hợp đồng cho deal này");
      err.status = 404;
      throw err;
    }

    return contract;
  },

  async createOrReplaceContract(params: BuyerContractUploadParams) {
    const { dealId, buyerId, fileUrl, originalFilename, mimeType, fileSize, notes } = params;

    await ensureBuyerDealAccess(dealId, buyerId, BUYER_CONTRACT_UPLOADABLE_STATUSES);

    return contractService.createOrReplaceByDeal({
      dealId,
      actorId: buyerId,
      actorRole: "buyer",
      fileUrl,
      originalFilename,
      mimeType,
      fileSize,
      contractType: "buyer_signed",
      status: "submitted",
      notes,
      allowReplace: true,
    });
  },

  async getContractsForBuyer(
    buyerId: string,
    options: BuyerContractListOptions = {},
  ) {
    const { includeHistory = false } = options;

    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      const err: any = new Error("Invalid buyer id");
      err.status = 400;
      throw err;
    }

    const deals = await Deal.find({
      buyer_id: toObjectId(buyerId),
      status: { $in: BUYER_CONTRACT_ALLOWED_STATUSES },
    })
      .populate("property_id")
      .populate("agent_id")
      .populate("seller_id")
      .sort({ createdAt: -1 })
      .lean();

    if (!deals.length) return [];

    const dealIds = deals.map((deal) => deal._id);
    const dealMap = new Map<string, (typeof deals)[number]>(
      deals.map((deal) => [deal._id.toString(), deal]),
    );

    if (includeHistory) {
      const contracts = await Contract.find({
        deal_id: { $in: dealIds },
        deleted: { $ne: true },
      })
        .sort({ deal_id: 1, version: -1 })
        .lean();

      return contracts.map((contract) => ({
        contract,
        deal: dealMap.get(contract.deal_id.toString()),
      }));
    }

    const latestContracts = await Contract.aggregate([
      {
        $match: {
          deal_id: { $in: dealIds },
          deleted: { $ne: true },
        },
      },
      { $sort: { deal_id: 1, version: -1 } },
      {
        $group: {
          _id: "$deal_id",
          contract: { $first: "$$ROOT" },
        },
      },
    ]);

    return latestContracts.map(({ _id, contract }) => ({
      contract,
      deal: dealMap.get(_id.toString()),
    }));
  },

  async reviewContract(params: {
    contractId: string;
    dealId: string;
    buyerId: string;
    decision: "approved" | "rejected";
    notes?: string;
  }) {
    const { contractId, dealId, buyerId, decision, notes } = params;

    if (!mongoose.Types.ObjectId.isValid(contractId) || !mongoose.Types.ObjectId.isValid(dealId)) {
      throw Object.assign(new Error("ID không hợp lệ"), { status: 400 });
    }

    const contract = await Contract.findOne({
      _id: toObjectId(contractId),
      deal_id: toObjectId(dealId),
      deleted: { $ne: true },
    });

    if (!contract) {
      throw Object.assign(new Error("Hợp đồng không tồn tại"), { status: 404 });
    }

    if (!["submitted", "under_review"].includes(contract.status)) {
      throw Object.assign(new Error("Hợp đồng không ở trạng thái chờ duyệt"), { status: 400 });
    }

    const deal = await Deal.findOne({
      _id: toObjectId(dealId),
      buyer_id: toObjectId(buyerId),
    })
      .populate("seller_id", "fullName")
      .populate("agent_id", "fullName")
      .populate("property_id", "title");

    if (!deal) {
      throw Object.assign(new Error("Bạn không có quyền thao tác trên giao dịch này"), { status: 403 });
    }

    if (decision === "approved") {
      contract.status = "approved";
      contract.approved_by = new mongoose.Types.ObjectId(buyerId);
      contract.approved_at = new Date();
      // update contract_type thành "buyer_signed"
      contract.contract_type = "buyer_signed";
      deal.status = "awaiting_escrow_payment";
      await deal.save();

      try {
        const propertyTitle =
          typeof deal.property_id === "object" && deal.property_id !== null
            ? (deal.property_id as any).title || "bất động sản"
            : "bất động sản";

        const agreedPrice = deal.amounts?.agreed_price ?? 0;
        const platformFeeRate = Number(process.env.DEFAULT_PLATFORM_FEE_RATE ?? 4) / 100;
        const agentFeeRate = Number(process.env.DEFAULT_AGENT_FEE_RATE ?? 2) / 100;

        const platformFee = Math.round(agreedPrice * platformFeeRate);
        const agentFee = Math.round(agreedPrice * agentFeeRate);

        await notifyBuyerToPayEscrow(
          buyerId,
          String(deal._id),
          propertyTitle,
          platformFee,
          agentFee
        );

      } catch (err) {
        console.error("Failed to send escrow payment notification", err);
      }

    } else {
      contract.status = "rejected";
      contract.notes = notes; // Lưu lý do từ chối vào notes
    }

    await contract.save();

    try {
      const buyer = await User.findById(buyerId).select("fullName").lean();
      if (buyer) {
        await notifyBuyerContractDecision({
          deal,
          buyerName: buyer.fullName,
          contractId: String(contract._id),
          decision,
          notes
        });
      }
    } catch (err) {
      console.error("Failed to send contract decision notification", err);
    }

    return contract;
  },

  async acceptContractByBuyer(dealId: string, buyerId: string, notes?: string) {
    return updateBuyerDecision({
      dealId,
      buyerId,
      targetStatus: "approved",
      notes,
    });
  },

  async rejectContractByBuyer(dealId: string, buyerId: string, notes?: string) {
    return updateBuyerDecision({
      dealId,
      buyerId,
      targetStatus: "rejected",
      notes,
    });
  },
};

interface BuyerDecisionParams {
  dealId: string;
  buyerId: string;
  targetStatus: BuyerContractDecision;
  notes?: string;
}

const updateBuyerDecision = async ({
  dealId,
  buyerId,
  targetStatus,
  notes,
}: BuyerDecisionParams) => {
  const deal = await ensureBuyerDealAccess(dealId, buyerId, BUYER_CONTRACT_ALLOWED_STATUSES);

  const contract = await contractService.getLatestByDeal(dealId);
  if (!contract) {
    const err: any = new Error("Chưa có hợp đồng để cập nhật trạng thái");
    err.status = 404;
    throw err;
  }

  if (contract.status === targetStatus) {
    const err: any = new Error(
      targetStatus === "approved"
        ? "Bạn đã đồng ý với hợp đồng này trước đó"
        : "Bạn đã từ chối hợp đồng này trước đó",
    );
    err.status = 409;
    throw err;
  }

  if (!BUYER_DECISION_ALLOWED_CONTRACT_STATUSES.includes(contract.status)) {
    const err: any = new Error(
      "Hợp đồng không ở trạng thái cho phép người mua chấp nhận hoặc từ chối",
    );
    err.status = 400;
    throw err;
  }

  contract.status = targetStatus;
  contract.approved_by = toObjectId(buyerId);
  contract.approved_at = new Date();
  if (notes) {
    contract.notes = notes;
  }
  await contract.save();

  await deal.populate([
    { path: "property_id", select: "title" },
    { path: "seller_id", select: "fullName" },
    { path: "agent_id", select: "fullName" },
    { path: "buyer_id", select: "fullName" },
  ]);

  return { contract, deal };
};
