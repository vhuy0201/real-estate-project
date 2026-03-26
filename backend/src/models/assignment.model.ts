import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  property_id: mongoose.Types.ObjectId;
  agent_id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  actedBy?: mongoose.Types.ObjectId; // who accepted/rejected
  actedAt?: Date;
  createdBy: mongoose.Types.ObjectId; // who initiated the request
}

const AssignmentSchema = new Schema(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected","cancelled"], default: "pending" },
    note: String,
    actedBy: { type: Schema.Types.ObjectId, ref: "User" },
    actedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);