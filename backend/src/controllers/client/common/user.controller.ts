import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { userService } from "../../../services/common/user.service";
import { UpdateProfileDTO } from "../../../dtos/user.dto";
import { validatePassword } from "../../../utils/validation";

// GET profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(req, res, "User ID not found", 401);

    const user = await userService.getProfile(userId);
    return successResponse(req, res, "Profile retrieved successfully", user);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

// UPDATE profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return errorResponse(req, res, "Validation failed: " + JSON.stringify(errors.array()), 400);

    const userId = req.user?.id;
    if (!userId) return errorResponse(req, res, "User ID not found", 401);

    const { fullName, phone, avatar }: UpdateProfileDTO = req.body;
    const updatedUser = await userService.updateProfile(userId, { fullName, phone, avatar });

    return successResponse(req, res, "Profile updated successfully", updatedUser);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};

// CHANGE password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) return errorResponse(req, res, "User ID not found", 401);
    if (!oldPassword || !newPassword)
      return errorResponse(req, res, "Thiếu dữ liệu (oldPassword, newPassword)", 400);

    if(newPassword){
      if (!validatePassword(newPassword))
        return errorResponse(req, res, "Mật khẩu phải ít nhất 8 ký tự", 400);
    }

    const result = await userService.changePassword(userId, oldPassword, newPassword);
    return successResponse(req, res, result.message);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "Server error", error.status || 500);
  }
};
