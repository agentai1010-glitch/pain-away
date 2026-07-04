"""Billing — Request/Response Schemas"""

import uuid
from pydantic import BaseModel
from app.billing.models import PaymentStatus, PaymentType


class AdvancePaymentRequest(BaseModel):
    patient_id: uuid.UUID
    patient_name: str
    catalog_item_id: uuid.UUID
    catalog_item_name: str
    total_amount: int
    advance_amount: int
    transaction_reference: str
    # public bookings require advance payment
    is_public_booking: bool = True


class BookingReceiptResponse(BaseModel):
    id: uuid.UUID
    receipt_number: str
    patient_id: uuid.UUID
    patient_name: str
    catalog_item_id: uuid.UUID
    catalog_item_name: str
    total_amount: int
    advance_paid: int
    remaining_amount: int
    
    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: uuid.UUID
    amount: int
    payment_type: PaymentType
    status: PaymentStatus
    transaction_reference: str | None
    receipt: BookingReceiptResponse | None = None

    class Config:
        from_attributes = True

class CheckoutRequest(BaseModel):
    appointment_id: uuid.UUID
    payment_method: str

class FinalBillResponse(BaseModel):
    id: uuid.UUID
    bill_number: str
    appointment_id: uuid.UUID
    patient_id: uuid.UUID
    patient_name: str
    catalog_item_id: uuid.UUID
    catalog_item_name: str
    total_amount: int
    advance_paid: int
    balance_paid: int
    
    class Config:
        from_attributes = True

class FinancialSummaryResponse(BaseModel):
    catalog_item_name: str
    total_amount: int
    advance_paid: int
    remaining_amount: int
    payment_status: str

class CheckoutResponse(BaseModel):
    final_bill: FinalBillResponse
    status: str
