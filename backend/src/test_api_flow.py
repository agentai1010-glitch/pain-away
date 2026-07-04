import asyncio
from app.db.session import async_session_factory
from app.reception.service import ReceptionService
from app.reception.schemas import ReceptionBookingRequest
from app.orchestration.schemas import PublicBookingRequest
import uuid

async def main():
    async with async_session_factory() as session:
        service = ReceptionService(session)
        # Create a booking for Pravin Tarde
        req = ReceptionBookingRequest(
            catalog_item_id="c2332245-f336-4113-bac4-c99213879428",
            date="2026-07-06",
            start_time="16:00",
            patient_data={
                "first_name": "Pravin",
                "last_name": "Tarde",
                "mobile_number": "3333333333",
                "basic_address": "Pune"
            },
            advance_amount=500,
            transaction_reference="TEST1234",
            payment_method="Cash"
        )
        
        conf = await service.book_appointment(req)
        await session.commit()
        print("Booked!", conf.receipt_number)
        
    async with async_session_factory() as session2:
        service2 = ReceptionService(session2)
        workspace = await service2.get_patient_workspace(uuid.UUID("7b6964cb-2362-4794-9f79-bb701b5bda75"))
        active = workspace.active_appointment
        print("Active Apt:")
        print(active.model_dump() if active else "None")

if __name__ == '__main__':
    asyncio.run(main())
