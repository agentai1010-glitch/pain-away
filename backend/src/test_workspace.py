import asyncio
from app.db.session import async_session_factory
from app.reception.service import ReceptionService
import uuid

async def main():
    async with async_session_factory() as session:
        service = ReceptionService(session)
        # Pravin Tarde ID
        res = await service.get_patient_workspace(uuid.UUID('7b6964cb-2362-4794-9f79-bb701b5bda75'))
        print(res.model_dump())

if __name__ == '__main__':
    asyncio.run(main())
