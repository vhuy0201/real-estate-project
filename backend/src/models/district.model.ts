import mongoose, { Document, Schema } from "mongoose";

export interface IDistrict extends Document {
  district_name: {
    vi: string;
    en: string;
  };
  city_id: mongoose.Types.ObjectId;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DistrictSchema = new Schema<IDistrict>(
  {
    district_name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    city_id: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique index theo tên + parent city
DistrictSchema.index({ "district_name.vi": 1, city_id: 1 }, { unique: true, sparse: true });
DistrictSchema.index({ "district_name.en": 1, city_id: 1 }, { unique: true, sparse: true });

export default mongoose.model<IDistrict>("District", DistrictSchema);
