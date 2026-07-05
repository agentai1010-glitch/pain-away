import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CustomerOrderItemCreate {
  product_id: string;
  ordered_quantity: number;
}

export interface CustomerOrderCreate {
  customer_name: string;
  customer_phone: string;
  order_date: string;
  notes?: string;
  items: CustomerOrderItemCreate[];
  created_by: string;
}

export interface CustomerOrderItemResponse {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  selling_price: number;
  tax_rate: number;
  ordered_quantity: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrderResponse {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_date: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: CustomerOrderItemResponse[];
}

export function useCustomerOrders() {
  return useQuery({
    queryKey: ["customer_orders"],
    queryFn: () => apiClient.get<CustomerOrderResponse[]>("/api/v1/customer-orders"),
  });
}

export function useCustomerOrder(id: string) {
  return useQuery({
    queryKey: ["customer_orders", id],
    queryFn: () => apiClient.get<CustomerOrderResponse>(`/api/v1/customer-orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerOrderCreate) => apiClient.post<CustomerOrderResponse>("/api/v1/customer-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer_orders"] });
    },
  });
}

export function useConfirmCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<CustomerOrderResponse>(`/api/v1/customer-orders/${id}/confirm`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["customer_orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer_orders", id] });
    },
  });
}

export function useCancelCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<CustomerOrderResponse>(`/api/v1/customer-orders/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["customer_orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer_orders", id] });
    },
  });
}

export function useCompleteCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<CustomerOrderResponse>(`/api/v1/customer-orders/${id}/complete`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["customer_orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer_orders", id] });
    },
  });
}
