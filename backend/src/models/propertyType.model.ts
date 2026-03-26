// src/models/propertyType.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPropertyType extends Document {
  type_name: string;
}

const PropertyTypeSchema = new Schema<IPropertyType>(
  { type_name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

export default mongoose.model<IPropertyType>("PropertyType", PropertyTypeSchema);
