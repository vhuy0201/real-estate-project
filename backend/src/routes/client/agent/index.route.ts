import express from "express";
import assignmentRoutes from "./assignment.route";
import contractRoutes from "./contract.route";
import offerRoutes from "./offer.route";
import dealRoutes from "./deal.route";
import appointmentRoutes from "./appointment.route";
import propertiesRoutes from "./properties.route";

const router = express.Router();

router.use("/assignments", assignmentRoutes);
router.use("/contracts", contractRoutes);
router.use("/offers", offerRoutes);
router.use("/deals", dealRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/", contractRoutes);
router.use("/properties", propertiesRoutes);

export default router;
