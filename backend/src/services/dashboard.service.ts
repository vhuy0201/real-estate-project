import Property from "../models/property.model";
import Appointment from "../models/appointment.model";
import mongoose from "mongoose";

export const dashboardService = {
  async getStats(userId: string, role: string) {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    let propertiesCount = 0;
    let acceptedAppointmentsCount = 0;
    const viewsCount = 128; // Hardcoded for now as requested

    console.log(`[Dashboard] Getting stats for user: ${userId}, role: ${role}`);

    if (role === "seller") {
      [propertiesCount, acceptedAppointmentsCount] = await Promise.all([
        Property.countDocuments({ owner_id: userIdObj, deleted: false }),
        Appointment.countDocuments({ seller_id: userIdObj, status: "accepted" }),
      ]);
    } else if (role === "agent") {
      [propertiesCount, acceptedAppointmentsCount] = await Promise.all([
        Property.countDocuments({ agent_id: userIdObj, deleted: false }),
        Appointment.countDocuments({ agent_id: userIdObj, status: "accepted" }),
      ]);
    }

    console.log(`[Dashboard] Counts - Properties: ${propertiesCount}, Appointments: ${acceptedAppointmentsCount}`);

    return {
      propertiesCount,
      acceptedAppointmentsCount,
      viewsCount,
      role,
    };
  },
};
