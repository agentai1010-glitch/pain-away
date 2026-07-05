import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string | null;
  gst_number: string;
  address: string;
  payment_terms: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SupplierCreate = Omit<Supplier, "id" | "is_active" | "created_at" | "updated_at">;
export type SupplierUpdate = Partial<SupplierCreate>;

export function useSuppliers(includeInactive: boolean = true) {
  return useQuery({
    queryKey: ["suppliers", includeInactive],
    queryFn: () => apiClient.get<Supplier[]>(`/api/v1/suppliers?include_inactive=${includeInactive}`),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => apiClient.get<Supplier>(`/api/v1/suppliers/${id}`),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierCreate) => apiClient.post<Supplier>("/api/v1/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdate }) => 
      apiClient.patch<Supplier>(`/api/v1/suppliers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useActivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Supplier>(`/api/v1/suppliers/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Supplier>(`/api/v1/suppliers/${id}/deactivate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
