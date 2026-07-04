import asyncio
from app.db.session import async_session_factory
from app.scheduling.service import SchedulingService
from app.reception.service import ReceptionService
from app.reception.schemas import ReceptionBookingRequest
from app.orchestration.service import PublicBookingOrchestrator
from app.scheduling.domain import AppointmentStatus
from app.scheduling.models import RebookingEligibilityModel, AppointmentModel
from app.billing.models import BookingReceiptModel
from sqlalchemy import select
import uuid

async def main():
    async with async_session_factory() as session:
        scheduling_service = SchedulingService(session)
        reception_service = ReceptionService(session)
        orchestrator = PublicBookingOrchestrator(session)
        
        # 1. Discover available slots
        slots = await scheduling_service.get_available_slots()
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
                
        # 2. Book appointment 1
        req = ReceptionBookingRequest(
            catalog_item_id="c2332245-f336-4113-bac4-c99213879428",
            date=available_date.strftime("%Y-%m-%d"),
            start_time=available_time,
            patient_data={
                "first_name": "Rebook",
                "last_name": "Test",
                "mobile_number": "7777777777",
                "basic_address": "RebookAddress"
            },
            advance_amount=400,
            transaction_reference="TXNREBOOK1",
            payment_method="Cash"
        )
        conf = await reception_service.book_appointment(req)
        await session.commit()
        print("Booked initial appointment:", conf.receipt_number, "id:", conf.appointment_id)

    async with async_session_factory() as session2:
        reception_service = ReceptionService(session2)
        scheduling_service = SchedulingService(session2)
        orchestrator = PublicBookingOrchestrator(session2)
        
        # Get patient_id
        apt = await scheduling_service.get_appointment_by_id(conf.appointment_id)
        patient_id = apt.patient_id
        print("Patient ID:", patient_id)
        
        # 3. Cancel appointment 1 to generate eligibility
        cancel_res = await reception_service.cancel_appointment(conf.appointment_id)
        print("Cancelled appointment status updated:", cancel_res)
        
        # Find eligibility record
        stmt = select(RebookingEligibilityModel).where(RebookingEligibilityModel.appointment_id == conf.appointment_id)
        res = await session2.execute(stmt)
        eligibility = res.scalars().first()
        print("Eligibility created: ID =", eligibility.id, "consumed =", eligibility.is_consumed)

    async with async_session_factory() as session3:
        scheduling_service = SchedulingService(session3)
        orchestrator = PublicBookingOrchestrator(session3)
        
        # Find a new slot for rebooking
        slots = await scheduling_service.get_available_slots()
        new_date = None
        new_time = None
        for day in slots:
            for slot in day.slots:
                if slot.is_available:
                    new_date = day.date
                    new_time = slot.start_time.strftime("%H:%M")
                    break
            if new_date:
                break
                
        print(f"Rebooking for new date={new_date}, time={new_time}")
        
        # 4. Perform Rebooking
        rebook_conf = await orchestrator.rebook_appointment(
            eligibility_id=eligibility.id,
            date_str=new_date.strftime("%Y-%m-%d"),
            start_time_str=new_time
        )
        print("Rebooked appointment successfully!")
        print("  New appointment ID:", rebook_conf.appointment_id)
        print("  New receipt number:", rebook_conf.receipt_number)

    # 5. Verification checks
    async with async_session_factory() as session4:
        # Check lineage
        orig_apt = await session4.get(AppointmentModel, conf.appointment_id)
        new_apt = await session4.get(AppointmentModel, rebook_conf.appointment_id)
        print("=== LINEAGE VERIFICATION ===")
        print("  Original appointment status:", orig_apt.status)
        print("  Original appointment rebooked_to_id:", orig_apt.rebooked_to_id)
        print("  New appointment status:", new_apt.status)
        print("  New appointment rebooked_from_id:", new_apt.rebooked_from_id)
        
        # Check payment transfer
        orig_receipt_stmt = select(BookingReceiptModel).where(BookingReceiptModel.receipt_number == orig_apt.receipt_number)
        res1 = await session4.execute(orig_receipt_stmt)
        orig_receipt = res1.scalars().first()
        
        new_receipt_stmt = select(BookingReceiptModel).where(BookingReceiptModel.receipt_number == new_apt.receipt_number)
        res2 = await session4.execute(new_receipt_stmt)
        new_receipt = res2.scalars().first()
        
        print("=== PAYMENT VERIFICATION ===")
        print("  Original payment ID:", orig_receipt.payment_id)
        print("  New payment ID:", new_receipt.payment_id)
        print("  Payment IDs match (transferred):", orig_receipt.payment_id == new_receipt.payment_id)
        print("  New receipt advance paid:", new_receipt.advance_paid)

        # Check eligibility consumed
        elig_stmt = select(RebookingEligibilityModel).where(RebookingEligibilityModel.id == eligibility.id)
        res3 = await session4.execute(elig_stmt)
        elig_after = res3.scalars().first()
        print("=== ELIGIBILITY VERIFICATION ===")
        print("  Eligibility is_consumed:", elig_after.is_consumed)

if __name__ == '__main__':
    asyncio.run(main())
