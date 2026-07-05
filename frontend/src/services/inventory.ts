import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product } from "./product";
import { Warehouse } from "./warehouse";

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
  product: Product;
  warehouse: Warehouse;
}

export function useInventory(warehouseId?: string, productId?: string) {
  return useQuery({
    queryKey: ["inventory", warehouseId, productId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouse_id", warehouseId);
      if (productId) params.append("product_id", productId);
      
      const queryString = params.toString();
      const url = `/api/v1/inventory${queryString ? `?${queryString}` : ""}`;
      
      return apiClient.get<Inventory[]>(url);
    },
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ["inventory", id],
    queryFn: () => apiClient.get<Inventory>(`/api/v1/inventory/${id}`),
    enabled: !!id,
  });
}
