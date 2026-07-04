"""Patient — API Routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.patient.schemas import PatientCreate, PatientResponse
from app.patient.service import PatientService
from app.shared.dependencies import get_db

router = APIRouter(prefix="/patient", tags=["Patient"])


@router.get("/lookup/{mobile_number}", response_model=PatientResponse)
async def lookup_patient(
    mobile_number: str,
    db: AsyncSession = Depends(get_db),
) -> PatientResponse:
    """Lookup a patient by mobile number. Returns 404 if not found."""
    service = PatientService(db)
    patient = await service.lookup_patient(mobile_number)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found."
        )
    return patient


@router.post("/register", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(
    data: PatientCreate,
    db: AsyncSession = Depends(get_db),
) -> PatientResponse:
    """Register a new patient."""
    service = PatientService(db)
    # The service layer handles duplicate checks and raises 409 Conflict if needed
    return await service.register_patient(data)
