// src/models/city.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICity extends Document {
  city_name: string;
}

const CitySchema = new Schema<ICity>(
  { city_name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

export default mongoose.model<ICity>("City", CitySchema);
