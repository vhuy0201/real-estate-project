import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { getAgentList, getAgentDetail } from "../../../controllers/client/seller/agent.controller";

const router = express.Router();

router.get("/", getAgentList);
router.get("/:id", getAgentDetail);



export default router;