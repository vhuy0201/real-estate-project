import express from "express";
import { registerController, loginController  } from "../../../controllers/client/auth/auth.controller";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

export default router;
