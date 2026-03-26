// src/services/payment.service.ts
import mongoose from "mongoose";
import Deal from "../models/deal.model";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import { createNotification } from "../utils/notificationHelper";
import { notifyPaymentSuccessBuyer, notifyPaymentSuccessSellerAgent } from "../utils/notificationHelper";
import Property from "../models/property.model";
import { formatVND } from "../utils/formatMoney";


const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

export async function createEscrowPayment(buyerId: string, dealId: string) {
  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    const err: any = new Error("DealId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const deal = await Deal.findById(dealId)
    .populate("seller_id", "fullName email phone")
    .populate("agent_id", "fullName email phone")
    .populate("property_id", "title address price");

  if (!deal) {
    const err: any = new Error("Deal không tồn tại");
    err.status = 404;
    throw err;
  }

  if (String(deal.buyer_id) !== buyerId) {
    const err: any = new Error("Bạn không có quyền thanh toán deal này");
    err.status = 403;
    throw err;
  }

  const existingCompleted = await Payment.findOne({
    deal_id: deal._id,
    type: "escrow_fund",
    status: "completed",
  });

  if (existingCompleted) {
    const err: any = new Error("Hợp đồng đã được thanh toán escrow");
    err.status = 400;
    throw err;
  }

  // compute fees
  const agreedPrice = deal.amounts?.agreed_price ?? 0;
  const platformFeeRate = Number(process.env.DEFAULT_PLATFORM_FEE_RATE ?? 5) / 100;
  const agentFeeRate = Number(process.env.DEFAULT_AGENT_FEE_RATE ?? 2) / 100;

  const platformFee = Math.round(agreedPrice * platformFeeRate);
  const agentFee = Math.round(agreedPrice * agentFeeRate);

  const amountToPay = agreedPrice;

  const payment = await Payment.findOneAndUpdate(
    {
      deal_id: deal._id,
      type: "escrow_fund",
      status: "pending",
    },
    {
      $setOnInsert: {
        amount: amountToPay,
        currency: deal.amounts.currency || "VND",
        method: "payos_qr",
        initiated_by: buyerId,
        notes: `Escrow initiation for deal ${dealId}`,
        createdAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  // update deal status only if newly created
  if (deal.status !== "awaiting_escrow_payment") {
    deal.status = "awaiting_escrow_payment";
    deal.audit = deal.audit || {};
    (deal.audit as any).escrow_created_at = new Date();
    await deal.save();
  }

  const qrUrl = `${process.env.FRONTEND_URL ?? ""}/pay/qr-demo?paymentId=${payment._id}&amount=${amountToPay}`;

  return {
    paymentId: String(payment._id),
    qrUrl,
    amount: amountToPay,
    platformFee,
    agentFee,
    deal: {
      _id: deal._id,
      status: deal.status,
      property: deal.property_id,
      buyer: deal.buyer_id,
      seller: deal.seller_id,
      agent: deal.agent_id,
      amounts: deal.amounts,
      audit: deal.audit,
    },
  };
}


export async function confirmEscrowPayment(paymentId: string, opts?: { externalRef?: string, paidAt?: Date }) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    const err: any = new Error("PaymentId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    const err: any = new Error("Payment không tồn tại");
    err.status = 404;
    throw err;
  }

  if (payment.status === "completed") {
    return payment; // idempotent
  }

  // set completed
  payment.status = "completed";
  payment.payment_date = opts?.paidAt ?? new Date();
  if (opts?.externalRef) payment.external_ref = opts.externalRef;
  await payment.save();

  // update deal
  const deal = await Deal.findById(payment.deal_id);
  if (!deal) {
    throw Object.assign(new Error("Deal liên quan không tồn tại"), { status: 404 });
  }

  // set escrow_funded (money is in escrow now)
  (deal as any).status = "escrow_funded";
  deal.audit = deal.audit || {};
  (deal.audit as any).escrow_funded_at = new Date();
  await deal.save();

  await Payment.updateMany(
    {
      deal_id: payment.deal_id,
      _id: { $ne: payment._id },
      type: "escrow_fund",
      status: "pending",
    },
    {
      $set: { status: "cancelled", notes: "Cancelled due to another payment completed", payment_date: new Date() },
    }
  );

  // notify buyer/seller/agent that escrow is paid (but not yet released)
  try {
    await createNotification(
      String(payment.initiated_by),
      "Thanh toán Escrow thành công",
      `Bạn đã thanh toán ${formatVND(payment.amount)}. Tiền đang được giữ an toàn bởi sàn.`,
      { relatedId: String(deal._id), type: "system" }
    );

    // notify seller & agent: buyer paid escrow (not "you received money")
    const sellerId = String((deal as any).seller_id);
    const agentId = String((deal as any).agent_id);

    if (sellerId) {
      await createNotification(
        sellerId,
        "Buyer đã thanh toán Escrow",
        `Người mua đã thanh toán ${formatVND(payment.amount)} vào escrow cho BĐS "${(deal as any).property_id?.title ?? ""}". Vui lòng chuẩn bị thủ tục.`,
        { relatedId: String(deal._id), type: "system" }
      );
    }

    if (agentId) {
      await createNotification(
        agentId,
        "Buyer đã thanh toán Escrow",
        `Người mua đã thanh toán ${formatVND(payment.amount)} vào escrow cho deal ${String(deal._id)}.`,
        { relatedId: String(deal._id), type: "system" }
      );
    }
  } catch (err) {
    console.error("notify after confirmEscrowPayment failed", err);
  }

  return payment;
}

export async function releaseEscrow(adminId: string, dealId: string) {
  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    const err: any = new Error("DealId không hợp lệ");
    err.status = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deal = await Deal.findById(dealId).session(session).populate("seller_id agent_id property_id");
    if (!deal) throw Object.assign(new Error("Deal không tồn tại"), { status: 404 });

    // find completed escrow payment
    const escrowPayment = await Payment.findOne({ deal_id: deal._id, type: "escrow_fund", status: "completed" }).session(session);
    if (!escrowPayment) throw Object.assign(new Error("Escrow payment chưa có hoặc chưa hoàn tất"), { status: 400 });

    const agreedPrice = deal.amounts?.agreed_price ?? 0;
    const platformFeeRate = Number(process.env.DEFAULT_PLATFORM_FEE_RATE ?? 5) / 100;
    const agentFeeRate = Number(process.env.DEFAULT_AGENT_FEE_RATE ?? 2) / 100;

    const platformFee = Math.round(agreedPrice * platformFeeRate);
    const agentFee = Math.round(agreedPrice * agentFeeRate);
    const sellerPayout = agreedPrice - platformFee - agentFee;

    // create release payments (simulate transfers)
    const releaseToSeller = await Payment.create([{
      deal_id: deal._id,
      type: "release_to_seller",
      status: "completed",
      amount: sellerPayout,
      currency: deal.amounts.currency,
      method: "internal_release",
      initiated_by: new mongoose.Types.ObjectId(adminId),
      processed_by: new mongoose.Types.ObjectId(adminId),
      notes: "Release escrow to seller",
      payment_date: new Date()
    }], { session });

    const agentPayment = await Payment.create([{
      deal_id: deal._id,
      type: "agent_fee",
      status: "completed",
      amount: agentFee,
      currency: deal.amounts.currency,
      method: "internal_release",
      initiated_by: new mongoose.Types.ObjectId(adminId),
      processed_by: new mongoose.Types.ObjectId(adminId),
      notes: "Agent fee release",
      payment_date: new Date()
    }], { session });

    const platformPayment = await Payment.create([{
      deal_id: deal._id,
      type: "platform_fee",
      status: "completed",
      amount: platformFee,
      currency: deal.amounts.currency,
      method: "internal_release",
      initiated_by: new mongoose.Types.ObjectId(adminId),
      processed_by: new mongoose.Types.ObjectId(adminId),
      notes: "Platform fee retained",
      payment_date: new Date()
    }], { session });

    // update deal
    deal.status = "completed";
    deal.audit = deal.audit || {};
    (deal.audit as any).released_at = new Date();
    (deal.audit as any).completed_at = new Date();
    await deal.save({ session });

    const property = await Property.findById(deal.property_id)
      .populate("type_id")
      .session(session);

    if (!property) throw new Error("Property không tồn tại");

    const typeNameVi = (property.type_id as any)?.type_name?.vi?.trim();

    let newStatus = "sold";
    if (typeNameVi === "Cho thuê") newStatus = "rented";

    await Property.findByIdAndUpdate(
      property._id,
      { status: newStatus },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // notifications (outside txn)
    try {
      const buyerId = String(deal.buyer_id);
      const sellerId = String((deal as any).seller_id._id ?? (deal as any).seller_id);
      const agentId = String((deal as any).agent_id._id ?? (deal as any).agent_id);

      await createNotification(buyerId, "Giao dịch hoàn tất", `Giao dịch ${String(deal._id)} đã hoàn tất. Cảm ơn bạn.`);
      await createNotification(sellerId, "Bạn đã nhận tiền", `Số tiền ${sellerPayout} ${deal.amounts.currency} đã được giải ngân.`);
      await createNotification(agentId, "Hoa hồng đã được chuyển", `Số tiền ${agentFee} ${deal.amounts.currency} đã được chuyển cho bạn.`);
    } catch (notifyErr) {
      console.error("notify after release failed", notifyErr);
    }

    return { deal, releaseToSeller, agentPayment, platformPayment };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

export async function getPaymentsByBuyer(
  buyerId: string,
  filters: {
    dealId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  const { dealId, type, status, page = 1, limit = 10 } = filters;

  // Tìm tất cả deal mà buyer này tham gia
  const deals = await Deal.find({ buyer_id: buyerId }).select("_id");

  const dealIds = deals.map((d) => d._id);

  const query: any = {
    deal_id: { $in: dealIds },
    initiated_by: new mongoose.Types.ObjectId(buyerId)
  };

  if (dealId && mongoose.Types.ObjectId.isValid(dealId)) {
    query.deal_id = new mongoose.Types.ObjectId(dealId);
  }

  if (status) query.status = status;
  else query.status = { $in: ["pending", "processing", "completed"] };

  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Payment.find(query)
      .populate("deal_id", "property_id seller_id agent_id amounts")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


export async function getPaymentsBySeller(
  sellerId: string,
  filters: {
    dealId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  const { dealId, type, status, page = 1, limit = 10 } = filters;

  // Tìm tất cả deal mà seller này tham gia
  const deals = await Deal.find({ seller_id: sellerId }).select("_id");

  const dealIds = deals.map((d) => d._id);

  const query: any = { deal_id: { $in: dealIds } };

  if (dealId && mongoose.Types.ObjectId.isValid(dealId)) {
    query.deal_id = new mongoose.Types.ObjectId(dealId);
  }

  if (status) query.status = status;
  else query.status = { $in: ["pending", "processing", "completed"] };

  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Payment.find(query)
      .populate("deal_id", "property_id seller_id agent_id amounts")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPaymentsByDealId(buyerId: string, dealId: string) {
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

  if (String(deal.buyer_id) !== buyerId) {
    const err: any = new Error("Bạn không có quyền xem thanh toán của deal này");
    err.status = 403;
    throw err;
  }

  const payments = await Payment.find({ deal_id: dealId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    dealId,
    total: payments.length,
    payments,
  };
}

