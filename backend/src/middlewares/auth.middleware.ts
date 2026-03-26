import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

/**
 * Optional token verification - không bắt buộc phải có token
 * Nếu có token hợp lệ thì set req.user, nếu không có hoặc không hợp lệ thì tiếp tục
 */
export const verifyTokenOptional = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return next(); // Không có token thì tiếp tục
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    // Token không hợp lệ nhưng vẫn tiếp tục (không set req.user)
    next();
  }
};