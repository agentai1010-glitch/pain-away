import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product } from "./product";
import { Warehouse } from "./warehouse";
import { Supplier } from "./supplier";
import { PurchaseOrder } from "./purchase_order";

export interface GoodsReceiptItem {
  id: string;
  receipt_id: string;
  po_item_id: string;
  product_id: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  line_status: string;
  product: Product;
}

export interface GoodsReceipt {
  id: string;
  receipt_number: string;
  po_id: string;
  supplier_id: string;
  warehouse_id: string;
  received_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  purchase_order: PurchaseOrder;
  supplier: Supplier;
  warehouse: Warehouse;
  items: GoodsReceiptItem[];
}

export interface GoodsReceiptItemCreate {
  po_item_id: string;
  product_id: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
}

export interface GoodsReceiptCreate {
  po_id: string;
  supplier_id: string;
  warehouse_id: string;
  received_date: string;
  notes?: string | null;
  items: GoodsReceiptItemCreate[];
  created_by?: string;
}

export function useGoodsReceipts() {
  return useQuery({
    queryKey: ["goods-receipts"],
    queryFn: () => apiClient.get<GoodsReceipt[]>("/api/v1/goods-receiving"),
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: ["goods-receipts", id],
    queryFn: () => apiClient.get<GoodsReceipt>(`/api/v1/goods-receiving/${id}`),
    enabled: !!id,
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoodsReceiptCreate) => apiClient.post<GoodsReceipt>("/api/v1/goods-receiving", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    },
  });
}
