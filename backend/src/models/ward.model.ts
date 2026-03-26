import mongoose, { Document, Schema } from "mongoose";

export interface IWard extends Document {
  ward_name: {
    vi: string;
    en: string;
  };
  district_id: mongoose.Types.ObjectId;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WardSchema = new Schema<IWard>(
  {
    ward_name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    district_id: {
      type: Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique index theo tên + parent district
WardSchema.index({ "ward_name.vi": 1, district_id: 1 }, { unique: true, sparse: true });
WardSchema.index({ "ward_name.en": 1, district_id: 1 }, { unique: true, sparse: true });

export default mongoose.model<IWard>("Ward", WardSchema);
