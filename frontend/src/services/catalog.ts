import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CatalogItem } from "@/types/catalog";

export const catalogService = {
  getPublicCatalog: () => {
    return apiClient.get<CatalogItem[]>("/api/v1/catalog/public");
  },
};

export function usePublicCatalog() {
  return useQuery({
    queryKey: ["catalog", "public"],
    queryFn: catalogService.getPublicCatalog,
  });
}
