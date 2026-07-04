import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { BookingConfirmation, PatientBookingStatusResponse } from "@/types/orchestration";
// Reusing PublicBookingRequest from backend schemas (matching structure)
// We'll define it here for typescript
export interface PublicBookingRequest {
  catalog_item_id: string;
  date: string;
  start_time: string;
  patient_data: {
    first_name: string;
    last_name: string;
    mobile_number: string;
    basic_address: string;
  };
  advance_amount: number;
  transaction_reference: string;
}

export const orchestrationService = {
  checkPatientStatus: (data: { mobile_number: string }) => {
    return apiClient.post<PatientBookingStatusResponse>("/api/v1/orchestration/check-patient-status", data);
  },
  confirmBooking: (data: PublicBookingRequest) => {
    return apiClient.post<BookingConfirmation>("/api/v1/orchestration/confirm-booking", data);
  }
};

export function useCheckPatientStatus() {
  return useMutation({
    mutationFn: orchestrationService.checkPatientStatus,
  });
}

export function useConfirmBooking() {
  return useMutation({
    mutationFn: orchestrationService.confirmBooking,
  });
}

export interface RebookingSummaryResponse {
  patient_name: string;
  service_name: string;
  price: number;
  catalog_item_id: string;
  patient_id: string;
  date: string;
  slot_time: string;
}

export function useRebookingSummary(eligibilityId: string) {
  return useQuery({
    queryKey: ["rebooking-summary", eligibilityId],
    queryFn: () => apiClient.get<RebookingSummaryResponse>(`/api/v1/orchestration/bookings/rebook/${eligibilityId}/summary`),
    enabled: !!eligibilityId,
    retry: false
  });
}

export function useRebookAppointment() {
  return useMutation({
    mutationFn: (data: { eligibilityId: string; date: string; start_time: string }) => {
      return apiClient.post<BookingConfirmation>(`/api/v1/orchestration/bookings/rebook/${data.eligibilityId}`, {
        date: data.date,
        start_time: data.start_time
      });
    }
  });
}

