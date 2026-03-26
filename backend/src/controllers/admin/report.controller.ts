import { Request, Response } from "express";
import * as reportService from "../../services/admin/report.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";

export const getAdminSummary = async (req: Request, res: Response) => {
  try {
    const data = await reportService.getSummary();
    return successResponse(req, res, "reports.summary_success", data);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "reports.summary_error", 500);
  }
};

export const getRevenueChart = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const data = await reportService.getRevenueChart(year, month, startDate, endDate);

    return successResponse(req, res, "reports.revenue_success", data);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "reports.revenue_error", 500);
  }
};

export const getTopAgents = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const data = await reportService.getTopAgents(limit);

    return successResponse(req, res, "reports.top_agents_success", data);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "reports.top_agents_error", 500);
  }
};

export const getTopSellers = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const data = await reportService.getTopSellers(limit);

    return successResponse(req, res, "reports.top_sellers_success", data);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "reports.top_sellers_error", 500);
  }
};

export const getUserRolesSummary = async (req: Request, res: Response) => {
  try {
    const data = await reportService.getUserRolesSummary();
    return successResponse(req, res, "reports.user_roles_summary_success", data);
  } catch (error: any) {
    return errorResponse(req, res, error.message || "reports.user_roles_summary_error", 500);
  }
};

