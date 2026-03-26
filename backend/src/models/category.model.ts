// src/models/category.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  category_name: string;
}

const CategorySchema = new Schema<ICategory>(
  { category_name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
