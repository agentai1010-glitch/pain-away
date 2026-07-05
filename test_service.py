import sys
sys.path.append("d:/PAIN_AWAY_1/backend/src")
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.scheduling.service import SchedulingService

async def main():
    engine = create_async_engine('sqlite+aiosqlite:///backend/painaway.db')
    async with AsyncSession(engine) as session:
        service = SchedulingService(session)
        slots = await service.get_available_slots()
        for d in slots:
            print(d.date)
            for s in d.slots:
                print(s.start_time, s.is_available)

if __name__ == "__main__":
    import sys
    sys.path.append("d:/PAIN_AWAY_1/backend/src")
    asyncio.run(main())
