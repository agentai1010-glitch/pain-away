export interface BookingConfirmation {
  appointment_id: string;
  receipt_number: string;
  patient_name: string;
  catalog_item_name: string;
  date: string;
  start_time: string;
  status: string;
}

export interface PatientResponse {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  basic_address: string;
  gender?: string;
}

export interface PatientBookingStatusResponse {
  has_active_booking: boolean;
  patient?: PatientResponse;
  active_booking?: BookingConfirmation;
}
