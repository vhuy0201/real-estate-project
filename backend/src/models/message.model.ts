// src/models/message.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId; // Người nhận (optional, có thể lấy từ conversation)
  text: string;
  attachments?: string[];
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User" }, // Optional
    text: { type: String, trim: true, required: true },
    attachments: [{ type: String }],
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index để query nhanh
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, is_read: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);