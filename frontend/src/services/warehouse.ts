import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string;
  contact_person: string | null;
  phone_number: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WarehouseCreate = Omit<Warehouse, "id" | "is_active" | "created_at" | "updated_at">;
export type WarehouseUpdate = Partial<WarehouseCreate>;

export function useWarehouses(includeInactive: boolean = true) {
  return useQuery({
    queryKey: ["warehouses", includeInactive],
    queryFn: () => apiClient.get<Warehouse[]>(`/api/v1/warehouses?include_inactive=${includeInactive}`),
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: () => apiClient.get<Warehouse>(`/api/v1/warehouses/${id}`),
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WarehouseCreate) => apiClient.post<Warehouse>("/api/v1/warehouses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarehouseUpdate }) => 
      apiClient.patch<Warehouse>(`/api/v1/warehouses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useActivateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Warehouse>(`/api/v1/warehouses/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useDeactivateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Warehouse>(`/api/v1/warehouses/${id}/deactivate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}
