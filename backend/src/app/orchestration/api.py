"""Orchestration — API Routes"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.orchestration.schemas import PublicBookingRequest, BookingContext, BookingConfirmation, PatientBookingStatusRequest, PatientBookingStatusResponse, RebookRequest
from app.orchestration.service import PublicBookingOrchestrator
from app.shared.dependencies import get_db

router = APIRouter(prefix="/orchestration", tags=["Orchestration"])

@router.post("/validate-booking", response_model=BookingContext, status_code=status.HTTP_200_OK)
async def validate_booking(
    request: PublicBookingRequest,
    db: AsyncSession = Depends(get_db),
) -> BookingContext:
    """Validate and prepare a booking context by orchestrating across modules."""
    orchestrator = PublicBookingOrchestrator(db)
    return await orchestrator.prepare_booking_context(request)

@router.post("/confirm-booking", response_model=BookingConfirmation, status_code=status.HTTP_201_CREATED)
async def confirm_booking(
    request: PublicBookingRequest,
    db: AsyncSession = Depends(get_db),
) -> BookingConfirmation:
    """Execute final booking workflow to create the appointment."""
    orchestrator = PublicBookingOrchestrator(db)
    return await orchestrator.confirm_booking(request)

@router.post("/check-patient-status", response_model=PatientBookingStatusResponse, status_code=status.HTTP_200_OK)
async def check_patient_status(
    request: PatientBookingStatusRequest,
    db: AsyncSession = Depends(get_db),
) -> PatientBookingStatusResponse:
    """Check if the patient already has an active booking."""
    orchestrator = PublicBookingOrchestrator(db)
    return await orchestrator.check_patient_status(request.mobile_number)

@router.get("/bookings/rebook/{eligibility_id}/summary")
async def get_rebooking_summary(
    eligibility_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details of original cancelled appointment for rebooking summary."""
    import uuid
    orchestrator = PublicBookingOrchestrator(db)
    return await orchestrator.get_rebooking_summary(uuid.UUID(eligibility_id))

@router.post("/bookings/rebook/{eligibility_id}", response_model=BookingConfirmation)
async def rebook_appointment(
    eligibility_id: str,
    request: RebookRequest,
    db: AsyncSession = Depends(get_db)
):
    """Process patient rebooking request."""
    import uuid
    orchestrator = PublicBookingOrchestrator(db)
    return await orchestrator.rebook_appointment(uuid.UUID(eligibility_id), request.date, request.start_time)

