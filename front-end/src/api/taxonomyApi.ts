// src/api/taxonomyApi.ts
import api from "./api";

export const taxonomyApi = {
    getAll: (type: string) => api.get(`/api/admin/${type}`),
    create: (type: string, data: any) => api.post(`/api/admin/${type}`, data),
    update: (type: string, id: string, data: any) => api.patch(`/api/admin/${type}/${id}`, data),
    delete: (type: string, id: string) => api.delete(`/api/admin/${type}/${id}`),
};
