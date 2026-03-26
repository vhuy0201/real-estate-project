import type { RequestJoinProperty } from "@/types/RequestJoinProperty";
import type { Agent } from "../types/Agent";
import { httpClient } from "../utils/httpClient";

const RESOURCE = "/seller";

export const getAllAgents = async (): Promise<Agent[]> => {
  const res = await httpClient.get(`${RESOURCE}/agents`);
  return res.data.data.data;
}
export const assignAgent = async (id: string, agentId: string) => {
  try {
    const response = await httpClient.post(`${RESOURCE}/properties/${id}/assign-agent`, {
      agent_id: agentId,
    });
    console.log("Request body:", { agent_id: agentId });
    return response.data;
  } catch (error) {
    console.error("Error assigning agent:", error);

    throw error;
  }
};

export const getAllJoinedAgentsRequest = async (): Promise<RequestJoinProperty[]> => {
  try {
    const response = await httpClient.get(`${RESOURCE}/assignments`);
    return response.data.data
  } catch (error) {
    console.error("Error fetching joined agents requests:", error);
    throw error;
  }
}

export const acceptAgentRequest = async (assignmentId: string) => {
  try {
    const response = await httpClient.patch(`${RESOURCE}/assignments/${assignmentId}/accept`);
    return response.data;
  } catch (error) {
    console.error("Error accepting agent request:", error);
    throw error;
  }
}

export const rejectAgentRequest = async (assignmentId: string) => {
  try {
    const response = await httpClient.patch(`${RESOURCE}/assignments/${assignmentId}/reject`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting agent request:", error);
    throw error;
  }
}