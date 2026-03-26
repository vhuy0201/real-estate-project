import { api } from "./api";

export interface Assignment {
  _id: string;
  property_id: any; // populated property info
  agent_id: any; // populated agent user info
  owner_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  note?: string;
  createdAt: string;
  updatedAt: string;
  actedBy?: string;
  actedAt?: string;
}

export interface AssignmentListResponse {
  data: Assignment[];
  total?: number;
}

export const assignmentService = {
  /**
   * Get seller's incoming assignment requests from agents
   * GET /api/client/seller/assignments
   */
  getSellerAssignments: async (filters?: {
    status?: "pending" | "accepted" | "rejected" | "cancelled";
    page?: number;
    limit?: number;
  }): Promise<AssignmentListResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await api.get(
        `/client/seller/assignments?${params.toString()}`,
      );

      const responseData = response.data.data || response.data;
      return {
        data: Array.isArray(responseData)
          ? responseData
          : responseData.data || [],
        total: responseData.total,
      };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch assignments";
      throw new Error(errorMessage);
    }
  },

  /**
   * Accept assignment request - assigns agent to property
   * PATCH /api/client/seller/assignments/:id/accept
   */
  acceptAssignment: async (assignmentId: string): Promise<any> => {
    try {
      const response = await api.patch(
        `/client/seller/assignments/${assignmentId}/accept`,
      );
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept assignment";
      throw new Error(errorMessage);
    }
  },

  /**
   * Reject assignment request
   * PATCH /api/client/seller/assignments/:id/reject
   */
  rejectAssignment: async (
    assignmentId: string,
    reason?: string,
  ): Promise<Assignment> => {
    try {
      const payload = reason ? { reason } : {};
      const response = await api.patch(
        `/client/seller/assignments/${assignmentId}/reject`,
        payload,
      );
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject assignment";
      throw new Error(errorMessage);
    }
  },

  /**
   * Cancel assignment request when it's in pending state
   * PATCH /api/client/seller/assignments/:id/cancel
   */
  cancelAssignment: async (assignmentId: string): Promise<Assignment> => {
    try {
      const response = await api.patch(
        `/client/seller/assignments/${assignmentId}/cancel`,
      );
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel assignment";
      throw new Error(errorMessage);
    }
  },

  // Seller gửi yêu cầu gán agent cho property
  createAssignmentRequest: async (
    propertyId: string,
    agentId: string,
    note?: string,
  ) => {
    const response = await api.post(
      `/client/seller/properties/${propertyId}/assign-agent`,
      { agent_id: agentId, note },
    );
    return response.data;
  },

  // Seller gỡ agent khỏi property (sau khi đã gán thành công)
  removeAgentFromProperty: async (propertyId: string) => {
    const response = await api.patch(
      `/client/seller/properties/${propertyId}/remove-agent`,
    );
    return response.data;
  },

  // Agent lấy danh sách yêu cầu gán từ seller
  getAgentAssignments: async (params?: { status?: string }) => {
    const response = await api.get("/client/agent/assignments", { params });
    return response.data.data;
  },

  // Agent chấp nhận yêu cầu của seller
  agentAcceptRequest: async (assignmentId: string) => {
    const response = await api.patch(
      `/client/agent/assignments/${assignmentId}/accept`,
    );
    return response.data;
  },

  // Agent từ chối yêu cầu của seller
  agentRejectRequest: async (assignmentId: string, reason?: string) => {
    const response = await api.patch(
      `/client/agent/assignments/${assignmentId}/reject`,
      { reason },
    );
    return response.data;
  },

  // Agent chủ động xin quản lý BĐS của seller
  agentRequestManage: async (propertyId: string, note?: string) => {
    const response = await api.post(
      `/client/agent/properties/${propertyId}/request-manage`,
      { note },
    );
    return response.data;
  },

  // Agent hủy yêu cầu xin quản lý đã gửi
  agentCancelRequest: async (assignmentId: string) => {
    const response = await api.patch(
      `/client/agent/assignments/${assignmentId}/cancel`,
    );
    return response.data;
  },
};
