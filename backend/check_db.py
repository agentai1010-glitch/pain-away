import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.db.base import Base
from app.patient.models import PatientModel
from app.scheduling.models import AppointmentModel

async def check_db():
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@localhost:5432/painaway")
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as session:
        # Check all patients
        patients_stmt = select(PatientModel)
        patients = (await session.execute(patients_stmt)).scalars().all()
        print("Patients:", [(p.id, p.first_name, p.mobile_number) for p in patients])
        
        # Check all appointments
        apts_stmt = select(AppointmentModel)
        apts = (await session.execute(apts_stmt)).scalars().all()
        print("Appointments:", [(a.id, a.patient_id, a.status, a.date) for a in apts])

if __name__ == "__main__":
    asyncio.run(check_db())
