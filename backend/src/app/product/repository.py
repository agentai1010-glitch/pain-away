"""Product — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.product.models import ProductModel

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, include_inactive: bool = True) -> Sequence[ProductModel]:
        stmt = select(ProductModel).order_by(ProductModel.name)
        if not include_inactive:
            stmt = stmt.where(ProductModel.is_active == True)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, product_id: uuid.UUID) -> ProductModel | None:
        return await self.session.get(ProductModel, product_id)
        
    async def get_by_sku(self, sku: str) -> ProductModel | None:
        stmt = select(ProductModel).where(ProductModel.sku == sku)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, product: ProductModel) -> ProductModel:
        self.session.add(product)
        await self.session.flush()
        return product

    async def update(self, product: ProductModel) -> ProductModel:
        self.session.add(product)
        await self.session.flush()
        await self.session.refresh(product)
        return product
