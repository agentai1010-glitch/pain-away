import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  selling_price: number;
  cost_price: number;
  tax_rate: number;
  image_url?: string;
  category_id?: string;
  brand_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  selling_price: number;
  cost_price: number;
  tax_rate: number;
  image_url?: string;
  category_id?: string | null;
  brand_id?: string | null;
}

export type ProductUpdate = Partial<ProductCreate> & { is_active?: boolean };

export function useProducts(includeInactive: boolean = true) {
  return useQuery({
    queryKey: ["products", includeInactive],
    queryFn: () => apiClient.get<Product[]>(`/api/v1/products?include_inactive=${includeInactive}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => apiClient.get<Product>(`/api/v1/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreate) => apiClient.post<Product>("/api/v1/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) =>
      apiClient.patch<Product>(`/api/v1/products/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

export function useActivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Product>(`/api/v1/products/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Product>(`/api/v1/products/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");
      const url = `${API_BASE_URL}/api/v1/products/upload-image`;
      
      const token = localStorage.getItem("director_token");
      const headers: HeadersInit = {
        "ngrok-skip-browser-warning": "69420",
      };
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      return response.json() as Promise<{ image_url: string }>;
    }
  });
}
