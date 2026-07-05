"""Brand — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.brand.models import BrandModel

class BrandRepository:
    """Repository for Brand domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_by_id(self, brand_id: uuid.UUID) -> BrandModel | None:
        return await self.session.get(BrandModel, brand_id)

    async def get_by_name(self, name: str) -> BrandModel | None:
        result = await self.session.execute(
            select(BrandModel).where(BrandModel.name == name)
        )
        return result.scalars().first()

    async def list_all(self, include_inactive: bool = True) -> Sequence[BrandModel]:
        query = select(BrandModel).order_by(BrandModel.display_order.asc(), BrandModel.name.asc())
        if not include_inactive:
            query = query.where(BrandModel.is_active == True)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create(self, brand: BrandModel) -> BrandModel:
        self.session.add(brand)
        await self.session.flush()
        await self.session.refresh(brand)
        return brand
        
    async def update(self, brand: BrandModel) -> BrandModel:
        self.session.add(brand)
        await self.session.flush()
        await self.session.refresh(brand)
        return brand
