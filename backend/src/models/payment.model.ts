// src/models/payment.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  deal_id: mongoose.Types.ObjectId;
  amount: number;
  payment_date: Date;
  method: string;
  status: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    deal_id: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    amount: { type: Number, required: true },
    payment_date: { type: Date, default: Date.now },
    method: { type: String, default: "bank_transfer" },
    status: { type: String, default: "completed" },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
