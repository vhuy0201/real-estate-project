import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/agentService';

export const useAgents = (params?: { page?: number; limit?: number; keyword?: string }) => {
  return useQuery({
    queryKey: ['agents', params],
    queryFn: () => agentService.getAgents(params),
  });
};

export const useAgentDetail = (id: string) => {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentService.getAgentById(id),
    enabled: !!id,
  });
};
