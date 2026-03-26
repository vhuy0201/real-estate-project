import { Request, Response } from "express";
import { dashboardService } from "../../../services/dashboard.service";

export const dashboardController = {
  async getStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      if (user.role !== "seller" && user.role !== "agent") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const stats = await dashboardService.getStats(user.id, user.role);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Dashboard error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  },
};
