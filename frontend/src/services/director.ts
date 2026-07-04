import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { CatalogItem } from '@/types/catalog';
import { LoginRequest, TokenResponse } from '@/types/reception'; // Reusing these types since they are the same shape

export function useDirectorLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      // For now, if the backend doesn't have a specific director login endpoint yet,
      // we can try /api/v1/director/login. If it's the same system, it might just be the same login endpoint.
      // Using the reception login endpoint for now since a dedicated director auth endpoint does not exist on the backend yet.
      return apiClient.post<TokenResponse>('/api/v1/reception/login', data);
    },
  });
}

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
