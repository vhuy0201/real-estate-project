import type { Offer, CreateOfferDto, OfferFilters } from '../types/Offer';
import api from '../api/api';

export const OfferService = {
  createOffer: async (data: CreateOfferDto): Promise<Offer> => {
    try {
      const apiPayload = {
        propertyId: data.property_id,
        amount: data.amount,
        note: data.note || '',
        currency: data.currency || 'VND',
        expiresAt: data.validityPeriod,
        attachments: data.attachments || [],
        meta: data.meta || {},
      };
      
      const response = await api.post('/api/client/buyer/offers', apiPayload);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create offer';
      throw new Error(errorMessage);
    }
  },

  getMyOffers: async (filters?: OfferFilters): Promise<Offer[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.property_id) params.append('propertyId', filters.property_id);
      
      const response = await api.get(`/api/client/buyer/offers?${params.toString()}`);
      
      const responseData = response.data.data || response.data;
      const offers = responseData.data || responseData;
      
      if (!Array.isArray(offers)) {
        return [];
      }
      
      return offers;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch offers');
    }
  },

  cancelOffer: async (offerId: string): Promise<Offer> => {
    try {
      const response = await api.patch(`/api/client/buyer/offers/${offerId}/cancel`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to cancel offer');
    }
  },

  getOfferById: async (offerId: string, role: 'seller' | 'agent'): Promise<Offer> => {
    try {
      const endpoint = role === 'seller' 
        ? `/api/client/seller/offers/${offerId}`
        : `/api/client/agent/offers/${offerId}`;
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch offer details');
    }
  },

  getAgentOffers: async (filters?: OfferFilters): Promise<Offer[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.property_id) params.append('property_id', filters.property_id);
      const response = await api.get(`/api/client/agent/offers?${params.toString()}`);
      const responseData = response.data.data || response.data;
      const offers = responseData.data || responseData;
      if (!Array.isArray(offers)) {
        return [];
      }
      
      return offers;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch agent offers');
    }
  },

  forwardOffer: async (offerId: string): Promise<Offer> => {
    try {
      const response = await api.patch(`/api/client/agent/offers/${offerId}/forward`, {});
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to forward offer');
    }
  },

  getSellerOffers: async (filters?: OfferFilters): Promise<Offer[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.property_id) params.append('property_id', filters.property_id);
      const response = await api.get(`/api/client/seller/offers?${params.toString()}`);
      const responseData = response.data.data || response.data;
      const offers = responseData.data || responseData;
      if (!Array.isArray(offers)) {
        return [];
      }
      
      return offers;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch seller offers');
    }
  },

  acceptOffer: async (offerId: string): Promise<Offer> => {
    try {
      const response = await api.patch(`/api/client/seller/offers/${offerId}/accept`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to accept offer');
    }
  },

  rejectOffer: async (offerId: string, reason?: string): Promise<Offer> => {
    try {
      const payload = reason ? { reason } : {};
      const response = await api.patch(`/api/client/seller/offers/${offerId}/reject`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to reject offer');
    }
  },
};

