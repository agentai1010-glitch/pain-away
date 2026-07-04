"""
Seed the Postgres database with sample catalog items.
"""
import asyncio
import sys
from pathlib import Path
import uuid

# Add backend/src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from app.db.session import async_session_factory
from app.catalog.models import CatalogItemModel
from app.catalog.domain import ItemType

async def seed_data():
    async with async_session_factory() as session:
        # Check if items already exist
        # We'll just insert test data.
        
        # Active Service: Back Pain, 1000
        item1 = CatalogItemModel(
            id=uuid.uuid4(),
            name="Back Pain Therapy",
            description="Comprehensive physical therapy for lower and upper back pain.",
            item_type=ItemType.SERVICE,
            price=1000,
            is_active=True,
            duration_minutes=60
        )
        # Active Service: Neck Pain, 1200
        item2 = CatalogItemModel(
            id=uuid.uuid4(),
            name="Neck & Shoulder Release",
            description="Targeted manual therapy to relieve neck stiffness and shoulder tension.",
            item_type=ItemType.SERVICE,
            price=1200,
            is_active=True,
            duration_minutes=45
        )
        # Active Package: Back + Neck Package, 1800
        item3 = CatalogItemModel(
            id=uuid.uuid4(),
            name="Complete Back & Neck Recovery Package",
            description="A bundle of 5 sessions focused on complete spinal alignment and pain relief.",
            item_type=ItemType.PACKAGE,
            price=5000,
            is_active=True,
            session_count=5
        )
        
        session.add_all([item1, item2, item3])
        await session.commit()
        print("Successfully seeded catalog items.")

if __name__ == "__main__":
    asyncio.run(seed_data())
