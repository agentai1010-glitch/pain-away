"""Catalog — Data Access"""

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.domain import ItemType
from app.catalog.models import CatalogItemModel


class CatalogRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_active_bookable_items(self) -> Sequence[CatalogItemModel]:
        """Fetch active items that are services or packages."""
        stmt = select(CatalogItemModel).where(
            CatalogItemModel.is_active.is_(True),
            CatalogItemModel.item_type.in_([ItemType.SERVICE, ItemType.PACKAGE]),
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_item_by_id(self, item_id) -> CatalogItemModel | None:
        stmt = select(CatalogItemModel).where(CatalogItemModel.id == item_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all_items(self) -> Sequence[CatalogItemModel]:
        """Fetch all catalog items (including inactive ones) for the Director."""
        stmt = select(CatalogItemModel).order_by(CatalogItemModel.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create_item(self, item: CatalogItemModel) -> CatalogItemModel:
        """Persist a new catalog item."""
        self.session.add(item)
        await self.session.flush()
        return item

