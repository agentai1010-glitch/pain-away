import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AdvancePaymentRequest, PaymentResponse } from "@/types/billing";

export const billingService = {
  processAdvancePayment: (data: AdvancePaymentRequest) => {
    return apiClient.post<PaymentResponse>("/api/v1/billing/advance-payment", data);
  }
};

export function useProcessAdvancePayment() {
  return useMutation({
    mutationFn: billingService.processAdvancePayment,
  });
}
