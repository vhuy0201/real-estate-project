import express from "express";
import profileRoutes from "./profile.route";
import propertiesRoutes from "./properties.route";
import notificationRoutes from "./notification.route";
import chatRoutes from "./chat.route";
import dashboardRoutes from "./dashboard.route";


const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/properties", propertiesRoutes);
router.use("/notifications", notificationRoutes);
router.use("/chat", chatRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
