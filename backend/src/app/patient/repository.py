"""Patient — Data Access"""

from typing import Optional, Sequence
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.patient.models import PatientModel


class PatientRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_mobile_number(self, mobile_number: str) -> Optional[PatientModel]:
        """Lookup a patient by their unique mobile number."""
        stmt = select(PatientModel).where(PatientModel.mobile_number == mobile_number)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_patient(self, patient: PatientModel) -> PatientModel:
        """Persist a new patient."""
        self.session.add(patient)
        await self.session.flush()
        return patient

    async def get_by_id(self, patient_id) -> Optional[PatientModel]:
        stmt = select(PatientModel).where(PatientModel.id == patient_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def search_patients(self, query: str) -> Sequence[PatientModel]:
        """Search patients by mobile number or name."""
        stmt = select(PatientModel).where(
            or_(
                PatientModel.mobile_number == query,
                PatientModel.first_name.ilike(f"%{query}%"),
                PatientModel.last_name.ilike(f"%{query}%")
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
