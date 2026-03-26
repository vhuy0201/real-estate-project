import { api } from './api';

export const agentService = {
  getAgents: async (params?: { page?: number; limit?: number; keyword?: string }) => {
    const response = await api.get('/client/seller/agents', { params });
    // Dữ liệu trả về từ backend: { success: true, message: "...", data: { data: [...], pagination: {...} } }
    return response.data.data;
  },

  getAgentById: async (id: string) => {
    const response = await api.get(`/client/seller/agents/${id}`);
    // Dữ liệu trả về từ backend: { success: true, message: "...", data: { ...agentBody } }
    return response.data.data;
  },
};
