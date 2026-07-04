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
    # Setup isolated SQLite in-memory database
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
    )
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed Data
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
        
    # Scenario: Complete booking flow
    async with async_session() as session:
        orchestrator = PublicBookingOrchestrator(session)
        scheduling_service = SchedulingService(session)
        
        # Get valid date dynamically to avoid Wednesday skips
        available_dates = await scheduling_service.get_available_slots()
        valid_date_str = str(available_dates[0].date)
        valid_time_str = available_dates[0].slots[0].start_time.strftime("%H:%M")
        
        request = PublicBookingRequest(
            catalog_item_id=catalog_id,
            date=valid_date_str,
            start_time=valid_time_str,
            patient_data=PatientCreate(
                first_name="Test",
                last_name="Patient",
                mobile_number="9123456789",
                basic_address="Test Address"
            ),
            advance_amount=500,
            transaction_reference="TXN-A001A"
        )
        
        # 1. Execute booking
        confirmation = await orchestrator.confirm_booking(request)
        await session.commit()
        
        # 2. Verify Confirmation
        assert confirmation.status == "BOOKED", "Appointment status should be BOOKED"
        assert confirmation.receipt_number.startswith("REC-")
        
        # 3. Verify Slot is occupied
        new_available_dates = await scheduling_service.get_available_slots()
        target_date = next(d for d in new_available_dates if str(d.date) == valid_date_str)
        slot_booked = next(s for s in target_date.slots if s.start_time.strftime("%H:%M") == valid_time_str)
        
        assert slot_booked.is_available is False, "Slot should be marked as unavailable"

if __name__ == "__main__":
    asyncio.run(run_test())
    print("PASS")
