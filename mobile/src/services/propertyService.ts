import { api } from './api';
import { PropertiesResponse, PropertyFilters } from '../types/property';

export const propertyService = {
  getPublicProperties: async (filters?: PropertyFilters): Promise<PropertiesResponse> => {
    // Clean up undefined parameters before sending request
    const params = { ...filters };
    Object.keys(params).forEach(key => params[key as keyof PropertyFilters] === undefined && delete params[key as keyof PropertyFilters]);

    const response = await api.get('/public/properties', { params });
    // Backend trả về successResponse({ data: dataWithAddress })
    // => { success: true, data: { data: [...] } }
    return response.data.data; 
  },

  getPropertyById: async (id: string) => {
    const response = await api.get(`/public/properties/${id}`);
    // Backend : { success: true, data: { data: { ... } } }
    return response.data.data;
  },

  createProperty: async (formData: FormData) => {
    const response = await api.post('/client/seller/properties/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyProperties: async (params?: { page?: number; limit?: number; status?: string; keyword?: string }) => {
    const response = await api.get('/client/seller/properties', { params });
    // Backend trả về successResponse có data lồng bên trong
    return response.data.data;
  },

  updateProperty: async (id: string, formData: FormData) => {
    const response = await api.patch(`/client/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProperty: async (id: string) => {
    const response = await api.delete(`/client/properties/${id}`);
    return response.data;
  },

  getTaxonomies: async () => {
    const response = await api.get('/client/seller/taxonomies');
    return response.data;
  },

  generateDescription: async (data: any) => {
    const response = await api.post('/client/seller/properties/generate-description', data);
    return response.data;
  }
};
