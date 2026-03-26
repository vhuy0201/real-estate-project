import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../services/assignmentService';

export const useAssignments = (role: 'seller' | 'agent', params?: { status?: string }) => {
  return useQuery({
    queryKey: ['assignments', role, params],
    queryFn: () => role === 'seller' 
      ? assignmentService.getSellerAssignments(params) 
      : assignmentService.getAgentAssignments(params),
  });
};

export const useAssignmentMutations = () => {
  const queryClient = useQueryClient();

  const createRequest = useMutation({
    mutationFn: ({ propertyId, agentId, note }: { propertyId: string, agentId: string, note?: string }) => 
      assignmentService.createAssignmentRequest(propertyId, agentId, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const agentRequest = useMutation({
    mutationFn: ({ propertyId, note }: { propertyId: string, note?: string }) => 
      assignmentService.agentRequestManage(propertyId, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const acceptRequest = useMutation({
    mutationFn: ({ id, role }: { id: string, role: 'seller' | 'agent' }) => 
      role === 'seller' ? assignmentService.sellerAcceptRequest(id) : assignmentService.agentAcceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: ({ id, role, reason }: { id: string, role: 'seller' | 'agent', reason?: string }) => 
      role === 'seller' ? assignmentService.sellerRejectRequest(id, reason) : assignmentService.agentRejectRequest(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const cancelRequest = useMutation({
    mutationFn: ({ id, role }: { id: string, role: 'seller' | 'agent' }) => 
      role === 'seller' ? assignmentService.cancelAssignmentRequest(id) : assignmentService.agentCancelRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const removeAgent = useMutation({
    mutationFn: (propertyId: string) => assignmentService.removeAgentFromProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    },
  });

  return {
    createRequest,
    agentRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeAgent,
  };
};
