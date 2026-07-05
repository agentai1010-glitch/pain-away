import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BrandCreate = Omit<Brand, "id" | "is_active" | "created_at" | "updated_at">;
export type BrandUpdate = Partial<BrandCreate>;

export function useBrands(includeInactive: boolean = true) {
  return useQuery({
    queryKey: ["brands", includeInactive],
    queryFn: () => apiClient.get<Brand[]>(`/api/v1/brands?include_inactive=${includeInactive}`),
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: () => apiClient.get<Brand>(`/api/v1/brands/${id}`),
    enabled: !!id,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandCreate) => apiClient.post<Brand>("/api/v1/brands", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandUpdate }) => 
      apiClient.patch<Brand>(`/api/v1/brands/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useActivateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Brand>(`/api/v1/brands/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useDeactivateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Brand>(`/api/v1/brands/${id}/deactivate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
