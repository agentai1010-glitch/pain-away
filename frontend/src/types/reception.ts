export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface DashboardStatsResponse {
  message: string;
}

export interface QueueItemResponse {
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  service_name: string;
  slot_time: string;
  status: string;
}

export interface ScheduleResponse {
  date: string;
  appointments: QueueItemResponse[];
}

export interface PatientAppointmentHistoryItem {
  appointment_id: string;
  date: string;
  slot_time: string;
  service_name: string;
  status: string;
  receipt_document_id: string | null;
  final_bill_document_id: string | null;
}

export interface PatientWorkspaceResponse {
  patient_id: string;
  patient_name: string;
  mobile_number: string;
  basic_address: string;
  active_appointment: PatientAppointmentHistoryItem | null;
  appointment_history: PatientAppointmentHistoryItem[];
}

export interface PatientSearchResponse {
  patient_id: string;
  patient_name: string;
  mobile_number: string;
  latest_appointment_status: string | null;
}

export interface ReceptionBookingRequest {
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
  payment_method: string;
}

export interface FinancialSummaryResponse {
  catalog_item_name: string;
  total_amount: number;
  advance_paid: number;
  remaining_amount: number;
  payment_status: string;
}

export interface CheckoutRequest {
  appointment_id: string;
  payment_method: string;
}

export interface FinalBillResponse {
  id: string;
  bill_number: string;
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  catalog_item_id: string;
  catalog_item_name: string;
  total_amount: number;
  advance_paid: number;
  balance_paid: number;
}

export interface CheckoutResponse {
  final_bill: FinalBillResponse;
  status: string;
}

export interface AppointmentSearchItem {
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  mobile_number: string;
  date: string;
  slot_time: string;
  service_name: string;
  status: string;
}

