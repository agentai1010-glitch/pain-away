"""Patient — Business Logic"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.patient.repository import PatientRepository
from app.patient.schemas import PatientCreate, PatientResponse
from app.patient.models import PatientModel
from app.patient.domain import normalize_mobile_number


class PatientService:
    def __init__(self, session: AsyncSession):
        self.repository = PatientRepository(session)

    async def lookup_patient(self, mobile_number: str) -> PatientResponse | None:
        """Lookup a patient by mobile number. Returns None if not found."""
        normalized = normalize_mobile_number(mobile_number)
        patient = await self.repository.get_by_mobile_number(normalized)
        if not patient:
            return None
        return PatientResponse.model_validate(patient)

    async def register_patient(self, data: PatientCreate) -> PatientResponse:
        """Register a new patient. Prevents duplicates."""
        normalized_mobile = normalize_mobile_number(data.mobile_number)
        
        existing = await self.repository.get_by_mobile_number(normalized_mobile)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Patient with this mobile number already exists."
            )
            
        new_patient = PatientModel(
            id=uuid.uuid4(),
            first_name=data.first_name,
            last_name=data.last_name,
            mobile_number=normalized_mobile,
            basic_address=data.basic_address,
            gender=getattr(data, "gender", "Male") or "Male"
        )
        
        await self.repository.create_patient(new_patient)
        return PatientResponse.model_validate(new_patient)

    async def get_patient_by_id(self, patient_id) -> PatientResponse | None:
        patient = await self.repository.get_by_id(patient_id)
        if not patient:
            return None
        return PatientResponse.model_validate(patient)

    async def search_patients(self, query: str) -> list[PatientResponse]:
        """Search patients by mobile or name."""
        if not query or len(query.strip()) < 3:
            return []
        
        patients = await self.repository.search_patients(query.strip())
        return [PatientResponse.model_validate(p) for p in patients]
