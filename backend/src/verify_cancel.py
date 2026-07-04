import asyncio
from app.db.session import async_session_factory
from app.scheduling.service import SchedulingService
from app.reception.service import ReceptionService
from app.reception.schemas import ReceptionBookingRequest
from app.scheduling.domain import AppointmentStatus
from app.scheduling.models import RebookingEligibilityModel
from sqlalchemy import select
import uuid

async def main():
    async with async_session_factory() as session:
        scheduling_service = SchedulingService(session)
        slots = await scheduling_service.get_available_slots()
        
        # Find first available slot
        available_date = None
        available_time = None
        for day in slots:
            for slot in day.slots:
                if slot.is_available:
                    available_date = day.date
                    available_time = slot.start_time.strftime("%H:%M")
                    break
            if available_date:
                break
                
        if not available_date:
            print("No available slots found!")
            return
            
        print(f"Booking for date={available_date}, time={available_time}")

        service = ReceptionService(session)
        # 1. Book an appointment
        req = ReceptionBookingRequest(
            catalog_item_id="c2332245-f336-4113-bac4-c99213879428",
            date=available_date.strftime("%Y-%m-%d"),
            start_time=available_time,
            patient_data={
                "first_name": "Test",
                "last_name": "Cancel",
                "mobile_number": "5555555555",
                "basic_address": "CancelAddress"
            },
            advance_amount=500,
            transaction_reference="TXNCANCEL",
            payment_method="Cash"
        )
        conf = await service.book_appointment(req)
        await session.commit()
        
        apt_model = await scheduling_service.get_appointment_by_id(conf.appointment_id)
        patient_id = apt_model.patient_id
        print("Booked appointment:", conf.receipt_number, "patient_id:", patient_id)
        
    async with async_session_factory() as session2:
        reception_service = ReceptionService(session2)
        
        # Get patient's booked appointment
        workspace = await reception_service.get_patient_workspace(patient_id)
        active_apt = workspace.active_appointment
        print("Active appointment status before cancel:", active_apt.status)
        
        # 2. Cancel the appointment
        cancel_res = await reception_service.cancel_appointment(active_apt.appointment_id)
        print("Cancellation response:", cancel_res)
        
        # 3. Verify status after cancel in the workspace
        workspace_after = await reception_service.get_patient_workspace(patient_id)
        print("Active appointment after cancel (should be None):", workspace_after.active_appointment)
        
        # Verify it is in history with status CANCELLED
        history_item = next((item for item in workspace_after.appointment_history if item.appointment_id == active_apt.appointment_id), None)
        print("History item status:", history_item.status if history_item else "Not found")
        
        # 4. Check if rebooking eligibility was created
        stmt = select(RebookingEligibilityModel).where(RebookingEligibilityModel.appointment_id == uuid.UUID(active_apt.appointment_id))
        res = await session2.execute(stmt)
        eligibility = res.scalars().first()
        print("Rebooking eligibility created:", eligibility is not None)
        if eligibility:
            print(f"  id={eligibility.id}, patient_id={eligibility.patient_id}, appointment_id={eligibility.appointment_id}, consumed={eligibility.is_consumed}")

if __name__ == '__main__':
    asyncio.run(main())
