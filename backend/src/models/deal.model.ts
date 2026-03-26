// src/models/deal.model.ts
import mongoose, { Document, Schema } from "mongoose";
import "./offer.model";

export type DealStatus =
  | "active"
  | "awaiting_contract"
  | "contract_under_review"
  | "awaiting_escrow_payment"
  | "escrow_funded"
  | "completed"
  | "cancelled";

export interface IDealAmounts {
  agreed_price: number;
  currency: string;
  platform_fee?: number;
  agent_fee?: number;
  seller_payout?: number;
}

export interface IDealAudit {
  created_from_offer_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
}

export interface IDealCompliance {
  kyc_verified_buyer?: boolean;
  kyc_verified_seller?: boolean;
}

export interface IDeal extends Document {
  property_id: mongoose.Types.ObjectId;
  offer_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  seller_id: mongoose.Types.ObjectId;
  agent_id: mongoose.Types.ObjectId;
  status: DealStatus;
  amounts: IDealAmounts;
  audit?: IDealAudit;
  compliance?: IDealCompliance;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AmountsSchema = new Schema<IDealAmounts>(
  {
    agreed_price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND" },
    platform_fee: { type: Number, default: 0, min: 0 },
    agent_fee: { type: Number, default: 0, min: 0 },
    seller_payout: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const AuditSchema = new Schema<IDealAudit>(
  {
    created_from_offer_at: { type: Date },
    completed_at: { type: Date },
    cancelled_at: { type: Date },
    cancellation_reason: { type: String, trim: true },
  },
  { _id: false }
);

const ComplianceSchema = new Schema<IDealCompliance>(
  {
    kyc_verified_buyer: { type: Boolean, default: false },
    kyc_verified_seller: { type: Boolean, default: false },
  },
  { _id: false }
);

const DealSchema = new Schema<IDeal>(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    offer_id: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      unique: true,
    },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: [
        "active",
        "awaiting_contract",
        "contract_under_review",
        "awaiting_escrow_payment",
        "escrow_funded",
        "completed",
        "cancelled",
      ],
      default: "awaiting_contract",
    },
    amounts: { type: AmountsSchema, required: true },
    audit: { type: AuditSchema },
    compliance: { type: ComplianceSchema },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

DealSchema.index({ seller_id: 1, agent_id: 1, buyer_id: 1, status: 1 });
DealSchema.index({ property_id: 1 });
DealSchema.index({ "audit.created_from_offer_at": -1 });
DealSchema.index({ "audit.completed_at": -1 });

export default mongoose.model<IDeal>("Deal", DealSchema);