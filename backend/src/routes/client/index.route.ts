// src/routes/client/index.route.ts
import express from "express";
import authRoutes from "./auth/index.route";
import buyerRoutes from "./buyer/buyer.route";
import sellerRoutes from "./seller/seller.route";
import agentRoutes from "./agent/agent.route";
import common from "./common/index.route";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/buyer", buyerRoutes);
router.use("/seller", sellerRoutes);
router.use("/agent", agentRoutes);
router.use("/", common);

export default router;
