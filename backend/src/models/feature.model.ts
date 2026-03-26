import mongoose, { Document, Schema } from "mongoose";

export interface IFeature extends Document {
  feature_name: { vi: string; en: string };
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>(
  {
    feature_name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FeatureSchema.index({ "feature_name.vi": 1 }, { unique: true, sparse: true });
FeatureSchema.index({ "feature_name.en": 1 }, { unique: true, sparse: true });

export default mongoose.model<IFeature>("Feature", FeatureSchema);
