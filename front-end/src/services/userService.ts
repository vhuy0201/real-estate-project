import type { User } from "../types/Users";
import { httpAdmin } from "../utils/httpAdmin";
const RESOURCE = "/users";

export const getAllUsers = async (): Promise<User[]> => {
  const res = await httpAdmin.get(RESOURCE);
  return res.data.data.results;
};
export const getUsersById = async (id: string): Promise<User> => {
  const res = await httpAdmin.get(`${RESOURCE}/${id}`);
  return res.data.data;
};

export const updateUser = async (id: string, userData: User): Promise<User> => {
  try {
    const res = await httpAdmin.patch(`${RESOURCE}/${id}`, userData);
    return res.data.data;
  } catch (error: any) {
    console.error("Lỗi khi cập nhật user:", error);
    throw new Error(error.response?.data?.message || "Cập nhật thất bại");
  }
};

export const blockUserAndUnBlock = async (id: string, userData: User): Promise<User> => {
  try {
    const updatedUser = { ...userData, isActive: !userData.isActive };
    const res = await httpAdmin.patch(`${RESOURCE}/${id}/status`, updatedUser);
    return res.data.data;
  } catch (error: any) {
    console.log("lỗi khi block user:", error);
    throw new Error(error.response?.data?.message || "block user thất bại");
  }
};
