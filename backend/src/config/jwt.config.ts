// src/config/jwt.config.ts
// src/config/jwt.config.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
console.log("JWT_SECRET:", JWT_SECRET);
console.log("JWT_REFRESH_SECRET:", JWT_REFRESH_SECRET);

// Tạo access token
export const generateAccessToken = (payload: object) => {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing in .env");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }); 
};

// Tạo refresh token
export const generateRefreshToken = (payload: object) => {
  if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET missing in .env");
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// Xác thực refresh token
export const verifyRefreshToken = (token: string) => {
  if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET missing in .env");
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
