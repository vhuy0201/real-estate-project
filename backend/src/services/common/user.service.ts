import User from "../../models/user.model";
import bcrypt from "bcryptjs";

export const userService = {
  // Lấy thông tin profile
  async getProfile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const err: any = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return user;
  },

  // Cập nhật thông tin profile
  async updateProfile(userId: string, data: { fullName?: string; phone?: string; avatar?: string }) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      const err: any = new Error("User not found");
      err.status = 404;
      throw err;
    }

    return updatedUser;
  },

  // Đổi mật khẩu
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.status = 404;
      throw err;
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      const err: any = new Error("Mật khẩu cũ không đúng");
      err.status = 400;
      throw err;
    }

    //Gán mật khẩu mới 
    user.password = newPassword;
    await user.save();

    return { message: "Đổi mật khẩu thành công" };
  },

  // Lấy danh sách agent (dùng cho màn hình chọn agent)
  async getAgents(filters: any) {
    const { page = 1, limit = 10, keyword } = filters || {};

    const query: any = { role: "agent", isActive: true };
    if (keyword) {
      const re = new RegExp(keyword, "i");
      query.$or = [{ fullName: re }, { email: re }, { phone: re }];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
      data,
    };
  },

  // Lấy chi tiết agent
  async getAgentById(id: string) {
    const agent = await User.findOne({ _id: id, role: "agent", isActive: true }).select("-password");
    if (!agent) {
      const err: any = new Error("Không tìm thấy môi giới hoặc tài khoản không hoạt động");
      err.status = 404;
      throw err;
    }

    // Có thể bổ sung thêm thống kê sơ bộ ở đây nếu cần (ví dụ số BĐS quản lý)
    // Hiện tại chỉ trả về thông tin user cơ bản
    return agent;
  },
};
