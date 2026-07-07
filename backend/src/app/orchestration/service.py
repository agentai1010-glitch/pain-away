"""Orchestration — Business Logic"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.orchestration.schemas import PublicBookingRequest, BookingContext, BookingConfirmation, PatientBookingStatusResponse
from app.catalog.service import CatalogService
from app.scheduling.service import SchedulingService
from app.patient.service import PatientService
from app.billing.service import BillingService
from app.billing.schemas import AdvancePaymentRequest


class PublicBookingOrchestrator:
    def __init__(self, session: AsyncSession):
        self.session = session
        
        # Instantiate module services (no direct DB access in orchestrator)
        self.catalog_service = CatalogService(session)
        self.scheduling_service = SchedulingService(session)
        self.patient_service = PatientService(session)
        self.billing_service = BillingService(session)

    async def prepare_booking_context(self, request: PublicBookingRequest, is_reception: bool = False) -> BookingContext:
        """Coordinate the complete public booking workflow up to context validation."""
        
        # 1. Validate selected catalog item
        catalog_item = await self.catalog_service.get_catalog_item(request.catalog_item_id)
        if not catalog_item or not catalog_item.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or inactive catalog item.")

        # 2. Validate requested slot availability
        available_slots = await self.scheduling_service.get_available_slots()
        
        target_date_slots = next((d for d in available_slots if str(d.date) == request.date), None)
        if not target_date_slots:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date not available for booking.")
            
        slot_obj = next((s for s in target_date_slots.slots if s.start_time.strftime("%H:%M") == request.start_time), None)
        if not slot_obj or not slot_obj.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time slot is not available.")
            
        patient_gender = getattr(request.patient_data, "gender", "Male") or "Male"
        if patient_gender == "Male" and getattr(slot_obj, "male_capacity", 3) <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No Male capacity available for this time slot.")
        elif patient_gender == "Female" and getattr(slot_obj, "female_capacity", 3) <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No Female capacity available for this time slot.")
        
        import datetime
        from app.shared.constants import IST
        target_dt = datetime.datetime.strptime(request.date, "%Y-%m-%d")
        
        if not is_reception:
            if target_dt.weekday() == 2: # Wednesday
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Clinic is closed on Wednesday.")
                
            # Public validation: 3-day window, 9 AM cutoff
            now = datetime.datetime.now(IST)
            if (target_dt.date() - now.date()).days > 3:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book beyond 3 days.")
            if target_dt.date() == now.date() and now.hour >= 9:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book today after 9:00 AM.")
                
        else:
            if target_dt.weekday() == 2: # Wednesday
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Clinic is closed on Wednesday.")

        # 3. Resolve existing patient or register a new patient
        patient = await self.patient_service.lookup_patient(request.patient_data.mobile_number)
        if not patient:
            patient = await self.patient_service.register_patient(request.patient_data)
        else:
            # Prevent double booking if patient already has an active appointment
            active_apt = await self.scheduling_service.get_active_appointment_for_patient(patient.id)
            if active_apt:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Patient already has an active appointment.")

        # 4. Verify / Process Advance Payment Record
        payment_request = AdvancePaymentRequest(
            patient_id=patient.id,
            patient_name=f"{patient.first_name} {patient.last_name}",
            catalog_item_id=catalog_item.id,
            catalog_item_name=catalog_item.name,
            total_amount=catalog_item.price,
            advance_amount=request.advance_amount,
            transaction_reference=request.transaction_reference,
            is_public_booking=not is_reception
        )
        payment = await self.billing_service.process_advance_payment(payment_request)

        # 5. Return a validated booking context
        return BookingContext(
            catalog_item_id=catalog_item.id,
            catalog_item_name=catalog_item.name,
            total_amount=catalog_item.price,
            date=request.date,
            start_time=request.start_time,
            patient=patient,
            payment=payment,
            is_valid=True
        )

    async def confirm_booking(self, request: PublicBookingRequest, is_reception: bool = False) -> BookingConfirmation:
        """Execute the final booking process after successful advance payment."""
        import datetime
        from app.shared.constants import IST
        
        # 1-4. Same validation steps as prepare_booking_context
        # Normally you'd decompose this to reuse the logic, but for simplicity we can run prepare
        context = await self.prepare_booking_context(request, is_reception=is_reception)
        
        # 5. Create the confirmed appointment
        date_obj = datetime.datetime.strptime(context.date, "%Y-%m-%d").date()
        start_time_obj = datetime.datetime.strptime(context.start_time, "%H:%M").time()
        
        appointment = await self.scheduling_service.create_appointment(
            patient_id=context.patient.id,
            catalog_item_id=context.catalog_item_id,
            date_obj=date_obj,
            start_time_obj=start_time_obj,
            receipt_number=context.payment.receipt.receipt_number,
            patient_gender=getattr(context.patient, "gender", "Male") or "Male"
        )
        
        # 6. Mark slot as occupied (implicitly done because get_available_slots now sees this appointment)
        
        # 7. Patient history (linked by patient_id in appointment)
        
        # 8. Return confirmation
        return BookingConfirmation(
            appointment_id=appointment.id,
            receipt_number=context.payment.receipt.receipt_number,
            patient_name=f"{context.patient.first_name} {context.patient.last_name}",
            catalog_item_name=context.catalog_item_name,
            date=context.date,
            start_time=context.start_time,
            status=getattr(appointment.status, 'value', str(appointment.status))
        )

    async def check_patient_status(self, mobile_number: str) -> PatientBookingStatusResponse:
        """Check if a patient has an active booking."""
        patient = await self.patient_service.lookup_patient(mobile_number)
        if not patient:
            return PatientBookingStatusResponse(has_active_booking=False)
            
        active_apt = await self.scheduling_service.get_active_appointment_for_patient(patient.id)
        if not active_apt:
            return PatientBookingStatusResponse(has_active_booking=False, patient=patient)
            
        # We also need to fetch catalog item info for the booking confirmation response
        catalog_item = await self.catalog_service.get_catalog_item(active_apt.catalog_item_id)
        
        return PatientBookingStatusResponse(
            has_active_booking=True,
            patient=patient,
            active_booking=BookingConfirmation(
                appointment_id=active_apt.id,
                receipt_number=active_apt.receipt_number or "N/A",
                patient_name=f"{patient.first_name} {patient.last_name}",
                catalog_item_name=catalog_item.name if catalog_item else "Unknown",
                date=str(active_apt.date),
                start_time=active_apt.start_time.strftime("%H:%M"),
                status=getattr(active_apt.status, 'value', str(active_apt.status))
            )
        )

    async def get_rebooking_summary(self, eligibility_id: uuid.UUID):
        """Fetch details of original cancelled appointment for rebooking summary."""
        import uuid
        from app.scheduling.models import RebookingEligibilityModel
        from sqlalchemy import select
        
        stmt = select(RebookingEligibilityModel).where(RebookingEligibilityModel.id == eligibility_id)
        res = await self.session.execute(stmt)
        eligibility = res.scalars().first()
        if not eligibility:
            raise HTTPException(status_code=404, detail="Rebooking eligibility not found.")
            
        if eligibility.is_consumed:
            raise HTTPException(status_code=400, detail="Rebooking eligibility has already been consumed.")
            
        original_apt = await self.scheduling_service.get_appointment_by_id(eligibility.appointment_id)
        if not original_apt:
            raise HTTPException(status_code=404, detail="Original appointment not found.")
            
        catalog_item = await self.catalog_service.get_catalog_item(original_apt.catalog_item_id)
        patient = await self.patient_service.get_patient_by_id(original_apt.patient_id)
        
        return {
            "patient_name": f"{patient.first_name} {patient.last_name}" if patient else "Unknown",
            "service_name": catalog_item.name if catalog_item else "Unknown",
            "price": catalog_item.price if catalog_item else 0,
            "catalog_item_id": str(catalog_item.id) if catalog_item else "",
            "patient_id": str(patient.id) if patient else "",
            "date": str(original_apt.date),
            "slot_time": original_apt.start_time.strftime("%H:%M")
        }

    async def rebook_appointment(self, eligibility_id: uuid.UUID, date_str: str, start_time_str: str) -> BookingConfirmation:
        """Process patient rebooking request reusing the shared booking engines and rules."""
        import uuid
        from app.scheduling.models import RebookingEligibilityModel
        from app.scheduling.domain import AppointmentStatus
        from sqlalchemy import select
        from app.billing.domain import generate_receipt_number
        import datetime
        from app.shared.constants import IST
        
        # 1. Validate eligibility
        stmt = select(RebookingEligibilityModel).where(RebookingEligibilityModel.id == eligibility_id)
        res = await self.session.execute(stmt)
        eligibility = res.scalars().first()
        if not eligibility:
            raise HTTPException(status_code=404, detail="Rebooking eligibility not found.")
            
        if eligibility.is_consumed:
            raise HTTPException(status_code=400, detail="Rebooking eligibility has already been consumed.")
            
        original_apt = await self.scheduling_service.get_appointment_by_id(eligibility.appointment_id)
        if not original_apt:
            raise HTTPException(status_code=404, detail="Original appointment not found.")
            
        if original_apt.status != AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=400, detail="Only cancelled appointments can be rebooked.")
            
        # 2. Validate slot availability (reuse standard rules)
        available_slots = await self.scheduling_service.get_available_slots()
        target_date_slots = next((d for d in available_slots if str(d.date) == date_str), None)
        if not target_date_slots:
            raise HTTPException(status_code=400, detail="Date not available for booking.")
            
        slot_obj = next((s for s in target_date_slots.slots if s.start_time.strftime("%H:%M") == start_time_str), None)
        if not slot_obj or not slot_obj.is_available:
            raise HTTPException(status_code=400, detail="Time slot is not available.")
            
        patient_gender = getattr(original_apt, "patient_gender", "Male") or "Male"
        if patient_gender == "Male" and getattr(slot_obj, "male_capacity", 3) <= 0:
            raise HTTPException(status_code=400, detail="No Male capacity available for this time slot.")
        elif patient_gender == "Female" and getattr(slot_obj, "female_capacity", 3) <= 0:
            raise HTTPException(status_code=400, detail="No Female capacity available for this time slot.")
        
        target_dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        if target_dt.weekday() == 2: # Wednesday
            raise HTTPException(status_code=400, detail="Clinic is closed on Wednesday.")
            
        now = datetime.datetime.now(IST)
        if (target_dt.date() - now.date()).days > 3:
            raise HTTPException(status_code=400, detail="Cannot book beyond 3 days.")
        if target_dt.date() == now.date() and now.hour >= 9:
            raise HTTPException(status_code=400, detail="Cannot book today after 9:00 AM.")
            
        # Validate patient has no active booking (double booking rule)
        active_apt = await self.scheduling_service.get_active_appointment_for_patient(original_apt.patient_id)
        if active_apt:
            raise HTTPException(status_code=409, detail="Patient already has an active appointment.")

        # 3. Transfer advance payment
        new_receipt_number = generate_receipt_number()
        new_receipt = await self.billing_service.transfer_advance_payment(
            original_receipt_number=original_apt.receipt_number,
            new_receipt_number=new_receipt_number,
            new_patient_id=original_apt.patient_id
        )

        # 4. Create new appointment with lineage
        parsed_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        parsed_time = datetime.datetime.strptime(start_time_str, "%H:%M").time()
        
        new_apt = await self.scheduling_service.create_rebooked_appointment(
            original_appointment_id=original_apt.id,
            date_obj=parsed_date,
            start_time_obj=parsed_time,
            new_receipt_number=new_receipt_number
        )

        # 5. Consume eligibility
        eligibility.is_consumed = True
        
        await self.session.commit()

        # 6. Build response
        catalog_item = await self.catalog_service.get_catalog_item(new_apt.catalog_item_id)
        patient = await self.patient_service.get_patient_by_id(new_apt.patient_id)
        
        return BookingConfirmation(
            appointment_id=new_apt.id,
            receipt_number=new_receipt_number,
            patient_name=f"{patient.first_name} {patient.last_name}" if patient else "Unknown",
            catalog_item_name=catalog_item.name if catalog_item else "Unknown",
            date=date_str,
            start_time=start_time_str,
            status=getattr(new_apt.status, 'value', str(new_apt.status))
        )

