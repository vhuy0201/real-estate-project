import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import {
  getMyAppointments,
  acceptAppointment,
  rejectAppointment,
  completeAppointment,
} from "../../../controllers/client/agent/appointment.controller";

const router = express.Router();

router.get("/", verifyToken, roleCheck("agent"), getMyAppointments);

router.patch("/:id/accept", verifyToken, roleCheck("agent"), acceptAppointment);

router.patch("/:id/reject", verifyToken, roleCheck("agent"), rejectAppointment);

router.patch("/:id/complete", verifyToken, roleCheck("agent"), completeAppointment);

export default router;

