"""Scheduling — Business Logic"""

import datetime
from collections.abc import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from app.scheduling.repository import SchedulingRepository
from app.scheduling.repository import SchedulingRepository
from app.scheduling.domain import get_available_booking_dates, get_all_slots_for_date, AppointmentStatus
from app.scheduling.schemas import DateAvailabilityResponse, SlotResponse, HolidayCreate, HolidayValidationPreview
from app.scheduling.models import AppointmentModel, HolidayModel
from app.shared.constants import IST, SAME_DAY_BOOKING_CUTOFF_HOUR, CLINIC_CLOSED_WEEKDAY


class SchedulingService:
    def __init__(self, session: AsyncSession):
        self.repository = SchedulingRepository(session)

    async def get_available_slots(self) -> list[DateAvailabilityResponse]:
        """Discover available slots for the public booking window."""
        now = datetime.datetime.now(IST)
        
        # 0. Fetch configured active holidays
        active_holidays = await self.repository.get_active_holidays()
        holiday_dates = [h.date for h in active_holidays]
        
        # 1. Determine valid dates (excluding Wednesdays and Holidays)
        valid_dates = get_available_booking_dates(now, holidays=holiday_dates)
        if not valid_dates:
            return []
            
        # 2. Fetch existing bookings
        appointments = await self.repository.get_booked_appointments_for_dates(valid_dates)
        
        # Group bookings by date for easy lookup
        booked_slots_by_date: dict[datetime.date, set[datetime.time]] = {d: set() for d in valid_dates}
        for apt in appointments:
            booked_slots_by_date[apt.date].add(apt.start_time)
            
        # 3. Generate slot availability
        all_slots = get_all_slots_for_date()
        result = []
        
        # Enforce same-day booking cutoff
        cutoff_reached = now.hour >= SAME_DAY_BOOKING_CUTOFF_HOUR
        
        for d in valid_dates:
            slots_response = []
            is_today = (d == now.date())
            
            for start, end in all_slots:
                # Slot is available if it's not booked AND (it's not today OR cutoff not reached)
                is_available = start not in booked_slots_by_date[d]
                
                if is_today and cutoff_reached:
                    is_available = False
                    
                slots_response.append(
                    SlotResponse(
                        start_time=start,
                        end_time=end,
                        is_available=is_available
                    )
                )
            
            result.append(DateAvailabilityResponse(date=d, slots=slots_response))
            
        return result

    async def create_appointment(
        self, 
        patient_id, 
        catalog_item_id, 
        date_obj, 
        start_time_obj, 
        receipt_number
    ) -> AppointmentModel:
        import uuid
        
        # end_time is derived from start_time (assuming 1 hour for now based on domain rules)
        # Actually in domain `get_all_slots_for_date` returns (start, end)
        all_slots = get_all_slots_for_date()
        end_time_obj = next((end for start, end in all_slots if start == start_time_obj), None)
        
        apt = AppointmentModel(
            id=uuid.uuid4(),
            patient_id=patient_id,
            catalog_item_id=catalog_item_id,
            date=date_obj,
            start_time=start_time_obj,
            end_time=end_time_obj,
            receipt_number=receipt_number,
            status=AppointmentStatus.BOOKED
        )
        return await self.repository.create_appointment(apt)

    async def get_active_appointment_for_patient(self, patient_id) -> AppointmentModel | None:
        return await self.repository.get_active_appointment_for_patient(patient_id)

    async def get_appointments_by_date(self, target_date: datetime.date) -> list[AppointmentModel]:
        return await self.repository.get_appointments_by_date(target_date)

    async def get_latest_appointment_for_patient(self, patient_id) -> AppointmentModel | None:
        return await self.repository.get_latest_appointment_for_patient(patient_id)

    async def get_appointment_by_id(self, appointment_id) -> AppointmentModel | None:
        return await self.repository.get_appointment_by_id(appointment_id)

    async def get_all_appointments_for_patient(self, patient_id) -> list[AppointmentModel]:
        return await self.repository.get_all_appointments_for_patient(patient_id)

    async def cancel_appointment(self, appointment_id) -> AppointmentModel:
        """Cancel a confirmed appointment, release slot, and create rebooking eligibility."""
        import uuid
        from fastapi import HTTPException, status
        from app.scheduling.models import RebookingEligibilityModel
        
        apt = await self.repository.get_appointment_by_id(appointment_id)
        if not apt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
            
        if apt.status == AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Appointment is already cancelled.")
            
        if apt.status == AppointmentStatus.COMPLETED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Completed appointments cannot be cancelled.")
            
        if apt.status != AppointmentStatus.BOOKED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only confirmed appointments can be cancelled.")
            
        # Update status
        apt.status = AppointmentStatus.CANCELLED
        
        # Create Rebooking Eligibility exactly once (since we validate appointment is BOOKED first, this runs once)
        eligibility = RebookingEligibilityModel(
            id=uuid.uuid4(),
            patient_id=apt.patient_id,
            appointment_id=apt.id,
            is_consumed=False
        )
        
        self.repository.session.add(eligibility)
        await self.repository.session.flush()
        
        return apt

    async def create_rebooked_appointment(
        self,
        original_appointment_id,
        date_obj,
        start_time_obj,
        new_receipt_number: str
    ) -> AppointmentModel:
        """Create a new appointment and set up self-referential lineage fields (rebooked_from / rebooked_to)."""
        original_apt = await self.repository.get_appointment_by_id(original_appointment_id)
        if not original_apt:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Original appointment not found.")

        # Create new appointment
        new_apt = await self.create_appointment(
            patient_id=original_apt.patient_id,
            catalog_item_id=original_apt.catalog_item_id,
            date_obj=date_obj,
            start_time_obj=start_time_obj,
            receipt_number=new_receipt_number
        )

        # Establish lineage
        new_apt.rebooked_from_id = original_apt.id
        original_apt.rebooked_to_id = new_apt.id

        await self.repository.session.flush()
        return new_apt

    # --- Holiday Methods ---

    async def get_all_holidays(self) -> Sequence[HolidayModel]:
        return await self.repository.get_all_holidays()

    async def validate_holiday(self, target_date: datetime.date) -> HolidayValidationPreview:
        """Validate if a date can be set as a holiday."""
        # 1. Check if it's a Wednesday
        if target_date.weekday() == CLINIC_CLOSED_WEEKDAY:
            return HolidayValidationPreview(is_valid=False, message="Cannot configure holiday on Wednesday (already a weekly off).")
            
        # 2. Check for duplicate
        existing = await self.repository.get_holiday_by_date(target_date)
        if existing:
            return HolidayValidationPreview(is_valid=False, message="A holiday is already configured for this date.")
            
        # 3. Check public booking window
        now = datetime.datetime.now(IST)
        # get_available_booking_dates without holidays returns the pure window
        window_dates = get_available_booking_dates(now)
        if target_date in window_dates:
            return HolidayValidationPreview(is_valid=False, message="Cannot create a holiday within the currently published booking window.")
            
        return HolidayValidationPreview(is_valid=True, message=None)

    async def create_holiday(self, data: HolidayCreate) -> HolidayModel:
        from fastapi import HTTPException, status
        import uuid
        
        validation = await self.validate_holiday(data.date)
        if not validation.is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=validation.message)
            
        holiday = HolidayModel(
            id=uuid.uuid4(),
            date=data.date,
            reason=data.reason,
            is_active=True
        )
        
        await self.repository.create_holiday(holiday)
        await self.repository.session.commit()
        return holiday

    async def update_holiday_status(self, holiday_id: str, is_active: bool) -> HolidayModel:
        from fastapi import HTTPException, status
        
        holiday = await self.repository.get_holiday_by_id(holiday_id)
        if not holiday:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holiday not found.")
            
        holiday.is_active = is_active
        await self.repository.session.commit()
        return holiday



