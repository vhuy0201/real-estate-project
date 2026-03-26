import { Request, Response } from "express";
import { agentService } from "../../services/agent.service";
import { successResponse, errorResponse } from "../../utils/responseHandler";

export async function getPublicAgentInfo(req: Request, res: Response) {
  try {
    const agentId = req.params.id;

    const data = await agentService.getPublicAgentInfo(agentId);
    if (!data) return errorResponse(res, "agent_not_found", 404);

    return successResponse(res, "agent_info_retrieved", data);
  } catch (err) {
    console.error("Get agent info error:", err);
    return errorResponse(res, "internal_server_error", 500);
  }
}
export async function getAgentSoldProperties(req: Request, res: Response) {
  try {
    const agentId = req.params.id;

    const data = await agentService.getAgentSoldProperties(agentId);

    return successResponse(res, "agent_properties_listed", data);
  } catch (err) {
    console.error("Get agent sold properties error:", err);
    return errorResponse(res, "internal_server_error", 500);
  }
}

export async function getAgentReviews(req: Request, res: Response) {
  try {
    const agentId = req.params.id;

    const data = await agentService.getAgentReviews(agentId);

    return successResponse(res, "agent_reviews_listed", data);
  } catch (err) {
    console.error("Get agent reviews error:", err);
    return errorResponse(res, "internal_server_error", 500);
  }
}

export async function listPublicAgents(req: Request, res: Response) {
  try {
    const agents = await agentService.getPublicAgents();

    return successResponse(res, "agent_public_listed", agents);
  } catch (err) {
    console.error("List public agents error:", err);
    return errorResponse(res, "internal_server_error", 500);
  }
}
