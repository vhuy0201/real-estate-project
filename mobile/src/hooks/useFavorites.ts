import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "../services/favoriteService";
import type { FavoriteProperty } from "../types/favorite";

const favoritesQueryKey = ["myFavorites"];
const favoriteCheckQueryKeyBase = ["favoriteCheck"];

export const useMyFavorites = (enabled: boolean = true) => {
  return useQuery({
    queryKey: favoritesQueryKey,
    queryFn: () => favoriteService.getMyFavorites(),
    enabled,
  });
};

export const useFavoriteCheck = (propertyId?: string) => {
  return useQuery({
    queryKey: [...favoriteCheckQueryKeyBase, propertyId],
    queryFn: async () => {
      if (!propertyId) return false;
      return favoriteService.checkFavorite(propertyId);
    },
    enabled: !!propertyId,
  });
};

export const useFavoriteMutations = () => {
  const queryClient = useQueryClient();

  const invalidateFavorites = () => {
    queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    // invalidate all check queries regardless of propertyId
    queryClient.invalidateQueries({
      queryKey: favoriteCheckQueryKeyBase,
    });
  };

  const addFavorite = useMutation({
    mutationFn: (propertyId: string) => favoriteService.addFavorite(propertyId),
    onSuccess: invalidateFavorites,
  });

  const removeFavorite = useMutation({
    mutationFn: (propertyId: string) => favoriteService.removeFavorite(propertyId),
    onSuccess: invalidateFavorites,
  });

  return { addFavorite, removeFavorite };
};

export const mapFavoritesToPropertyIds = (favorites?: FavoriteProperty[]) =>
  (favorites ?? []).map((f) => f.id).filter(Boolean);

