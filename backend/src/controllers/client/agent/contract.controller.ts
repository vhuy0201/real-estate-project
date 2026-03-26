import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { dealService } from "../../../services/deal.service";
import { contractService } from "../../../services/contract.service";
import { notifyContractUploaded } from "../../../utils/notificationHelper";
import { DealStatus, IDeal } from "../../../models/deal.model";
import { ContractStatus, ContractType } from "../../../models/contract.model";

const CONTRACT_TYPES: ContractType[] = ["initial", "buyer_signed", "final"];
const CONTRACT_UPLOADABLE_STATUSES: ContractStatus[] = ["draft", "submitted"];

const getUserIdFromRequest = (req: Request) => {
  const user = (req as any).user;
  return user?.id || user?._id;
};

const getStringId = (value: any) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value.toString) return value.toString();
  return undefined;
};

const getPropertyTitle = (deal: IDeal & { property_id?: any }) => {
  const property: any = deal.property_id;
  if (!property) return "bất động sản";
  if (typeof property === "string") return property;
  return property?.title?.vi || property?.title?.en || property?.title || "bất động sản";
};

const sanitizeContractType = (value: any): ContractType | undefined => {
  if (typeof value !== "string") return undefined;
  return CONTRACT_TYPES.includes(value as ContractType) ? (value as ContractType) : undefined;
};

const sanitizeContractStatus = (value: any): ContractStatus => {
  if (typeof value !== "string") return "submitted";
  const normalized = value as ContractStatus;
  if (!CONTRACT_UPLOADABLE_STATUSES.includes(normalized)) return "submitted";
  return normalized;
};

const ensureDealForAgent = async (dealId: string, agentId: string) => {
  const deal = await dealService.getDealForAgent(dealId, agentId);
  if (!deal) {
    const err: any = new Error("Deal không tồn tại hoặc bạn không có quyền truy cập");
    err.status = 404;
    throw err;
  }

  if (!dealService.isStatusAllowingContractUpload(deal.status as DealStatus)) {
    const err: any = new Error("Deal không ở trạng thái cho phép thao tác hợp đồng");
    err.status = 400;
    throw err;
  }

  return deal;
};

const extractFileUrl = (req: Request) => {
  const body = req.body as any;
  return body?.file_url || body?.file;
};

const sendContractNotification = async (
  deal: any,
  contractId: string,
  action: "uploaded" | "updated"
) => {
  const buyerId = getStringId(deal?.buyer_id?._id || deal?.buyer_id);
  const sellerId = getStringId(deal?.seller_id?._id || deal?.seller_id);
  const recipients = [buyerId, sellerId].filter(Boolean) as string[];

  if (!recipients.length) return;

  const agentName =
    (deal?.agent_id && deal.agent_id.fullName) ||
    (deal?.agent_id && deal.agent_id.name) ||
    "Agent";
  const propertyTitle = getPropertyTitle(deal);

  await notifyContractUploaded({
    recipientIds: recipients,
    actorName: agentName,
    actorRole: "agent",
    propertyTitle,
    dealId: getStringId(deal?._id) || "",
    contractId,
    action,
  });
};

