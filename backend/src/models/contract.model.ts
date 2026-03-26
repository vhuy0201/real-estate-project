// src/models/contract.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IContract extends Document {
  deal_id: mongoose.Types.ObjectId;
  file_url: string;
}

const ContractSchema = new Schema<IContract>(
  {
    deal_id: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    file_url: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>("Contract", ContractSchema);
