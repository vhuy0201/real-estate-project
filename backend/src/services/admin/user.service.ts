import User from "../../models/user.model";

export const getAllUsers = async (role?: string, page = 1, limit = 10) => {
  const query: any = {};
  if (role) query.role = role;

  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select("-password"); // ẩn mật khẩu

  const total = await User.countDocuments(query);

  return {
    meta: {
      totalUsers: total,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(total / limit),
    },
    results: users.map((user) => ({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })),
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const err: any = new Error("Không tìm thấy người dùng.");
    err.status = 404;
    throw err;
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateUserInfo = async (
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    role?: string;
    avatar?: string;
    isActive?: boolean;
  }
) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    const err: any = new Error("Không tìm thấy người dùng.");
    err.status = 404;
    throw err;
  }

  return {
    id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    isActive: updatedUser.isActive,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select("fullName email role isActive");

  if (!updatedUser) {
    const err: any = new Error("Không tìm thấy người dùng.");
    err.status = 404;
    throw err;
  }

  return updatedUser;
};
