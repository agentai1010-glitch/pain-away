"""Reception — Request/Response Schemas"""

from pydantic import BaseModel
from typing import Optional
from app.orchestration.schemas import PublicBookingRequest

class AppointmentSearchItem(BaseModel):
    appointment_id: str
    patient_id: str
    patient_name: str
    mobile_number: str
    date: str
    slot_time: str
    service_name: str
    status: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class DashboardStatsResponse(BaseModel):
    message: str

class QueueItemResponse(BaseModel):
    appointment_id: str
    patient_id: str
    patient_name: str
    service_name: str
    slot_time: str
    status: str

class ScheduleResponse(BaseModel):
    date: str
    appointments: list[QueueItemResponse]

class PatientSearchResponse(BaseModel):
    patient_id: str
    patient_name: str
    mobile_number: str
    latest_appointment_status: str | None = None

class PatientAppointmentHistoryItem(BaseModel):
    appointment_id: str
    date: str
    slot_time: str
    service_name: str
    status: str
    receipt_document_id: str | None = None
    final_bill_document_id: str | None = None
    eligibility_id: str | None = None

class PatientWorkspaceResponse(BaseModel):
    patient_id: str
    patient_name: str
    mobile_number: str
    basic_address: str
    active_appointment: PatientAppointmentHistoryItem | None
    appointment_history: list[PatientAppointmentHistoryItem]

class ReceptionBookingRequest(PublicBookingRequest):
    payment_method: str = "Cash"
    # Overriding to allow 0 advance amount
    advance_amount: int = 0
