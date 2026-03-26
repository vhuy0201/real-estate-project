// src/models/property.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  city_id: mongoose.Types.ObjectId;
  type_id: mongoose.Types.ObjectId;
  category_id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;
  agent_id?: mongoose.Types.ObjectId;
  features?: mongoose.Types.ObjectId[];
  images?: string[];
  status: "available" | "pending" | "approved" | "sold" | "rejected";
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    city_id: { type: Schema.Types.ObjectId, ref: "City", required: true },
    type_id: { type: Schema.Types.ObjectId, ref: "PropertyType", required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: "User" },
    features: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
    images: [String],
    status: {
      type: String,
      enum: ["available", "pending", "approved", "sold", "rejected"],
      default: "available",
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>("Property", PropertySchema);
