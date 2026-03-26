import { api } from "./api";
import type { FavoriteProperty } from "../types/favorite";
import type { Property } from "../types/property";

type FavoriteListPayload = {
  total?: number;
  data?: unknown[];
};

const normalizeFavorites = (payload: any): {
  total: number;
  properties: FavoriteProperty[];
} => {
  // Backend: successResponse(..., { data: result })
  // => response.data.data.data = result
  const maybePayload = payload?.data ?? payload;
  const result = maybePayload?.data ?? maybePayload;

  const favoritesArray = Array.isArray(result)
    ? result
    : Array.isArray(maybePayload)
      ? maybePayload
      : [];

  const total =
    typeof payload?.total === "number"
      ? payload.total
      : typeof maybePayload?.total === "number"
        ? maybePayload.total
        : favoritesArray.length;

  const properties: FavoriteProperty[] = favoritesArray.map((fav: any) => {
    const property: any = fav?.property_id ? { ...fav } : fav;
    const propertyId = fav?.property_id ?? fav?.id ?? property?.property_id;

    // Map favorite payload -> Property-like shape.
    const mapped: Partial<Property> & { id: string } = {
      ...fav,
      id: String(propertyId),
      // Keep both for safety (some UI expects `id`, others `property_id`)
      property_id: propertyId,
    };

    return mapped as FavoriteProperty;
  });

  return { total, properties };
};

export const favoriteService = {
  getMyFavorites: async (): Promise<{ total: number; properties: FavoriteProperty[] }> => {
    const response = await api.get("/client/buyer/favorites");
    return normalizeFavorites(response.data?.data ?? response.data);
  },

  checkFavorite: async (propertyId: string): Promise<boolean> => {
    const response = await api.get(
      `/client/buyer/favorites/${propertyId}/check`,
    );
    const payload = response.data?.data ?? response.data;
    return Boolean(payload?.isFavorite ?? payload?.data?.isFavorite);
  },

  addFavorite: async (propertyId: string) => {
    await api.post("/client/buyer/favorites", { property_id: propertyId });
  },

  removeFavorite: async (propertyId: string) => {
    await api.delete(`/client/buyer/favorites/${propertyId}`);
  },
};

