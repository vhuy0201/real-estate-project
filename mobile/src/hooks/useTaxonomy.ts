import { useQuery } from '@tanstack/react-query';
import { taxonomyService } from '../services/taxonomyService';

export const useTaxonomies = () => {
  return useQuery({
    queryKey: ['taxonomies'],
    queryFn: taxonomyService.getTaxonomies,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
};

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: taxonomyService.getCities,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useDistricts = (cityId?: string) => {
  return useQuery({
    queryKey: ['districts', cityId],
    queryFn: () => taxonomyService.getDistricts(cityId!),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useWards = (districtId?: string) => {
  return useQuery({
    queryKey: ['wards', districtId],
    queryFn: () => taxonomyService.getWards(districtId!),
    enabled: !!districtId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useAllLocations = () => {
  return useQuery({
    queryKey: ['allLocations'],
    queryFn: taxonomyService.getAllLocations,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
