// src/utils/responseHandler.ts
import { Response } from "express";

export const successResponse = (res: Response, message: string, data?: any) => {
  return res.status(200).json({ success: true, message, data });
};

export const errorResponse = (res: Response, message: string, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};
