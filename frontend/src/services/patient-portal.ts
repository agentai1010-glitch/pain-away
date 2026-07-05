import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface TimelineActivity {
  title: string;
  description: string;
  timestamp: string;
  activity_type: string;
}

export interface PatientDashboardResponse {
  patient_name: string;
  mobile_number: string;
  
  total_appointments: number;
  total_orders: number;
  available_receipts: number;
  available_bills: number;
  
  upcoming_appointment_date: string | null;
  upcoming_appointment_time: string | null;
  
  recent_activity: TimelineActivity[];
}

export interface PatientAppointmentResponse {
  id: string;
  service_name: string;
  date: string;
  time: string;
  status: string;
  booking_date: string;
  advance_paid: number;
  remaining_amount: number | null;
  receipt_number: string | null;
  final_bill_number: string | null;
}

export function usePatientDashboard() {
  return useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: () => apiClient.get<PatientDashboardResponse>("/api/v1/patient-portal/dashboard"),
  });
}

export function usePatientAppointments() {
  return useQuery({
    queryKey: ["patient-appointments"],
    queryFn: () => apiClient.get<PatientAppointmentResponse[]>("/api/v1/patient-portal/appointments"),
  });
}
