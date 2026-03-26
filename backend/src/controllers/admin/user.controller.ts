import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utils/responseHandler";
import * as userService from "../../services/admin/user.service";

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const data = await userService.getAllUsers(
      role,
      Number(page),
      Number(limit)
    );
    return successResponse(req, res, "Lấy danh sách người dùng thành công", data);
  } catch (error) {
    return errorResponse(req, res, "Lấy danh sách người dùng thất bại", 500);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      return errorResponse(req, res, "Không tìm thấy người dùng.", 404);
    }

    return successResponse(req, res, "Lấy thông tin người dùng thành công", user);
  } catch (error: any) {
    console.error("getUserById error:", error.message);
    return errorResponse(
      req,
      res,
      error.message || "Lấy thông tin người dùng thất bại.",
      error.status || 500
    );
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, avatar, isActive } = req.body;

    // chỉ admin mới được cập nhật người dùng
    // if (req.user?.role !== "admin") {
    //   return errorResponse(res, "Bạn không có quyền thực hiện thao tác này.", 403);
    // }

    const updatedUser = await userService.updateUserInfo(id, {
      fullName,
      phone,
      role,
      avatar,
      isActive,
    });

    return successResponse(
      req,
      res,
      `Cập nhật thông tin người dùng thành công: ${updatedUser.fullName}`,
      updatedUser
    );
  } catch (error: any) {
    console.error("updateUserInfo error:", error.message);
    return errorResponse(
      req,
      res,
      error.message || "Không thể cập nhật thông tin người dùng.",
      error.status || 500
    );
  }
};



// [U007] Cập nhật / khóa người dùng (Admin)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Kiểm tra quyền (đảm bảo chỉ admin mới gọi được API này)
    // if (req.user?.role !== "admin") {
    //   return errorResponse(res, "Bạn không có quyền thực hiện thao tác này.", 403);
    // }

    // Gọi service để cập nhật trạng thái
    const updatedUser = await userService.updateUserStatus(id, isActive);

    return successResponse(
      req,
      res,
      `Cập nhật trạng thái người dùng thành công: ${updatedUser.fullName}`,
      updatedUser
    );
  } catch (error: any) {
    console.error("updateUserStatus error:", error.message);
    return errorResponse(
      req,
      res,
      error.message || "Không thể cập nhật trạng thái người dùng.",
      error.status || 500
    );
  }
};
