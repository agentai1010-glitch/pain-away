import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CatalogItem } from "@/types/catalog";

export const catalogService = {
  getPublicCatalog: () => {
    return apiClient.get<CatalogItem[]>("/api/v1/catalog/public");
  },
  getPublicCatalogItem: (id: string) => {
    return apiClient.get<CatalogItem>(`/api/v1/catalog/public/${id}`);
  },
};

export function usePublicCatalog() {
  return useQuery({
    queryKey: ["catalog", "public"],
    queryFn: catalogService.getPublicCatalog,
  });
}

export function usePublicCatalogItem(id: string) {
  return useQuery({
    queryKey: ["catalog", "public", id],
    queryFn: () => catalogService.getPublicCatalogItem(id),
    enabled: !!id,
    retry: false, // Don't retry on 404
  });
}
