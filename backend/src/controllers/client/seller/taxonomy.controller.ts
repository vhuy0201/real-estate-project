import { Request, Response } from "express";
import { taxonomyService } from "../../../services/taxonomy.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";

export const getTaxonomies = async (req: Request, res: Response) => {
  try {
    const data = await taxonomyService.getAll();
    return successResponse(req, res, "Fetched all taxonomies successfully", data);
  } catch (error: any) {
    console.error("Error fetching taxonomies:", error);
    return errorResponse(req, res, error.message || "Failed to fetch taxonomies", 500);
  }
};
