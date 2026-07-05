import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface DashboardSummary {
  total_products: number;
  active_products: number;
  total_warehouses: number;
  total_suppliers: number;
  current_inventory_value: number;
  low_stock_products: number;
  out_of_stock_products: number;
}

export interface InventoryReportItem {
  product_id: string;
  product_name: string;
  sku: string;
  category_name: string;
  warehouse_id: string;
  warehouse_name: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  unit_cost: number;
  inventory_value: number;
  is_low_stock: boolean;
}

export interface SupplierSummaryItem {
  supplier_id: string;
  supplier_name: string;
  total_orders: number;
  pending_orders: number;
  fully_received_orders: number;
  total_spent: number;
}

export interface ProcurementReport {
  total_purchase_orders: number;
  total_goods_receipts: number;
  pending_purchase_orders: number;
  fully_received_purchase_orders: number;
  supplier_summaries: SupplierSummaryItem[];
}

export interface CommerceReport {
  total_customer_orders: number;
  draft_orders: number;
  confirmed_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_reserved_inventory: number;
  total_revenue: number;
}

export interface StockMovementReportItem {
  id: string;
  reference_number: string;
  product_name: string;
  warehouse_name: string;
  movement_type: string;
  quantity_changed: number;
  balance_before: number;
  balance_after: number;
  reference_source?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["reports", "dashboard-summary"],
    queryFn: () => apiClient.get<DashboardSummary>("/api/v1/reports/dashboard-summary"),
  });
}

export function useInventoryReport(params?: {
  search?: string;
  warehouse_id?: string;
  category_id?: string;
  low_stock_only?: boolean;
}) {
  return useQuery({
    queryKey: ["reports", "inventory", params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append("search", params.search);
      if (params?.warehouse_id) searchParams.append("warehouse_id", params.warehouse_id);
      if (params?.category_id) searchParams.append("category_id", params.category_id);
      if (params?.low_stock_only) searchParams.append("low_stock_only", "true");
      
      const queryString = searchParams.toString();
      return apiClient.get<InventoryReportItem[]>(`/api/v1/reports/inventory${queryString ? `?${queryString}` : ""}`);
    },
  });
}

export function useProcurementReport() {
  return useQuery({
    queryKey: ["reports", "procurement"],
    queryFn: () => apiClient.get<ProcurementReport>("/api/v1/reports/procurement"),
  });
}

export function useCommerceReport() {
  return useQuery({
    queryKey: ["reports", "commerce"],
    queryFn: () => apiClient.get<CommerceReport>("/api/v1/reports/commerce"),
  });
}

export function useStockMovementReport(params?: {
  product_id?: string;
  warehouse_id?: string;
  movement_type?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ["reports", "stock-movements", params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.product_id) searchParams.append("product_id", params.product_id);
      if (params?.warehouse_id) searchParams.append("warehouse_id", params.warehouse_id);
      if (params?.movement_type) searchParams.append("movement_type", params.movement_type);
      if (params?.start_date) searchParams.append("start_date", params.start_date);
      if (params?.end_date) searchParams.append("end_date", params.end_date);
      
      const queryString = searchParams.toString();
      return apiClient.get<StockMovementReportItem[]>(`/api/v1/reports/stock-movements${queryString ? `?${queryString}` : ""}`);
    },
  });
}
