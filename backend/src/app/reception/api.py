"""Reception — API Routes"""

from fastapi import APIRouter, Depends, Query, Path
from app.reception.schemas import LoginRequest, TokenResponse, DashboardStatsResponse, ScheduleResponse, PatientSearchResponse, PatientWorkspaceResponse, ReceptionBookingRequest, AppointmentSearchItem
from app.orchestration.schemas import BookingConfirmation
from app.billing.schemas import FinancialSummaryResponse, CheckoutRequest, CheckoutResponse
from app.reception.service import ReceptionService
from app.reception.dependencies import get_current_reception_user
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db

router = APIRouter(prefix="/reception", tags=["Reception"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate reception user."""
    return ReceptionService.authenticate(request)

@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard(username: str = Depends(get_current_reception_user)):
    """Get reception dashboard stats (requires auth)."""
    return DashboardStatsResponse(message=f"Welcome {username} to the Reception Dashboard")

@router.get("/schedule", response_model=ScheduleResponse)
async def get_schedule(
    date: str | None = Query(None, description="Date in YYYY-MM-DD format. Defaults to today."),
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Get reception schedule for a date."""
    service = ReceptionService(db)
    return await service.get_schedule(date)

@router.get("/patients/search", response_model=list[PatientSearchResponse])
async def search_patients(
    q: str = Query(..., min_length=3),
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Search patients globally."""
    service = ReceptionService(db)
    return await service.search_patients(q)

@router.get("/appointments/search", response_model=list[AppointmentSearchItem])
async def search_appointments(
    q: str | None = Query(None, description="Search by name or number"),
    date: str | None = Query(None, description="Filter by date"),
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Search and filter all appointments."""
    service = ReceptionService(db)
    return await service.search_appointments(q, date)

@router.get("/patient/{patient_id}", response_model=PatientWorkspaceResponse)
async def get_patient_workspace(
    patient_id: str = Path(...),
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Get patient workspace."""
    service = ReceptionService(db)
    return await service.get_patient_workspace(patient_id)

@router.post("/book", response_model=BookingConfirmation)
async def book_appointment(
    request: ReceptionBookingRequest,
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Book an appointment via reception."""
    service = ReceptionService(db)
    return await service.book_appointment(request)

@router.get("/checkout/{appointment_id}/summary", response_model=FinancialSummaryResponse)
async def get_checkout_summary(
    appointment_id: str,
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Get financial summary for an appointment checkout."""
    service = ReceptionService(db)
    return await service.get_checkout_summary(appointment_id)

@router.post("/checkout", response_model=CheckoutResponse)
async def process_checkout(
    request: CheckoutRequest,
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Process reception checkout."""
    service = ReceptionService(db)
    return await service.process_checkout(request)

@router.post("/appointments/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: str = Path(...),
    username: str = Depends(get_current_reception_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an appointment."""
    service = ReceptionService(db)
    return await service.cancel_appointment(appointment_id)

