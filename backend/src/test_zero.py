import asyncio
from app.db.session import async_session_factory
from app.reception.service import ReceptionService
from app.reception.schemas import ReceptionBookingRequest
from app.orchestration.schemas import PublicBookingRequest
import uuid

async def main():
    async with async_session_factory() as session:
        service = ReceptionService(session)
        req = ReceptionBookingRequest(
            catalog_item_id="c2332245-f336-4113-bac4-c99213879428",
            date="2026-07-06",
            start_time="16:00",
            patient_data={
                "first_name": "Zero",
                "last_name": "Advance",
                "mobile_number": "1111111111",
                "basic_address": "Pune"
            },
            advance_amount=0,
            transaction_reference="TXN123",
            payment_method="Cash"
        )
        conf = await service.book_appointment(req)
        await session.commit()
        print("Booked!", conf.receipt_number)
        patient_id = conf.patient_id
        
    async with async_session_factory() as session2:
        service2 = ReceptionService(session2)
        workspace = await service2.get_patient_workspace(uuid.UUID(patient_id))
        active = workspace.active_appointment
        print("Active Apt:")
        print(active.model_dump() if active else "None")

if __name__ == '__main__':
    asyncio.run(main())
