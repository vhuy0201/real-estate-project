import express from "express";
import propertyRoutes from "./property.route";
import taxonomyRoutes from "./taxonomy.route";
import webhookRoutes from "./webhook.route";
import agentRoutes from "./agent.route"

const router = express.Router();

router.use("/", propertyRoutes);
router.use("/taxonomy", taxonomyRoutes);
router.use("/webhook", webhookRoutes);
router.use("/agents", agentRoutes);

export default router;