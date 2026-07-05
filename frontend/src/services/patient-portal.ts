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

export interface PatientOrderItemResponse {
  id: string;
  product_name: string;
  product_image: string | null;
  ordered_quantity: number;
  selling_price: number;
  line_total: number;
}

export interface PatientOrderResponse {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  grand_total: number;
  items: PatientOrderItemResponse[];
}

export interface PatientDocumentResponse {
  id: string;
  document_type: string;
  document_number: string;
  generated_date: string;
  generated_time: string;
  document_path: string;
  appointment_id: string | null;
  service_name: string | null;
  total_amount: number | null;
  advance_paid: number | null;
  remaining_amount: number | null;
  balance_paid: number | null;
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

export function usePatientOrders() {
  return useQuery({
    queryKey: ["patient-orders"],
    queryFn: () => apiClient.get<PatientOrderResponse[]>("/api/v1/patient-portal/orders"),
  });
}

export function usePatientDocuments() {
  return useQuery({
    queryKey: ["patient-documents"],
    queryFn: () => apiClient.get<PatientDocumentResponse[]>("/api/v1/patient-portal/documents"),
  });
}
