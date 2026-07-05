"""Inventory — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.inventory.models import InventoryModel

class InventoryRepository:
    """Repository for Inventory domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_by_id(self, inventory_id: uuid.UUID) -> InventoryModel | None:
        result = await self.session.execute(
            select(InventoryModel)
            .options(joinedload(InventoryModel.product), joinedload(InventoryModel.warehouse))
            .where(InventoryModel.id == inventory_id)
        )
        return result.scalars().first()

    async def list_all(self, warehouse_id: uuid.UUID | None = None, product_id: uuid.UUID | None = None) -> Sequence[InventoryModel]:
        query = select(InventoryModel).options(joinedload(InventoryModel.product), joinedload(InventoryModel.warehouse))
        if warehouse_id:
            query = query.where(InventoryModel.warehouse_id == warehouse_id)
        if product_id:
            query = query.where(InventoryModel.product_id == product_id)
            
        result = await self.session.execute(query)
        return result.unique().scalars().all()

    # Note: Create/Update methods are omitted here for general CRUD because capability 6 is read-only.
    # Future capabilities like Stock Movement will use internal methods to update this.
