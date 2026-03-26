import { Request, Response } from "express";
import User from "../../../models/user.model";
import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { UpdateProfileDTO } from "../../../dtos/user.dto";

// GET profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "User ID not found", 401);

    const user = await User.findById(userId).select("-password");
    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Profile retrieved successfully", user);
  } catch (error) {
    return errorResponse(res, "Server error", 500);
  }
};

// UPDATE profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, "Validation failed: " + JSON.stringify(errors.array()), 400);

    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "User ID not found", 401);

    const { fullName, phone, avatar }: UpdateProfileDTO = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { fullName, phone, avatar } },
      { new: true, runValidators: true }
    ).select("-password");

    return successResponse(res, "Profile updated successfully", updatedUser);
  } catch (error) {
    return errorResponse(res, "Server error", 500);
  }
};
