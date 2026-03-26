// src/models/offer.model.ts
import mongoose, { Document, Schema } from "mongoose";

export type OfferStatus =
  | "pending"
  | "forwarded_to_seller"
  | "seller_reviewing"
  | "accepted"
  | "rejected"
  | "cancelled";

export const SUPPORTED_OFFER_CURRENCIES = ["VND", "USD", "EUR"] as const;

export interface IOffer extends Document {
  property_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  seller_id: mongoose.Types.ObjectId;
  agent_id?: mongoose.Types.ObjectId;
  amount: number;
  currency: (typeof SUPPORTED_OFFER_CURRENCIES)[number];
  note?: string;
  status: OfferStatus;
  forwarded_at?: Date;
  reviewed_by?: mongoose.Types.ObjectId;
  reviewed_at?: Date;
  rejection_reason?: string;
  expires_at?: Date;
  attachments?: string[];
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: SUPPORTED_OFFER_CURRENCIES,
      default: "VND",
    },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "forwarded_to_seller", "seller_reviewing", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    forwarded_at: { type: Date },
    reviewed_by: { type: Schema.Types.ObjectId, ref: "User" },
    reviewed_at: { type: Date },
    rejection_reason: { type: String, trim: true },
    expires_at: { type: Date },
    attachments: [{ type: String }],
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

OfferSchema.path("amount").validate((value: number) => value > 0, "Offer amount must be greater than 0");

OfferSchema.index({ property_id: 1, buyer_id: 1, status: 1 });
OfferSchema.index({ agent_id: 1, seller_id: 1, status: 1 });
OfferSchema.index({ expires_at: 1 });

export default mongoose.model<IOffer>("Offer", OfferSchema);
