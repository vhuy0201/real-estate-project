// src/routes/client/index.route.ts
import express from "express";
import authRoutes from "./auth/index.route";
import buyerRoutes from "./buyer/index.route";
import sellerRoutes from "./seller/index.route";
import agentRoutes from "./agent/index.route";
import common from "./common/index.route";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/buyer", buyerRoutes);
router.use("/seller", sellerRoutes);
router.use("/agent", agentRoutes);
router.use("/", common);

export default router;
