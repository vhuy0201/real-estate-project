// src/models/favorite.model.ts
import mongoose, { Document, Schema } from "mongoose";
import "./user.model";
import "./property.model";

export interface IFavorite extends Document {
  user_id: mongoose.Types.ObjectId;
  property_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true }
);

// Unique composite index để tránh trùng (1 user - 1 property chỉ xuất hiện 1 lần)
FavoriteSchema.index({ user_id: 1, property_id: 1 }, { unique: true });

export default mongoose.model<IFavorite>("Favorite", FavoriteSchema);
