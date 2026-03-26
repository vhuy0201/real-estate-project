// src/models/feature.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IFeature extends Document {
  feature_name: string;
}

const FeatureSchema = new Schema<IFeature>(
  { feature_name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

export default mongoose.model<IFeature>("Feature", FeatureSchema);
