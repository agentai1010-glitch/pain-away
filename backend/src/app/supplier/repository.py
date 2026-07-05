"""Supplier — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.supplier.models import SupplierModel

class SupplierRepository:
    """Repository for Supplier domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_by_id(self, supplier_id: uuid.UUID) -> SupplierModel | None:
        return await self.session.get(SupplierModel, supplier_id)

    async def get_by_name(self, name: str) -> SupplierModel | None:
        result = await self.session.execute(
            select(SupplierModel).where(SupplierModel.name == name)
        )
        return result.scalars().first()

    async def list_all(self, include_inactive: bool = True) -> Sequence[SupplierModel]:
        query = select(SupplierModel).order_by(SupplierModel.name.asc())
        if not include_inactive:
            query = query.where(SupplierModel.is_active == True)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create(self, supplier: SupplierModel) -> SupplierModel:
        self.session.add(supplier)
        await self.session.flush()
        await self.session.refresh(supplier)
        return supplier
        
    async def update(self, supplier: SupplierModel) -> SupplierModel:
        self.session.add(supplier)
        await self.session.flush()
        await self.session.refresh(supplier)
        return supplier
