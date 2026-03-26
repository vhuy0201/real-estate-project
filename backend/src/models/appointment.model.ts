// src/models/appointment.model.ts
import mongoose, { Document, Schema } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface AppointmentTimeSlot {
  time: Date;
  note?: string;
}

export interface IAppointment extends Document {
  property_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  agent_id: mongoose.Types.ObjectId;
  seller_id: mongoose.Types.ObjectId;
  times: AppointmentTimeSlot[];
  final_time?: Date | null;
  location?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agent_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    times: {
      type: [
        {
          time: { type: Date, required: true },
          note: { type: String, trim: true },
        },
      ],
      required: true,
      validate: {
        validator(this: any, value: any[]) {
          if (!Array.isArray(value) || value.length === 0) return false;
          if (value.length > 3) return false;

          const shouldValidateFuture = this.isNew || this.isModified("times");
          if (!shouldValidateFuture) {
            return value.every(
              (slot: any) =>
                slot &&
                slot.time instanceof Date &&
                !Number.isNaN(slot.time.valueOf())
            );
          }

          for (const slot of value) {
            if (!slot || !(slot.time instanceof Date)) return false;
            if (Number.isNaN(slot.time.valueOf())) return false;
            if (slot.time <= new Date()) return false;
          }
          return true;
        },
        message: "Danh sách thời gian không hợp lệ",
      },
    },
    final_time: {
      type: Date,
      default: null,
      validate: {
        validator(this: any, value: Date | null) {
          if (!value) return true;
          return ["accepted", "completed"].includes(this.status);
        },
        message: "final_time chỉ được gán khi lịch hẹn đã được chấp nhận",
      },
    },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ buyer_id: 1, property_id: 1, status: 1 });
AppointmentSchema.index({ agent_id: 1, status: 1, "times.time": 1 });
AppointmentSchema.index({ seller_id: 1, status: 1, "times.time": 1 });
AppointmentSchema.index({ "times.time": 1 });

AppointmentSchema.pre("init", function (doc: any) {
  if ((!doc.times || doc.times.length === 0) && doc.time) {
    doc.times = [
      {
        time: doc.time,
        note: doc.note,
      },
    ];
  }

  if (!doc.final_time && doc.time && ["accepted", "completed"].includes(doc.status)) {
    doc.final_time = doc.time;
  }
});

AppointmentSchema.pre("validate", function (next) {
  const doc: any = this;

  if (!doc.times || doc.times.length === 0) {
    const legacyTime = doc.time;
    if (legacyTime) {
      doc.times = [
        {
          time: legacyTime instanceof Date ? legacyTime : new Date(legacyTime),
          note: doc.note,
        },
      ];
    }
  }

  if (Array.isArray(doc.times)) {
    doc.times = doc.times
      .filter((slot: any) => slot && slot.time)
      .map((slot: any) => ({
        time: slot.time instanceof Date ? slot.time : new Date(slot.time),
        note: slot.note,
      }))
      .slice(0, 3)
      .sort(
        (a: AppointmentTimeSlot, b: AppointmentTimeSlot) =>
          a.time.getTime() - b.time.getTime()
      );
  }

  if (doc.final_time && !(doc.final_time instanceof Date)) {
    doc.final_time = new Date(doc.final_time);
  }

  delete doc.time;
  delete doc.note;
  next();
});

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
