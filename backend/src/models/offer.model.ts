// src/models/offer.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  property_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  amount: number;
  status: string;
}

const OfferSchema = new Schema<IOffer>(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>("Offer", OfferSchema);
