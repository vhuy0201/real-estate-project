import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} from "../../../controllers/client/buyer/appointment.controller";

const router = express.Router();

router.post("/", verifyToken, roleCheck("buyer"), createAppointment);
router.get("/", verifyToken, roleCheck("buyer"), getMyAppointments);
router.patch("/:id/cancel", verifyToken, roleCheck("buyer"), cancelAppointment);

export default router;

