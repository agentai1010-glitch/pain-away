"""Catalog — Business Logic"""

from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status
from app.catalog.models import CatalogItemModel
from app.catalog.repository import CatalogRepository
from app.catalog.domain import ItemType
from app.catalog.schemas import CatalogItemCreate, CatalogItemUpdate


class CatalogService:
    def __init__(self, session: AsyncSession):
        self.repository = CatalogRepository(session)

    async def get_public_catalog(self) -> Sequence[CatalogItemModel]:
        """
        Get all catalog items available for public booking.
        Applies domain rules implicitly via repository filters.
        """
        return await self.repository.get_active_bookable_items()

    async def get_catalog_item(self, item_id) -> CatalogItemModel | None:
        return await self.repository.get_item_by_id(item_id)

    async def get_public_catalog_item(self, item_id: str) -> CatalogItemModel:
        import uuid
        if isinstance(item_id, str):
            item_id = uuid.UUID(item_id)
        item = await self.repository.get_item_by_id(item_id)
        if not item or not item.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found.")
        return item

    async def get_all_catalog_items(self) -> Sequence[CatalogItemModel]:
        """Get all catalog items for director management."""
        return await self.repository.get_all_items()

    async def create_catalog_item(self, data: CatalogItemCreate) -> CatalogItemModel:
        """Create a new service or package."""
        if data.item_type == ItemType.SERVICE and data.duration_minutes is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Services must have a duration.")
        if data.item_type == ItemType.PACKAGE and data.session_count is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Packages must have a session count.")
            
        item = CatalogItemModel(
            name=data.name,
            description=data.description,
            item_type=data.item_type,
            price=data.price,
            is_active=data.is_active,
            duration_minutes=data.duration_minutes if data.item_type == ItemType.SERVICE else None,
            session_count=data.session_count if data.item_type == ItemType.PACKAGE else None,
        )
        await self.repository.create_item(item)
        await self.repository.session.commit()
        return item

    async def update_catalog_item(self, item_id, data: CatalogItemUpdate) -> CatalogItemModel:
        """Update properties or status of a service or package."""
        import uuid
        if isinstance(item_id, str):
            item_id = uuid.UUID(item_id)
            
        item = await self.repository.get_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found.")
            
        if data.name is not None:
            item.name = data.name
        if data.description is not None:
            item.description = data.description
        if data.price is not None:
            item.price = data.price
        if data.is_active is not None:
            item.is_active = data.is_active
            
        if item.item_type == ItemType.SERVICE and data.duration_minutes is not None:
            item.duration_minutes = data.duration_minutes
            
        if item.item_type == ItemType.PACKAGE and data.session_count is not None:
            item.session_count = data.session_count
            
        await self.repository.session.commit()
        return item
