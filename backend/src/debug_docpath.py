import asyncio
from app.db.session import async_session_factory
from app.billing.service import BillingService

async def main():
    async with async_session_factory() as s:
        service = BillingService(s)
        # Test with the final bill document ID
        path = await service.get_document_path("61406cd4-4052-4b87-9adf-1cf98525e2ef")
        print(f"Final bill path: {path}")
        
        # Test with the receipt document ID
        path2 = await service.get_document_path("18461aa3-23d5-4c97-aa5f-42141708c090")
        print(f"Receipt path: {path2}")

if __name__ == '__main__':
    asyncio.run(main())
