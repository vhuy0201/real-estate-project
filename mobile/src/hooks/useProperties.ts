import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { propertyService } from '../services/propertyService';
import { PropertyFilters } from '../types/property';

export const useProperties = (filters?: PropertyFilters) => {
  return useInfiniteQuery({
    queryKey: ['properties', filters],
    queryFn: ({ pageParam = 1 }) => 
      propertyService.getPublicProperties({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage: any) => {
      const { currentPage, totalPages } = lastPage.pagination || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const usePropertyDetails = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id),
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  return useMutation({
    mutationFn: (formData: FormData) => propertyService.createProperty(formData),
  });
};

export const useMyProperties = (params?: { status?: string; keyword?: string }) => {
  return useQuery({
    queryKey: ['myProperties', params],
    queryFn: () => propertyService.getMyProperties(params),
  });
};

export const useUpdateProperty = (id: string) => {
  return useMutation({
    mutationFn: (formData: FormData) => propertyService.updateProperty(id, formData),
  });
};

export const useDeleteProperty = () => {
  return useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
  });
};

export const useGenerateDescription = () => {
  return useMutation({
    mutationFn: (data: any) => propertyService.generateDescription(data),
  });
};
