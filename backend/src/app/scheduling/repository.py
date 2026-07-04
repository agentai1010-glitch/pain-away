"""Scheduling — Data Access"""

import datetime
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.scheduling.models import AppointmentModel, HolidayModel
from app.scheduling.domain import AppointmentStatus


class SchedulingRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_booked_appointments_for_dates(
        self, dates: list[datetime.date]
    ) -> Sequence[AppointmentModel]:
        """Fetch active appointments for a set of dates to check slot availability."""
        if not dates:
            return []
            
        stmt = select(AppointmentModel).where(
            AppointmentModel.date.in_(dates),
            AppointmentModel.status == AppointmentStatus.BOOKED
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_appointments_by_date(self, target_date: datetime.date) -> Sequence[AppointmentModel]:
        """Fetch all booked appointments for a specific date (for reception queue)."""
        stmt = select(AppointmentModel).where(
            AppointmentModel.date == target_date,
            AppointmentModel.status == "BOOKED"
        ).order_by(AppointmentModel.start_time)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create_appointment(self, appointment: AppointmentModel) -> AppointmentModel:
        """Persist a new appointment."""
        self.session.add(appointment)
        await self.session.flush()
        return appointment

    async def get_active_appointment_for_patient(self, patient_id) -> AppointmentModel | None:
        """Fetch active confirmed appointment for a patient."""
        stmt = select(AppointmentModel).where(
            AppointmentModel.patient_id == patient_id,
            AppointmentModel.status == "BOOKED"
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_latest_appointment_for_patient(self, patient_id) -> AppointmentModel | None:
        """Fetch the most recent appointment for a patient regardless of status."""
        stmt = select(AppointmentModel).where(
            AppointmentModel.patient_id == patient_id
        ).order_by(AppointmentModel.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_appointment_by_id(self, appointment_id) -> AppointmentModel | None:
        """Fetch appointment by ID."""
        stmt = select(AppointmentModel).where(
            AppointmentModel.id == appointment_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all_appointments_for_patient(self, patient_id) -> Sequence[AppointmentModel]:
        """Fetch all appointments for a patient (history)."""
        stmt = select(AppointmentModel).where(
            AppointmentModel.patient_id == patient_id
        ).order_by(AppointmentModel.date.desc(), AppointmentModel.start_time.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    # --- Holiday Methods ---

    async def get_active_holidays(self) -> Sequence[HolidayModel]:
        """Fetch all active holidays."""
        stmt = select(HolidayModel).where(HolidayModel.is_active.is_(True))
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_all_holidays(self) -> Sequence[HolidayModel]:
        """Fetch all holidays for Director view."""
        stmt = select(HolidayModel).order_by(HolidayModel.date.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_holiday_by_date(self, target_date: datetime.date) -> HolidayModel | None:
        """Fetch holiday by date to check for duplicates."""
        stmt = select(HolidayModel).where(HolidayModel.date == target_date)
        result = await self.session.execute(stmt)
        return result.scalars().first()
        
    async def get_holiday_by_id(self, holiday_id) -> HolidayModel | None:
        """Fetch holiday by ID."""
        stmt = select(HolidayModel).where(HolidayModel.id == holiday_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_holiday(self, holiday: HolidayModel) -> HolidayModel:
        """Persist a new holiday."""
        self.session.add(holiday)
        await self.session.flush()
        return holiday

