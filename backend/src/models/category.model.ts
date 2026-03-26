import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  category_name: { vi: string; en: string };
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    category_name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ "category_name.vi": 1 }, { unique: true, sparse: true });
CategorySchema.index({ "category_name.en": 1 }, { unique: true, sparse: true });

export default mongoose.model<ICategory>("Category", CategorySchema);
