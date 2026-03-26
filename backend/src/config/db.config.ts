import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

/**
 * Atlas dùng mongodb+srv:// → Node phải tra DNS SRV.
 * Trên Windows, DNS mặc định đôi khi trả querySrv ECONNREFUSED; ép resolver công cộng thường hết lỗi.
 */
const configureDnsForMongo = () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    /* ignore */
  }
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch {
    /* Node cũ có thể không có API này */
  }
};

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URL as string;
  if (!uri || typeof uri !== "string" || !uri.trim()) {
    throw new Error("Thiếu MONGO_URL trong .env");
  }

  configureDnsForMongo();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15_000,
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    console.error(
      "Gợi ý: đổi DNS Windows sang 8.8.8.8, hoặc trong Atlas → Connect → Drivers → chọn connection string 'Standard' (không dùng mongodb+srv) và gán vào MONGO_URL."
    );
    throw error;
  }
};