export const uploadContract = async (req: Request, res: Response) => {
  try {
    const agentId = getUserIdFromRequest(req);
    const { dealId } = req.params;

    if (!agentId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    const fileUrl = extractFileUrl(req);
    if (!fileUrl) {
      return errorResponse(req, res, "Không tìm thấy file tải lên", 400);
    }

    const deal = await ensureDealForAgent(dealId, agentId);

    const contractType = sanitizeContractType((req.body as any)?.contract_type);
    const status = sanitizeContractStatus((req.body as any)?.status);

    const contract = await contractService.createOrReplaceByDeal({
      dealId,
      actorId: agentId,
      actorRole: "agent",
      fileUrl,
      originalFilename: req.file?.originalname,
      mimeType: req.file?.mimetype,
      fileSize: req.file?.size,
      contractType,
      status,
      notes: (req.body as any)?.notes,
      allowReplace: false,
    });

    await dealService.updateDealStatus(
      dealId,
      "contract_under_review",
      agentId
    );

    await sendContractNotification(deal, String(contract._id), "uploaded");

    return successResponse(req, res, "Upload hợp đồng thành công", contract);
  } catch (error: any) {
    console.error("uploadContract error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Upload hợp đồng thất bại", status);
  }
};

export const replaceContract = async (req: Request, res: Response) => {
  try {
    const agentId = getUserIdFromRequest(req);
    const { dealId } = req.params;

    if (!agentId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    const fileUrl = extractFileUrl(req);
    if (!fileUrl) {
      return errorResponse(req, res, "Không tìm thấy file tải lên", 400);
    }

    const deal = await ensureDealForAgent(dealId, agentId);

    const contractType = sanitizeContractType((req.body as any)?.contract_type);
    const status = sanitizeContractStatus((req.body as any)?.status);

    const contract = await contractService.createOrReplaceByDeal({
      dealId,
      actorId: agentId,
      actorRole: "agent",
      fileUrl,
      originalFilename: req.file?.originalname,
      mimeType: req.file?.mimetype,
      fileSize: req.file?.size,
      contractType,
      status,
      notes: (req.body as any)?.notes,
      allowReplace: true,
    });

    await sendContractNotification(deal, String(contract._id), "updated");

    return successResponse(req, res, "Cập nhật hợp đồng thành công", contract);
  } catch (error: any) {
    console.error("replaceContract error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Cập nhật hợp đồng thất bại", status);
  }
};

export const getContractByDeal = async (req: Request, res: Response) => {
  try {
    const agentId = getUserIdFromRequest(req);
    const { dealId } = req.params;

    if (!agentId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    await ensureDealForAgent(dealId, agentId);

    const includeHistory = ["true", "1", "yes"].includes(
      String(req.query.history || "").toLowerCase()
    );

    if (includeHistory) {
      const contracts = await contractService.getHistoryByDeal(dealId);
      return successResponse(req, res, "Lấy danh sách hợp đồng thành công", contracts);
    }

    const contract = await contractService.getLatestByDeal(dealId);
    if (!contract) {
      return errorResponse(req, res, "Chưa có hợp đồng cho deal này", 404);
    }

    return successResponse(req, res, "Lấy hợp đồng thành công", contract);
  } catch (error: any) {
    console.error("getContractByDeal error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Lấy hợp đồng thất bại", status);
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  try {
    const agentId = getUserIdFromRequest(req);

    const { dealId, contractId } = req.params;

    if (!agentId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    if (!contractId) {
      return errorResponse(req, res, "Thiếu ID hợp đồng", 400);
    }

    await ensureDealForAgent(dealId, agentId);

    await contractService.deleteContractById(contractId, dealId);

    return successResponse(req, res, "Xóa hợp đồng thành công", { deleted: true, id: contractId });
  } catch (error: any) {
    console.error("deleteContract error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Xóa hợp đồng thất bại", status);
  }
};

// Lấy danh sách tất cả hợp đồng của Deal (chưa bị xóa)
export const getAllContracts = async (req: Request, res: Response) => {
  try {
    const agentId = getUserIdFromRequest(req);
    const { dealId } = req.params;

    if (!agentId) {
      return errorResponse(req, res, "Không xác định người dùng", 401);
    }

    await ensureDealForAgent(dealId, agentId);

    const contracts = await contractService.getHistoryByDeal(dealId);

    return successResponse(req, res, "Lấy danh sách hợp đồng thành công", contracts);
  } catch (error: any) {
    console.error("getAllContracts error:", error);
    const status = error?.status || 500;
    return errorResponse(req, res, error.message || "Lấy danh sách thất bại", status);
  }
};