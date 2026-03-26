import mongoose, { Document, Schema } from "mongoose";

export interface ICity extends Document {
  city_name: {
    vi: string;
    en: string;
  };
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>(
  {
    city_name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

//  Unique index theo từng ngôn ngữ
CitySchema.index({ "city_name.vi": 1 }, { unique: true, sparse: true });
CitySchema.index({ "city_name.en": 1 }, { unique: true, sparse: true });

export default mongoose.model<ICity>("City", CitySchema);
