import asyncio
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import StaticPool
from fastapi import HTTPException

from app.db.base import Base
from app.patient.models import PatientModel
from app.patient.service import PatientService
from app.patient.schemas import PatientCreate

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
        import uuid
        existing = PatientModel(
            id=uuid.uuid4(),
            first_name="Rahul",
            last_name="Patil",
            mobile_number="9876543210",
            basic_address="Dhankawadi, Pune"
        )
        session.add(existing)
        await session.commit()
        
    # Scenario 1: Lookup existing
    async with async_session() as session:
        service = PatientService(session)
        patient = await service.lookup_patient("9876543210")
        assert patient is not None, "Scenario 1 Failed: Existing patient not found"
        assert patient.first_name == "Rahul"
        
    # Scenario 2: Register new
    async with async_session() as session:
        service = PatientService(session)
        new_patient_data = PatientCreate(
            first_name="Amit",
            last_name="Sharma",
            mobile_number="9123456789",
            basic_address="Balaji Nagar, Pune"
        )
        new_patient = await service.register_patient(new_patient_data)
        await session.commit() # Important to commit if we want to check DB persistence
        assert new_patient.mobile_number == "9123456789", "Scenario 2 Failed: Registration failed"
        
    # Verify duplicates are prevented
    async with async_session() as session:
        service = PatientService(session)
        duplicate_data = PatientCreate(
            first_name="Amit Duplicate",
            last_name="Sharma",
            mobile_number="9123456789",
            basic_address="Balaji Nagar, Pune"
        )
        try:
            await service.register_patient(duplicate_data)
            assert False, "Scenario 2 Failed: Allowed duplicate registration"
        except HTTPException as e:
            assert e.status_code == 409, "Duplicate should throw 409 Conflict"

if __name__ == "__main__":
    asyncio.run(run_test())
    print("PASS")
