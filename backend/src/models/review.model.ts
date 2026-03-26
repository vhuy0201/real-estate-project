// src/models/review.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user_id: mongoose.Types.ObjectId;
  target_id: mongoose.Types.ObjectId;
  target_type: "agent" | "property";
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target_id: { type: Schema.Types.ObjectId, required: true },
    target_type: { type: String, enum: ["agent", "property"], required: true },
    rating: { type: Number, required: true },
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", ReviewSchema);
