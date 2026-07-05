import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product } from "./product";
import { Warehouse } from "./warehouse";
import { Supplier } from "./supplier";

export type PurchaseOrderStatus = 
  | "DRAFT" 
  | "SUBMITTED" 
  | "PARTIALLY_RECEIVED" 
  | "FULLY_RECEIVED" 
  | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  ordered_quantity: number;
  unit_cost: number;
  tax_rate: number;
  line_total: number;
  product: Product;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_delivery_date: string | null;
  status: PurchaseOrderStatus;
  notes: string | null;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  supplier: Supplier;
  warehouse: Warehouse;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemCreate {
  product_id: string;
  ordered_quantity: number;
  unit_cost: number;
  tax_rate: number;
}

export interface PurchaseOrderCreate {
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_delivery_date?: string | null;
  notes?: string | null;
  items: PurchaseOrderItemCreate[];
  created_by?: string;
}

export interface PurchaseOrderUpdate {
  supplier_id?: string;
  warehouse_id?: string;
  order_date?: string;
  expected_delivery_date?: string | null;
  notes?: string | null;
  items?: PurchaseOrderItemCreate[];
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => apiClient.get<PurchaseOrder[]>("/api/v1/purchase-orders"),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: () => apiClient.get<PurchaseOrder>(`/api/v1/purchase-orders/${id}`),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseOrderCreate) => apiClient.post<PurchaseOrder>("/api/v1/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderUpdate }) => 
      apiClient.put<PurchaseOrder>(`/api/v1/purchase-orders/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", data.id] });
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<PurchaseOrder>(`/api/v1/purchase-orders/${id}/submit`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", data.id] });
    },
  });
}
