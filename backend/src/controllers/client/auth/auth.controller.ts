// src/controllers/client/auth/auth.controller.ts
import { Request, Response } from "express";
import { forgotPasswordService, loginUser, loginWithGoogle, registerUser, resetPasswordService } from "../../../services/auth.service";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { validateEmail, validatePassword } from "../../../utils/validation";
import { setAuthCookie, clearAuthCookie } from "../../../utils/authCookie";
import { verifyRefreshToken, generateAccessToken } from "../../../config/jwt.config";
import { emailVerifyService } from "../../../services/emailVerification.service";

// REGISTER
export const registerController = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password)
      return errorResponse(req, res, "Thiếu thông tin bắt buộc", 400);

    if (!validateEmail(email))
      return errorResponse(req, res, "Email không hợp lệ", 400);

    if (!validatePassword(password))
      return errorResponse(req, res, "Mật khẩu phải ít nhất 8 ký tự", 400);

    const result = await registerUser({ fullName, email, password, role });

    // Gửi email OTP
    await emailVerifyService.sendOTP(result.user.id as string, email);

    return successResponse(req, res, "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.", {
      userId: result.user.id,
      email,
    });
  } catch (error: any) {
    return errorResponse(req, res, error.message);
  }
};


// LOGIN
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    // Set refresh token cookie
    setAuthCookie(res, result.refreshToken);

    // Return access token + user
    return successResponse(req, res, "Đăng nhập thành công", {
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    if (error.requiresVerification) {
      return res.status(403).json({
        success: false,
        message: error.message,
        requiresVerification: true,
        userId: error.userId,
      });
    }
    return errorResponse(req, res, error.message);
  }
};

// REFRESH
export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return errorResponse(req, res, "Không có refresh token", 401);

    const decoded = verifyRefreshToken(refreshToken) as any;
    const newAccessToken = generateAccessToken({ id: decoded.id, role: decoded.role, email: decoded.email });

    return successResponse(req, res, "Lấy Access Token mới thành công", { accessToken: newAccessToken });
  } catch (error: any) {
    return errorResponse(req, res, "Refresh token không hợp lệ hoặc đã hết hạn", 401);
  }
};

// GOOGLE LOGIN
export const googleAuthController = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return errorResponse(req, res, "Missing Google token");

    const result = await loginWithGoogle(idToken);

    setAuthCookie(res, result.refreshToken);

    return successResponse(req, res, "Đăng nhập bằng Google thành công", {
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    return errorResponse(req, res, error.message);
  }
};

// LOGOUT
export const logoutController = async (req: Request, res: Response) => {
  clearAuthCookie(res);
  return successResponse(req, res, "Đăng xuất thành công");
};

// VERIFY EMAIL
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    await emailVerifyService.verifyOTP(userId, otp);

    return successResponse(req, res, "Xác thực email thành công.");
  } catch (error: any) {
    return errorResponse(req, res, error.message);
  }
};

// RESEND OTP
export const resendOtpController = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    await emailVerifyService.sendOTP(userId, email);

    return successResponse(req, res, "Đã gửi lại mã OTP.");
  } catch (error: any) {
    return errorResponse(req, res, error.message);
  }
};

// FORGOT PASSWORD
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    return successResponse(req, res, result.message);
  } catch (error: any) {
    return errorResponse(req, res, error.message);
  }
};

// RESET PASSWORD
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return errorResponse(req, res, "Thiếu token hoặc mật khẩu mới", 400);

    if(newPassword){
      if (!validatePassword(newPassword))
        return errorResponse(req, res, "Mật khẩu phải ít nhất 8 ký tự", 400);
    }

    const result = await resetPasswordService(token, newPassword);
    return successResponse(req, res, result.message);
  } catch (error: any) {
    return errorResponse(req, res, error.message);
  }
};