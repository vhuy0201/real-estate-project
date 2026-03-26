// src/models/appointment.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
  property_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  agent_id: mongoose.Types.ObjectId;
  time: Date;
  status: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    property_id: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    time: { type: Date, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
