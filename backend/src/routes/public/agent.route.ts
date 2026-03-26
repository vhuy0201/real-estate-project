import express from "express";
import {
  getPublicAgentInfo,
  getAgentSoldProperties,
  getAgentReviews,
  listPublicAgents,
} from "../../controllers/public/agent.controller";

const router = express.Router();

router.get("", listPublicAgents);

router.get("/:id", getPublicAgentInfo);

router.get("/:id/properties", getAgentSoldProperties);

router.get("/:id/reviews", getAgentReviews);

export default router;
