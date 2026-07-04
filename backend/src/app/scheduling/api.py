"""Scheduling — API Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.scheduling.schemas import DateAvailabilityResponse, RebookedAppointmentResponse, HolidayCreate, HolidayResponse, HolidayValidationPreview, HolidayValidateRequest
from app.scheduling.service import SchedulingService
from app.shared.dependencies import get_db

router = APIRouter(prefix="/scheduling", tags=["Scheduling"])


@router.get("/slots", response_model=list[DateAvailabilityResponse])
async def get_available_slots(
    db: AsyncSession = Depends(get_db),
) -> list[DateAvailabilityResponse]:
    """Retrieve available dates and slots for public booking."""
    service = SchedulingService(db)
    return await service.get_available_slots()

# --- Director Holiday Endpoints ---

@router.get("/director/holidays", response_model=list[HolidayResponse])
async def get_all_holidays(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all holidays configured by the Director."""
    service = SchedulingService(db)
    return await service.get_all_holidays()

@router.post("/director/holidays/validate", response_model=HolidayValidationPreview)
async def validate_holiday(
    data: HolidayValidateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate if a holiday can be created on a given date."""
    service = SchedulingService(db)
    return await service.validate_holiday(data.date)

@router.post("/director/holidays", response_model=HolidayResponse, status_code=201)
async def create_holiday(
    data: HolidayCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new clinic holiday."""
    service = SchedulingService(db)
    return await service.create_holiday(data)

@router.patch("/director/holidays/{holiday_id}", response_model=HolidayResponse)
async def update_holiday_status(
    holiday_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Activate or deactivate a holiday."""
    service = SchedulingService(db)
    return await service.update_holiday_status(holiday_id, data["is_active"])
