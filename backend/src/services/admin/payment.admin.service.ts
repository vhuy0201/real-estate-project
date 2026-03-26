import Payment, { IPayment } from "../../models/payment.model";
import Deal, { IDeal } from "../../models/deal.model";
import mongoose from "mongoose";

const parsePagination = (query: any) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

const getPopulatedDealForPayment = async (dealId: mongoose.Types.ObjectId): Promise<IDeal | null> => {
  return Deal.findById(dealId)
    .populate("property_id", "title")
    .populate("agent_id", "_id fullName email")
    .exec();
};

const getPopulatedPayment = async (paymentId: mongoose.Types.ObjectId): Promise<IPayment | null> => {
  return Payment.findById(paymentId)
    .populate("initiated_by", "_id fullName email")
    .populate("processed_by", "_id fullName email")
    .exec();
};

export const paymentAdminService = {
  async getPayments(queryParams: any) {
    const { skip, limit, page } = parsePagination(queryParams);
    const { deal_id, status, type, method, initiated_by } = queryParams;

    const query: mongoose.FilterQuery<IPayment> = {};
    if (deal_id && mongoose.Types.ObjectId.isValid(deal_id)) query.deal_id = toObjectId(deal_id);
    if (status) query.status = status;
    if (type) query.type = type;
    if (method) query.method = method;
    if (initiated_by && mongoose.Types.ObjectId.isValid(initiated_by)) query.initiated_by = toObjectId(initiated_by);

    const payments = await Payment.find(query)
      .populate("deal_id", "status")
      .populate("initiated_by", "fullName email")
      .populate("processed_by", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDocs = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    return { data: payments, pagination: { totalDocs, totalPages, page, limit } };
  },

  async createPayment(data: Partial<IPayment>): Promise<{ payment: IPayment; deal: IDeal | null }> {
    if (!data.deal_id || !data.initiated_by || !data.amount || !data.type) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    const newPayment = await Payment.create(data);

    const populatedPayment = await getPopulatedPayment(newPayment._id as mongoose.Types.ObjectId);
    const deal = await getPopulatedDealForPayment(newPayment.deal_id as mongoose.Types.ObjectId);

    return { payment: populatedPayment as IPayment, deal };
  },

  async getPaymentById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID Thanh toán không hợp lệ");
    return Payment.findById(id)
      .populate("deal_id")
      .populate("initiated_by", "fullName email")
      .populate("processed_by", "fullName email");
  },

  async updatePayment(id: string, data: Partial<IPayment>): Promise<{ payment: IPayment; deal: IDeal | null }> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID Thanh toán không hợp lệ");

    const updatedPayment = await Payment.findByIdAndUpdate(id, data, { new: true });

    const populatedPayment = updatedPayment ? await getPopulatedPayment(updatedPayment._id as mongoose.Types.ObjectId) : null;
    const deal = updatedPayment ? await getPopulatedDealForPayment(updatedPayment.deal_id as mongoose.Types.ObjectId) : null;

    return { payment: populatedPayment as IPayment, deal };
  },

  async deletePayment(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID Thanh toán không hợp lệ");

    const result = await Payment.findByIdAndDelete(id);
    if (!result) throw new Error("Không tìm thấy thanh toán để xóa");

    return { deleted: true, id };
  },
};
