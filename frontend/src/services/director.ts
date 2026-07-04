import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { CatalogItem } from '@/types/catalog';

export interface CatalogItemCreate {
  name: string;
  description?: string;
  item_type: 'SERVICE' | 'PACKAGE';
  price: number;
  is_active?: boolean;
  duration_minutes?: number;
  session_count?: number;
}

export interface CatalogItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
  duration_minutes?: number;
  session_count?: number;
}

export function useDirectorCatalog() {
  return useQuery({
    queryKey: ['director-catalog'],
    queryFn: async () => {
      return apiClient.get<CatalogItem[]>('/api/v1/catalog/director/items');
    },
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CatalogItemCreate) => {
      return apiClient.post<CatalogItem>('/api/v1/catalog/director/items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CatalogItemUpdate }) => {
      return apiClient.patch<CatalogItem>(`/api/v1/catalog/director/items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}
