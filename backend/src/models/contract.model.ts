// src/models/contract.model.ts
import mongoose, { Document, Schema } from "mongoose";

export type ContractUploaderRole = "agent" | "seller" | "buyer";
export type ContractType = "initial" | "buyer_signed" | "final";
export type ContractStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "superseded";

export interface IContract extends Document {
  deal_id: mongoose.Types.ObjectId;
  file_url: string;
  version: number;
  uploaded_by: mongoose.Types.ObjectId;
  role_of_uploader: ContractUploaderRole;
  original_filename?: string;
  mime_type?: string;
  file_size?: number;
  contract_type: ContractType;
  status: ContractStatus;
  approved_by?: mongoose.Types.ObjectId;
  approved_at?: Date;
  replaced_at?: Date;
  notes?: string;
  deleted?: boolean;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    deal_id: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    file_url: { type: String, required: true },
    version: { type: Number, default: 1 },
    uploaded_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role_of_uploader: {
      type: String,
      enum: ["agent", "seller", "buyer"],
      required: true,
    },
    original_filename: { type: String },
    mime_type: { type: String },
    file_size: { type: Number },
    contract_type: {
      type: String,
      enum: ["initial", "buyer_signed", "final"],
      default: "initial",
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "superseded"],
      default: "submitted",
    },
    approved_by: { type: Schema.Types.ObjectId, ref: "User" },
    approved_at: { type: Date },
    replaced_at: { type: Date },
    notes: { type: String },
    deleted: { type: Boolean, default: false },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

ContractSchema.index({ deal_id: 1, version: 1 }, { unique: true });
ContractSchema.index({ status: 1, contract_type: 1 });
ContractSchema.index({ uploaded_by: 1, createdAt: -1 });
ContractSchema.index({ deal_id: 1, deleted: 1, version: -1 }); // Index cho query contract chưa xóa

export default mongoose.model<IContract>("Contract", ContractSchema);
