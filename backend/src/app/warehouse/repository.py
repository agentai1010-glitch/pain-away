"""Warehouse — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.warehouse.models import WarehouseModel

class WarehouseRepository:
    """Repository for Warehouse domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_by_id(self, warehouse_id: uuid.UUID) -> WarehouseModel | None:
        return await self.session.get(WarehouseModel, warehouse_id)

    async def get_by_name(self, name: str) -> WarehouseModel | None:
        result = await self.session.execute(
            select(WarehouseModel).where(WarehouseModel.name == name)
        )
        return result.scalars().first()
        
    async def get_by_code(self, code: str) -> WarehouseModel | None:
        result = await self.session.execute(
            select(WarehouseModel).where(WarehouseModel.code == code)
        )
        return result.scalars().first()

    async def list_all(self, include_inactive: bool = True) -> Sequence[WarehouseModel]:
        query = select(WarehouseModel).order_by(WarehouseModel.name.asc())
        if not include_inactive:
            query = query.where(WarehouseModel.is_active == True)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def _unset_default(self):
        """Unset default flag for all warehouses."""
        await self.session.execute(
            update(WarehouseModel).where(WarehouseModel.is_default == True).values(is_default=False)
        )

    async def create(self, warehouse: WarehouseModel) -> WarehouseModel:
        if warehouse.is_default:
            await self._unset_default()
            
        self.session.add(warehouse)
        await self.session.flush()
        await self.session.refresh(warehouse)
        return warehouse
        
    async def update(self, warehouse: WarehouseModel) -> WarehouseModel:
        if warehouse.is_default:
            await self._unset_default()
            # Note: _unset_default might have updated the current warehouse object in session if it was default.
            # but since we are modifying it, it will be saved correctly on flush.
            warehouse.is_default = True # ensure it stays true if we just unset all.
            
        self.session.add(warehouse)
        await self.session.flush()
        await self.session.refresh(warehouse)
        return warehouse
