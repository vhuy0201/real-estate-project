// src/utils/authCookie.ts
import { Response } from "express";

export const setAuthCookie = (res: Response, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,                
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
  });
};

export const clearAuthCookie = (res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};
