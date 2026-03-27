import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  assignmentService,
  Assignment,
  AssignmentListResponse,
} from "../services/assignmentService";

/**
 * Hook to fetch seller's incoming assignment requests from agents
 */
export const useGetSellerAssignments = (
  filters?: {
    status?: "pending" | "accepted" | "rejected" | "cancelled";
    page?: number;
    limit?: number;
  },
  enabled = true,
): UseQueryResult<AssignmentListResponse> => {
  return useQuery({
    queryKey: [
      "sellerAssignments",
      filters?.status,
      filters?.page,
      filters?.limit,
    ],
    queryFn: () => assignmentService.getSellerAssignments(filters),
    enabled,
  });
};

/**
 * Hook to fetch agent's assignment requests (both sent and received)
 */
export const useGetAgentAssignments = (
  filters?: {
    status?: string;
  },
  enabled = true,
): UseQueryResult<AssignmentListResponse> => {
  return useQuery({
    queryKey: ["agentAssignments", filters?.status],
    queryFn: async () => {
      const data = await assignmentService.getAgentAssignments(filters);
      return {
        data: Array.isArray(data) ? data : data?.data || [],
        total: data?.total,
      } as AssignmentListResponse;
    },
    enabled,
  });
};

/**
 * Hook to accept an assignment request
 */
export const useAcceptAssignment = () => {
  return useMutation({
    mutationFn: (assignmentId: string) =>
      assignmentService.acceptAssignment(assignmentId),
  });
};

/**
 * Hook to reject an assignment request
 */
export const useRejectAssignment = () => {
  return useMutation({
    mutationFn: ({
      assignmentId,
      reason,
    }: {
      assignmentId: string;
      reason?: string;
    }) => assignmentService.rejectAssignment(assignmentId, reason),
  });
};

/**
 * Hook to cancel an assignment request
 */
export const useCancelAssignment = () => {
  return useMutation({
    mutationFn: (assignmentId: string) =>
      assignmentService.cancelAssignment(assignmentId),
  });
};
