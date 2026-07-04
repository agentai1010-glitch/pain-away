export interface AdvancePaymentRequest {
  patient_id: string;
  patient_name: string;
  catalog_item_id: string;
  catalog_item_name: string;
  total_amount: number;
  advance_amount: number;
  transaction_reference: string;
  is_public_booking?: boolean;
}

export interface BookingReceiptResponse {
  id: string;
  receipt_number: string;
  patient_id: string;
  patient_name: string;
  catalog_item_id: string;
  catalog_item_name: string;
  total_amount: number;
  advance_paid: number;
  remaining_amount: number;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  payment_type: "ADVANCE" | "FULL";
  status: "PENDING" | "SUCCESS" | "FAILED";
  transaction_reference: string | null;
  receipt: BookingReceiptResponse | null;
}
