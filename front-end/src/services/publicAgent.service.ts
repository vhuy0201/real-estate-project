import { httpPublic } from "../utils/httpPublic";
import type { Agent } from "../types/Agent";
import type { AgentInfoResponse, AgentReview, AgentProperty } from "../types/AgentDetail";

const RESOURCE = "/agents";

export const getPublicAgents = async (): Promise<Agent[]> => {
  const res = await httpPublic.get(`${RESOURCE}`);
  return res.data.data;
};

export const getPublicAgentInfo = async (agentId: string): Promise<AgentInfoResponse> => {
  const res = await httpPublic.get(`${RESOURCE}/${agentId}`);
  return res.data.data;
};

export const getAgentProperties = async (agentId: string): Promise<AgentProperty[]> => {
  const res = await httpPublic.get(`${RESOURCE}/${agentId}/properties`);
  return res.data.data;
};

export const getAgentReviews = async (agentId: string): Promise<AgentReview[]> => {
  const res = await httpPublic.get(`${RESOURCE}/${agentId}/reviews`);
  return res.data.data;
};

