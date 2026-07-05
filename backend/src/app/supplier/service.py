"""Supplier — Business Logic"""

import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.supplier.models import SupplierModel
from app.supplier.repository import SupplierRepository
from app.supplier.schemas import SupplierCreate, SupplierUpdate
from app.supplier.exceptions import (
    SupplierNotFoundException,
    SupplierAlreadyExistsException,
)

class SupplierService:
    def __init__(self, db: AsyncSession):
        self.repo = SupplierRepository(db)

    async def get_all_suppliers(self, include_inactive: bool = True) -> Sequence[SupplierModel]:
        return await self.repo.list_all(include_inactive)

    async def get_supplier(self, supplier_id: uuid.UUID) -> SupplierModel:
        supplier = await self.repo.get_by_id(supplier_id)
        if not supplier:
            raise SupplierNotFoundException()
        return supplier

    async def create_supplier(self, data: SupplierCreate) -> SupplierModel:
        # Check uniqueness
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise SupplierAlreadyExistsException(data.name)

        supplier = SupplierModel(**data.model_dump())
        return await self.repo.create(supplier)

    async def update_supplier(self, supplier_id: uuid.UUID, data: SupplierUpdate) -> SupplierModel:
        supplier = await self.get_supplier(supplier_id)

        # Check uniqueness if name changed
        if data.name is not None and data.name != supplier.name:
            existing = await self.repo.get_by_name(data.name)
            if existing:
                raise SupplierAlreadyExistsException(data.name)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(supplier, key, value)

        return await self.repo.update(supplier)

    async def activate_supplier(self, supplier_id: uuid.UUID) -> SupplierModel:
        supplier = await self.get_supplier(supplier_id)
        supplier.is_active = True
        return await self.repo.update(supplier)
        
    async def deactivate_supplier(self, supplier_id: uuid.UUID) -> SupplierModel:
        supplier = await self.get_supplier(supplier_id)
        supplier.is_active = False
        return await self.repo.update(supplier)
