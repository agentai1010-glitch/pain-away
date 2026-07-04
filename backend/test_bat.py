"""
BAT-C001A: Catalog Browsing Business Acceptance Test
"""

import asyncio
import sys
from pathlib import Path

# Add backend/src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.db.base import Base
from app.catalog.models import CatalogItemModel
from app.catalog.domain import ItemType
from app.shared.dependencies import get_db

# Create an in-memory async SQLite engine
engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# Override the database dependency
app.dependency_overrides[get_db] = override_get_db

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        # Active Service: Back Pain, 1000
        item1 = CatalogItemModel(
            name="Back Pain",
            item_type=ItemType.SERVICE,
            price=1000,
            is_active=True
        )
        # Active Service: Neck Pain, 1200
        item2 = CatalogItemModel(
            name="Neck Pain",
            item_type=ItemType.SERVICE,
            price=1200,
            is_active=True
        )
        # Active Package: Back + Neck Package, 1800
        item3 = CatalogItemModel(
            name="Back + Neck Package",
            item_type=ItemType.PACKAGE,
            price=1800,
            is_active=True
        )
        # Inactive Service: Sciatica Therapy, 1500
        item4 = CatalogItemModel(
            name="Sciatica Therapy",
            item_type=ItemType.SERVICE,
            price=1500,
            is_active=False
        )
        session.add_all([item1, item2, item3, item4])
        await session.commit()

async def run_test():
    await seed_data()
    
    client = TestClient(app)
    
    # Verify no authentication required and fetch public catalog
    response = client.get("/api/v1/catalog/public")
    
    if response.status_code != 200:
        print(f"FAILED: Expected 200, got {response.status_code}")
        sys.exit(1)
        
    data = response.json()
    
    names = [item["name"] for item in data]
    
    # Active items are returned
    if "Back Pain" not in names or "Neck Pain" not in names or "Back + Neck Package" not in names:
        print("FAILED: Not all active items returned")
        sys.exit(1)
        
    # Inactive items are excluded
    if "Sciatica Therapy" in names:
        print("FAILED: Inactive items were returned")
        sys.exit(1)
        
    # Services and packages are both returned
    types = {item["item_type"] for item in data}
    if "SERVICE" not in types or "PACKAGE" not in types:
        print("FAILED: Not both services and packages returned")
        sys.exit(1)
        
    # Prices are returned correctly
    price_map = {item["name"]: item["price"] for item in data}
    if price_map["Back Pain"] != 1000 or price_map["Neck Pain"] != 1200 or price_map["Back + Neck Package"] != 1800:
        print("FAILED: Prices are incorrect")
        sys.exit(1)
        
    print("PASS")

if __name__ == "__main__":
    asyncio.run(run_test())
