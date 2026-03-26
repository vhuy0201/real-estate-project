import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/responseHandler";
import { userService } from "../../../services/common/user.service";

export const getAgentList = async (req: Request, res: Response) => {
	try {
		const filters = req.query || {};
		const result = await userService.getAgents(filters);
		return successResponse(req, res, "Danh sách agent", result);
	} catch (error: any) {
		console.error("getAgentList error:", error);
		return errorResponse(req, res, error.message || "Lỗi server", error.status || 500);
	}
};

export const getAgentDetail = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await userService.getAgentById(id);
		return successResponse(req, res, "Chi tiết agent", result);
	} catch (error: any) {
		console.error("getAgentDetail error:", error);
		return errorResponse(req, res, error.message || "Lỗi server", error.status || 500);
	}
};
