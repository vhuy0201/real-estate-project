import { createAxiosInstance } from "../utils/axiosInstance";
import type { City } from "../types/Cities";
import type { PropertyType } from "../types/PropertyTypes";
import type { Feature } from "../types/Features";

export type TaxonomiesResponse = {
    cities: City[];
    propertyTypes: PropertyType[];
    categories: { _id: string; category_name: any }[];
    features: Feature[];
};

export const taxonomyService = {
    getAll: async (): Promise<TaxonomiesResponse> => {
        const api = createAxiosInstance();
        const response = await api.get("/api/client/seller/taxonomies");

        const payload = response.data?.data || response.data || {};

        const normalizeCities = (arr: any[]): City[] =>
            (arr || []).map((c: any) => ({
                _id: c._id,
                city_name: c.city_name ?? c.name ?? { vi: c?.vi ?? c?.name ?? "", en: c?.en ?? c?.name ?? "" },
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            }));

        const normalizeTypes = (arr: any[]): PropertyType[] =>
            (arr || []).map((t: any) => ({
                _id: t._id,
                type_name: t.type_name ?? t.name ?? { vi: t?.vi ?? t?.name ?? "", en: t?.en ?? t?.name ?? "" },
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
            }));

        const normalizeFeatures = (arr: any[]): Feature[] =>
            (arr || []).map((f: any) => ({
                _id: f._id,
                feature_name: f.feature_name ?? f.name ?? { vi: f?.vi ?? f?.name ?? "", en: f?.en ?? f?.name ?? "" },
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
            }));

        return {
            cities: Array.isArray(payload.cities) ? normalizeCities(payload.cities) : [],
            propertyTypes: Array.isArray(payload.propertyTypes) ? normalizeTypes(payload.propertyTypes) : [],
            categories: Array.isArray(payload.categories) ? payload.categories : [],
            features: Array.isArray(payload.features) ? normalizeFeatures(payload.features) : [],
        };
    },
};


