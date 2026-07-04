"""Orchestration — Request/Response Schemas"""

import uuid
from pydantic import BaseModel
from typing import Optional

from app.patient.schemas import PatientCreate
from app.billing.schemas import AdvancePaymentRequest, PaymentResponse
from app.patient.schemas import PatientResponse

class PublicBookingRequest(BaseModel):
    catalog_item_id: uuid.UUID
    date: str
    start_time: str
    patient_data: PatientCreate
    # Payment info
    advance_amount: int
    transaction_reference: str

class BookingContext(BaseModel):
    catalog_item_id: uuid.UUID
    catalog_item_name: str
    total_amount: int
    date: str
    start_time: str
    patient: PatientResponse
    payment: PaymentResponse
    is_valid: bool

class BookingConfirmation(BaseModel):
    appointment_id: uuid.UUID
    receipt_number: str
    patient_name: str
    catalog_item_name: str
    date: str
    start_time: str
    status: str

class PatientBookingStatusRequest(BaseModel):
    mobile_number: str

class PatientBookingStatusResponse(BaseModel):
    has_active_booking: bool
    patient: Optional[PatientResponse] = None
    active_booking: Optional[BookingConfirmation] = None

class RebookRequest(BaseModel):
    date: str
    start_time: str

