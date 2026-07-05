"""Category — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.category.models import CategoryModel

class CategoryRepository:
    """Repository for Category domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_by_id(self, category_id: uuid.UUID) -> CategoryModel | None:
        return await self.session.get(CategoryModel, category_id)

    async def get_by_name(self, name: str) -> CategoryModel | None:
        result = await self.session.execute(
            select(CategoryModel).where(CategoryModel.name == name)
        )
        return result.scalars().first()

    async def list_all(self, include_inactive: bool = True) -> Sequence[CategoryModel]:
        query = select(CategoryModel).order_by(CategoryModel.display_order.asc(), CategoryModel.name.asc())
        if not include_inactive:
            query = query.where(CategoryModel.is_active == True)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create(self, category: CategoryModel) -> CategoryModel:
        self.session.add(category)
        await self.session.flush()
        await self.session.refresh(category)
        return category
        
    async def update(self, category: CategoryModel) -> CategoryModel:
        self.session.add(category)
        await self.session.flush()
        await self.session.refresh(category)
        return category
