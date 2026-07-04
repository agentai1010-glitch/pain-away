import asyncio
import sys
import uuid
import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import StaticPool

from app.db.base import Base
from app.catalog.models import CatalogItemModel
from app.orchestration.service import PublicBookingOrchestrator
from app.orchestration.schemas import PublicBookingRequest
from app.patient.schemas import PatientCreate
from app.scheduling.service import SchedulingService

from app.shared.constants import IST

async def run_test():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", poolclass=StaticPool)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        catalog_id = uuid.uuid4()
        item = CatalogItemModel(
            id=catalog_id,
            name="Back Pain",
            description="Treatment for back pain",
            item_type="SERVICE",
            price=1000,
            duration_minutes=60,
            is_active=True
        )
        session.add(item)
        await session.commit()
        
    async with async_session() as session:
        orchestrator = PublicBookingOrchestrator(session)
        scheduling_service = SchedulingService(session)
        
        # Scenario 1 - New Patient
        mobile_new = "9998887776"
        status_new = await orchestrator.check_patient_status(mobile_new)
        assert status_new.has_active_booking is False
        
        available_dates = await scheduling_service.get_available_slots()
        valid_date_str = str(available_dates[0].date)
        valid_time_str = available_dates[0].slots[0].start_time.strftime("%H:%M")
        
        request = PublicBookingRequest(
            catalog_item_id=catalog_id,
            date=valid_date_str,
            start_time=valid_time_str,
            patient_data=PatientCreate(
                first_name="New",
                last_name="Patient",
                mobile_number=mobile_new,
                basic_address="Pune"
            ),
            advance_amount=500,
            transaction_reference="TXN-ECR003A"
        )
        
        confirmation = await orchestrator.confirm_booking(request)
        await session.commit()
        
        assert confirmation.status == "BOOKED"
        
        # Scenario 2 - Returning Patient (now has active booking)
        status_returning = await orchestrator.check_patient_status(mobile_new)
        assert status_returning.has_active_booking is True
        assert status_returning.active_booking.date == valid_date_str
        assert status_returning.active_booking.start_time == valid_time_str

if __name__ == "__main__":
    asyncio.run(run_test())
    print("PASS")
