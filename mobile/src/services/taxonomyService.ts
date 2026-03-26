import { api } from './api';
import { 
  City, 
  District, 
  Ward, 
  TaxonomiesResponse, 
  LocationHierarchy 
} from '../types/taxonomy';

export const taxonomyService = {
  // Lấy list categories, types, features cho Seller/Agent
  getTaxonomies: async (): Promise<TaxonomiesResponse> => {
    const response = await api.get('/client/seller/taxonomies');
    // Backend trả về successResponse có data lồng bên trong
    return response.data.data;
  },

  // Location APIs
  getCities: async (): Promise<City[]> => {
    const response = await api.get('/public/taxonomy/cities');
    return response.data.data;
  },

  getDistricts: async (cityId: string): Promise<District[]> => {
    const response = await api.get(`/public/taxonomy/cities/${cityId}/districts`);
    return response.data.data;
  },

  getWards: async (districtId: string): Promise<Ward[]> => {
    const response = await api.get(`/public/taxonomy/districts/${districtId}/wards`);
    return response.data.data;
  },

  getAllLocations: async (): Promise<LocationHierarchy[]> => {
    const response = await api.get('/public/taxonomy/all');
    return response.data.data;
  }
};
