import mongoose, { Document, Schema } from "mongoose";

import "./city.model";
import "./district.model";
import "./ward.model";
import "./category.model";
import "./propertyType.model";
import "./feature.model";
import "./user.model";

export interface IProperty extends Document {
  title: { vi: string; en: string };
  description?: { vi?: string; en?: string };
  price: number;
  address: { vi: string; en: string }; // chứa địa chỉ chi tiết (ví dụ: "123 Đường ABC")
  bedrooms: number;
  bathrooms: number;
  area: number;
  unit: "m2" | "ft2";
  yearBuilt?: number;
  floors: number;
  floor_number?: string;     // Số tầng (ví dụ: "Tầng 15")
  building_block?: string; // Tên tòa nhà/block (ví dụ: "Tháp A", "Block S2")
  apartment_number?: string; // Số căn hộ (ví dụ: "A-1502")
  coordinates?: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  city_id: mongoose.Types.ObjectId;
  district_id: mongoose.Types.ObjectId;
  ward_id: mongoose.Types.ObjectId;
  type_id: mongoose.Types.ObjectId;
  category_id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;
  agent_id?: mongoose.Types.ObjectId;
  assignmentHistory?: Array<{
    agent_id?: mongoose.Types.ObjectId;
    assignedBy?: mongoose.Types.ObjectId;
    action: "assign" | "remove" | "reject" | "cancel" | "request";
    assignedAt: Date;
  }>;
  features?: mongoose.Types.ObjectId[];
  images?: string[];
  status: "available" | "pending" | "approved" | "sold" | "rejected" | "rented";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  publishedAt?: Date;
  hiddenNote?: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      vi: { type: String, trim: true },
      en: { type: String, trim: true },
    },
    price: { type: Number, required: true, min: 0 },

    // địa chỉ chi tiết property (đường, số nhà, ...)
    address: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    area: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["m2", "ft2"], default: "m2" },
    yearBuilt: { type: Number },
    floors: { type: Number, default: 1, min: 0 },

    floor_number: { type: String, trim: true },
    building_block: { type: String, trim: true },
    apartment_number: { type: String, trim: true },

    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },

    city_id: { type: Schema.Types.ObjectId, ref: "City", required: true },
    district_id: { type: Schema.Types.ObjectId, ref: "District", required: true },
    ward_id: { type: Schema.Types.ObjectId, ref: "Ward", required: true },
    type_id: { type: Schema.Types.ObjectId, ref: "PropertyType", required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: "User" },

    assignmentHistory: [
      {
        agent_id: { type: Schema.Types.ObjectId, ref: "User" },
        assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
        action: {
          type: String,
          enum: ["assign", "remove", "reject", "cancel", "request"],
          required: true,
        },
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    features: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
    images: [{ type: String }],

    status: {
      type: String,
      enum: ["available", "pending", "approved", "sold", "rented", "rejected"],
      default: "available",
    },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    publishedAt: { type: Date },
    hiddenNote: { type: String, trim: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PropertySchema.index({ coordinates: "2dsphere" });

export default mongoose.model<IProperty>("Property", PropertySchema);
