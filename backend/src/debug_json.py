import asyncio
from app.db.session import async_session_factory
from app.reception.service import ReceptionService
import json

async def main():
    async with async_session_factory() as session:
        service = ReceptionService(session)
        workspace = await service.get_patient_workspace("7b6964cb-2362-4794-9f79-bb701b5bda75")
        # Print as JSON to see exactly what's returned
        print(json.dumps(workspace.model_dump(), indent=2, default=str))

if __name__ == '__main__':
    asyncio.run(main())
