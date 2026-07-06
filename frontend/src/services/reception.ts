import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api-client";
import { LoginRequest, TokenResponse, DashboardStatsResponse, ScheduleResponse, PatientSearchResponse, PatientWorkspaceResponse, ReceptionBookingRequest, FinancialSummaryResponse, CheckoutRequest, CheckoutResponse, AppointmentSearchItem } from '@/types/reception';
import { BookingConfirmation } from '@/types/orchestration';

export function useReceptionLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<TokenResponse>('/api/v1/reception/login', data);
      return response; // apiClient unwrap depending on how it's implemented. Let me check the type of apiClient
    },
  });
}

export function useReceptionDashboard() {
  return useQuery({
    queryKey: ['reception-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStatsResponse>('/api/v1/reception/dashboard');
      return response;
    },
    retry: false,
  });
}

export function useSchedule(dateStr?: string) {
  return useQuery({
    queryKey: ['reception-schedule', dateStr],
    queryFn: async () => {
      const qs = dateStr ? `?date=${dateStr}` : '';
      const response = await apiClient.get<ScheduleResponse>(`/api/v1/reception/schedule${qs}`);
      return response;
    },
    refetchInterval: 30000,
  });
}

export function usePatientWorkspace(patientId: string) {
  return useQuery({
    queryKey: ['reception-patient-workspace', patientId],
    queryFn: async () => {
      const response = await apiClient.get<PatientWorkspaceResponse>(`/api/v1/reception/patient/${patientId}`);
      return response;
    },
    enabled: !!patientId,
    retry: false,
  });
}

export function useReceptionBooking() {
  return useMutation({
    mutationFn: async (data: ReceptionBookingRequest) => {
      const response = await apiClient.post<BookingConfirmation>('/api/v1/reception/book', data);
      return response;
    }
  });
}

export function useCheckoutSummary(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["checkoutSummary", appointmentId],
    queryFn: async () => {
      const response = await apiClient.get<FinancialSummaryResponse>(`/api/v1/reception/checkout/${appointmentId}/summary`);
      return response;
    },
    enabled: !!appointmentId,
  });
}

export function useProcessCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CheckoutRequest) => {
      const response = await apiClient.post<CheckoutResponse>("/api/v1/reception/checkout", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reception-patient-workspace'] });
      queryClient.invalidateQueries({ queryKey: ['reception-patient-search'] });
      queryClient.invalidateQueries({ queryKey: ['reception-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['reception-appointments-search'] });
    }
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await apiClient.post<{ status: string; appointment_id: string; eligibility_id: string | null }>(`/api/v1/reception/appointments/${appointmentId}/cancel`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reception-patient-workspace'] });
      queryClient.invalidateQueries({ queryKey: ['reception-patient-search'] });
      queryClient.invalidateQueries({ queryKey: ['reception-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['reception-appointments-search'] });
    }
  });
}


export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: ['reception-patient-search', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      const response = await apiClient.get<PatientSearchResponse[]>(`/api/v1/reception/patients/search?q=${encodeURIComponent(query)}`);
      return response;
    },
    enabled: query.length >= 3,
    retry: false,
  });
}

export function useSearchAppointments(query: string, date: string) {
  return useQuery({
    queryKey: ['reception-appointments-search', query, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query && query.length >= 3) params.append('q', query);
      if (date) params.append('date', date);
      
      const response = await apiClient.get<AppointmentSearchItem[]>(`/api/v1/reception/appointments/search?${params.toString()}`);
      return response;
    },
    retry: false,
  });
}
