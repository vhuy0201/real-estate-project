import express from "express";
import {
  registerController,
  loginController,
  googleAuthController,
  logoutController,
  refreshTokenController,
  resendOtpController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
} from "../../../controllers/client/auth/auth.controller";

const router = express.Router();

router.post("/register", registerController);
router.post("/verify-email", verifyEmailController);
router.post("/resend-verification", resendOtpController);
router.post("/login", loginController);
router.post("/google", googleAuthController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutController);

router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);


export default router;
