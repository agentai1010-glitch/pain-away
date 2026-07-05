"""Warehouse — Business Logic"""

import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.warehouse.models import WarehouseModel
from app.warehouse.repository import WarehouseRepository
from app.warehouse.schemas import WarehouseCreate, WarehouseUpdate
from app.warehouse.exceptions import (
    WarehouseNotFoundException,
    WarehouseAlreadyExistsException,
)

class WarehouseService:
    def __init__(self, db: AsyncSession):
        self.repo = WarehouseRepository(db)

    async def get_all_warehouses(self, include_inactive: bool = True) -> Sequence[WarehouseModel]:
        return await self.repo.list_all(include_inactive)

    async def get_warehouse(self, warehouse_id: uuid.UUID) -> WarehouseModel:
        warehouse = await self.repo.get_by_id(warehouse_id)
        if not warehouse:
            raise WarehouseNotFoundException()
        return warehouse

    async def create_warehouse(self, data: WarehouseCreate) -> WarehouseModel:
        # Check name uniqueness
        existing_name = await self.repo.get_by_name(data.name)
        if existing_name:
            raise WarehouseAlreadyExistsException(f"Warehouse with name '{data.name}' already exists")

        # Check code uniqueness
        existing_code = await self.repo.get_by_code(data.code)
        if existing_code:
            raise WarehouseAlreadyExistsException(f"Warehouse with code '{data.code}' already exists")

        warehouse = WarehouseModel(**data.model_dump())
        return await self.repo.create(warehouse)

    async def update_warehouse(self, warehouse_id: uuid.UUID, data: WarehouseUpdate) -> WarehouseModel:
        warehouse = await self.get_warehouse(warehouse_id)

        # Check name uniqueness if changed
        if data.name is not None and data.name != warehouse.name:
            existing = await self.repo.get_by_name(data.name)
            if existing:
                raise WarehouseAlreadyExistsException(f"Warehouse with name '{data.name}' already exists")

        # Check code uniqueness if changed
        if data.code is not None and data.code != warehouse.code:
            existing = await self.repo.get_by_code(data.code)
            if existing:
                raise WarehouseAlreadyExistsException(f"Warehouse with code '{data.code}' already exists")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(warehouse, key, value)

        return await self.repo.update(warehouse)

    async def activate_warehouse(self, warehouse_id: uuid.UUID) -> WarehouseModel:
        warehouse = await self.get_warehouse(warehouse_id)
        warehouse.is_active = True
        return await self.repo.update(warehouse)
        
    async def deactivate_warehouse(self, warehouse_id: uuid.UUID) -> WarehouseModel:
        warehouse = await self.get_warehouse(warehouse_id)
        warehouse.is_active = False
        return await self.repo.update(warehouse)
