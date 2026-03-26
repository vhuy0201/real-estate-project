import mongoose, { Document, Schema } from "mongoose";

export type PaymentType =
  | "escrow_fund" // Buyer nạp tiền vào
  | "release_to_seller" // Nhả tiền cho seller
  | "agent_fee" // Thanh toán phí cho agent
  | "platform_fee" // Thanh toán phí nền tảng
  | "refund"; // Hoàn tiền cho buyer

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface IPayment extends Document {
  deal_id: mongoose.Types.ObjectId;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: string;
  external_ref?: string; // Mã giao dịch từ bên thứ 3 (cổng thanh toán)
  initiated_by: mongoose.Types.ObjectId; // Người thực hiện (vd: Buyer nạp escrow)
  processed_by?: mongoose.Types.ObjectId; // Người xử lý (vd: Admin duyệt, hoặc hệ thống)
  notes?: string;
  payment_date?: Date; // Ngày thanh toán hoàn tất (nếu khác createdAt)
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    deal_id: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    type: {
      type: String,
      enum: [
        "escrow_fund",
        "release_to_seller",
        "agent_fee",
        "platform_fee",
        "refund",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending", // Mặc định là 'pending' 
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND" },
    method: { type: String, required: true }, // vd: "bank_transfer", "card", "wallet"
    external_ref: { type: String, index: true }, // Mã giao dịch của cổng thanh toán
    initiated_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    processed_by: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
    payment_date: { type: Date }, // Ngày tiền thực sự được chuyển/nhận
  },
  { timestamps: true }
);

// Indexes theo kế hoạch
PaymentSchema.index({ deal_id: 1, type: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ payment_date: -1 });

export default mongoose.model<IPayment>("Payment", PaymentSchema);