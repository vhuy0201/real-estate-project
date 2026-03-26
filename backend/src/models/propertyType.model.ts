import mongoose, { Document, Schema } from "mongoose";

export interface IPropertyType extends Document {
  type_name: { vi: string; en: string };
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyTypeSchema = new Schema<IPropertyType>(
  {
    type_name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PropertyTypeSchema.index({ "type_name.vi": 1 }, { unique: true, sparse: true });
PropertyTypeSchema.index({ "type_name.en": 1 }, { unique: true, sparse: true });

export default mongoose.model<IPropertyType>("PropertyType", PropertyTypeSchema);
