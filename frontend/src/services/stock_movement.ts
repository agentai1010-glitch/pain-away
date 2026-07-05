import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product } from "./product";
import { Warehouse } from "./warehouse";

export type MovementType = 
  | "OPENING_STOCK" 
  | "GOODS_RECEIVED" 
  | "RESERVATION" 
  | "RESERVATION_RELEASED" 
  | "SALE" 
  | "ADJUSTMENT" 
  | "RETURN";

export interface StockMovement {
  id: string;
  reference_number: string;
  product_id: string;
  warehouse_id: string;
  movement_type: MovementType;
  quantity_changed: number;
  balance_before: number;
  balance_after: number;
  reference_source: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  product: Product;
  warehouse: Warehouse;
}

export type StockMovementCreate = {
  product_id: string;
  warehouse_id: string;
  movement_type: MovementType;
  quantity_changed: number;
  reference_source?: string;
  notes?: string;
  created_by?: string;
}

export function useStockMovements(warehouseId?: string, productId?: string, movementType?: MovementType) {
  return useQuery({
    queryKey: ["stock-movements", warehouseId, productId, movementType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouse_id", warehouseId);
      if (productId) params.append("product_id", productId);
      if (movementType) params.append("movement_type", movementType);
      
      const queryString = params.toString();
      const url = `/api/v1/stock-movements${queryString ? `?${queryString}` : ""}`;
      
      return apiClient.get<StockMovement[]>(url);
    },
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockMovementCreate) => apiClient.post<StockMovement>("/api/v1/stock-movements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      // Also invalidate inventory since it updates
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
