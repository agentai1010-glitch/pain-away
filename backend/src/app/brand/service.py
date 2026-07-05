"""Brand — Business Logic"""

import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.brand.models import BrandModel
from app.brand.repository import BrandRepository
from app.brand.schemas import BrandCreate, BrandUpdate
from app.brand.exceptions import (
    BrandNotFoundException,
    BrandAlreadyExistsException,
)

class BrandService:
    def __init__(self, db: AsyncSession):
        self.repo = BrandRepository(db)

    async def get_all_brands(self, include_inactive: bool = True) -> Sequence[BrandModel]:
        return await self.repo.list_all(include_inactive)

    async def get_brand(self, brand_id: uuid.UUID) -> BrandModel:
        brand = await self.repo.get_by_id(brand_id)
        if not brand:
            raise BrandNotFoundException()
        return brand

    async def create_brand(self, data: BrandCreate) -> BrandModel:
        # Check uniqueness
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise BrandAlreadyExistsException(data.name)

        brand = BrandModel(**data.model_dump())
        return await self.repo.create(brand)

    async def update_brand(self, brand_id: uuid.UUID, data: BrandUpdate) -> BrandModel:
        brand = await self.get_brand(brand_id)

        # Check uniqueness if name changed
        if data.name is not None and data.name != brand.name:
            existing = await self.repo.get_by_name(data.name)
            if existing:
                raise BrandAlreadyExistsException(data.name)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(brand, key, value)

        return await self.repo.update(brand)

    async def activate_brand(self, brand_id: uuid.UUID) -> BrandModel:
        brand = await self.get_brand(brand_id)
        brand.is_active = True
        return await self.repo.update(brand)
        
    async def deactivate_brand(self, brand_id: uuid.UUID) -> BrandModel:
        brand = await self.get_brand(brand_id)
        brand.is_active = False
        return await self.repo.update(brand)
