from pydantic import BaseModel
from typing import List, Optional

class TimelineActivity(BaseModel):
    title: str
    description: str
    timestamp: str
    activity_type: str

class PatientDashboardResponse(BaseModel):
    patient_name: str
    mobile_number: str
    
    total_appointments: int
    total_orders: int
    available_receipts: int
    available_bills: int
    
    upcoming_appointment_date: Optional[str] = None
    upcoming_appointment_time: Optional[str] = None
    
    recent_activity: List[TimelineActivity]

class PatientAppointmentResponse(BaseModel):
    id: str
    service_name: str
    date: str
    time: str
    status: str
    booking_date: str
    advance_paid: int
    remaining_amount: Optional[int] = None
    receipt_number: Optional[str] = None
    final_bill_number: Optional[str] = None
