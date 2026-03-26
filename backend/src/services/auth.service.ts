// src/services/auth.service.ts
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.config";

//register
export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  role?: "buyer" | "seller" | "agent";
}) => {
  const { fullName, email, password, role } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email đã được sử dụng");

  const newUser = new User({
    fullName,
    email,
    password,
    role: role || "buyer",
  });

  await newUser.save();

  const token = generateToken({ id: newUser._id, role: newUser.role });

  return {
    user: {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
    token,
  };
};

//login
export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Mật khẩu không chính xác");
  }

  // Tạo JWT
  const token = generateToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

