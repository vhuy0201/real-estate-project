// src/models/deal.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IDeal extends Document {
  property_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  seller_id: mongoose.Types.ObjectId;
  offer_id: mongoose.Types.ObjectId;
  status: string;
}

const DealSchema = new Schema<IDeal>(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    offer_id: { type: Schema.Types.ObjectId, ref: "Offer", required: true },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<IDeal>("Deal", DealSchema);
