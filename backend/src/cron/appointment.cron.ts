// src/cron/appointment.cron.ts
import cron from "node-cron";
import Appointment from "../models/appointment.model";
import Property from "../models/property.model";
import User from "../models/user.model";
import { createNotificationsForUsers } from "../utils/notificationHelper";

export function startAppointmentExpirationCron() {
  console.log("Appointment Cron: Initialized");

  cron.schedule("*/15 * * * *", async () => {
    console.log("Appointment Cron: Checking pending appointments...");

    try {
      const now = new Date();

      const appointments = await Appointment.find({ status: "pending" }).limit(500).lean();

      for (const appointment of appointments) {
        try {
          if (!appointment.times || appointment.times.length === 0) continue;

         
          const maxProposedTime = appointment.times.reduce(
            (max, slot) => (slot.time > max ? slot.time : max),
            appointment.times[0].time
          );

          const deadline = new Date(maxProposedTime.getTime() - 6 * 60 * 60 * 1000);

          if (now < deadline) {
            continue; 
          }

          await Appointment.findByIdAndUpdate(
            appointment._id,
            {
              status: "rejected",
              rejection_reason:
                "Hệ thống tự động từ chối do Agent không phản hồi đúng hạn.",
            },
            { new: false }
          );

          const [property, agent] = await Promise.all([
            Property.findById(appointment.property_id).select("title").lean(),
            User.findById(appointment.agent_id).select("fullName").lean(),
          ]);

          const propertyTitle =
            property?.title?.vi || property?.title?.en || "bất động sản";

          const agentName = agent?.fullName || "Hệ thống";

        // tbtb
          const buyerId = appointment.buyer_id.toString();
          const sellerId = appointment.seller_id.toString();
          const agentId = appointment.agent_id.toString();

          const title = "Lịch hẹn bị hệ thống từ chối";
          const message = `${agentName} đã không phản hồi kịp thời. Lịch hẹn xem ${propertyTitle} đã bị từ chối tự động.`;

          await createNotificationsForUsers(
            [buyerId, sellerId, agentId],
            title,
            message,
            {
              type: "appointment",
              relatedId: appointment._id.toString(),
              actionUrl: `/appointments/${appointment._id}`,
            }
          );

          console.log(`Auto-rejected appointment ${appointment._id}`);

        } catch (innerError) {
          console.error("Cron iteration error:", innerError);
        }
      }
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  });
}
