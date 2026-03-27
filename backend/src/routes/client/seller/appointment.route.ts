import express from "express";
import { verifyToken } from "../../../middlewares/auth.middleware";
import { roleCheck } from "../../../middlewares/roleCheck.middleware";
import { getSellerAppointments } from "../../../controllers/client/seller/appointment.controller";

const router = express.Router();

router.get("/", verifyToken, roleCheck("seller"), getSellerAppointments);

export default router;
