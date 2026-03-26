import mongoose, { Schema, Document } from "mongoose";

export interface IEmailVerification extends Document {
  user_id: mongoose.Types.ObjectId;
  otp: string;
  expiresAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEmailVerification>(
  "EmailVerification",
  EmailVerificationSchema
);
