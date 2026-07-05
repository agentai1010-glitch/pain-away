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

class PatientOrderItemResponse(BaseModel):
    id: str
    product_name: str
    product_image: Optional[str] = None
    ordered_quantity: int
    selling_price: float
    line_total: float

class PatientOrderResponse(BaseModel):
    id: str
    order_number: str
    order_date: str
    status: str
    grand_total: float
    items: List[PatientOrderItemResponse]

class PatientDocumentResponse(BaseModel):
    id: str
    document_type: str
    document_number: str
    generated_date: str
    generated_time: str
    document_path: str
    appointment_id: Optional[str] = None
    service_name: Optional[str] = None
    total_amount: Optional[int] = None
    advance_paid: Optional[int] = None
    remaining_amount: Optional[int] = None
    balance_paid: Optional[int] = None
