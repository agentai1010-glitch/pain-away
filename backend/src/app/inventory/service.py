"""Inventory — Business Logic"""

import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.inventory.models import InventoryModel
from app.inventory.repository import InventoryRepository
from app.inventory.exceptions import InventoryNotFoundException

class InventoryService:
    def __init__(self, db: AsyncSession):
        self.repo = InventoryRepository(db)

    async def list_inventory(
        self, warehouse_id: uuid.UUID | None = None, product_id: uuid.UUID | None = None
    ) -> Sequence[InventoryModel]:
        return await self.repo.list_all(warehouse_id=warehouse_id, product_id=product_id)

    async def get_inventory(self, inventory_id: uuid.UUID) -> InventoryModel:
        inventory = await self.repo.get_by_id(inventory_id)
        if not inventory:
            raise InventoryNotFoundException()
        return inventory
