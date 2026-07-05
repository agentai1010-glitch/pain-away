"""Category — Business Logic"""

import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.category.models import CategoryModel
from app.category.repository import CategoryRepository
from app.category.schemas import CategoryCreate, CategoryUpdate
from app.category.exceptions import (
    CategoryNotFoundException,
    CategoryAlreadyExistsException,
    InvalidParentCategoryException
)

class CategoryService:
    def __init__(self, db: AsyncSession):
        self.repo = CategoryRepository(db)

    async def get_all_categories(self, include_inactive: bool = True) -> Sequence[CategoryModel]:
        return await self.repo.list_all(include_inactive)

    async def get_category(self, category_id: uuid.UUID) -> CategoryModel:
        category = await self.repo.get_by_id(category_id)
        if not category:
            raise CategoryNotFoundException()
        return category

    async def create_category(self, data: CategoryCreate) -> CategoryModel:
        # Check uniqueness
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise CategoryAlreadyExistsException(data.name)

        # Check parent
        if data.parent_id:
            parent = await self.repo.get_by_id(data.parent_id)
            if not parent:
                raise InvalidParentCategoryException()

        category = CategoryModel(**data.model_dump())
        return await self.repo.create(category)

    async def update_category(self, category_id: uuid.UUID, data: CategoryUpdate) -> CategoryModel:
        category = await self.get_category(category_id)

        # Check uniqueness if name changed
        if data.name is not None and data.name != category.name:
            existing = await self.repo.get_by_name(data.name)
            if existing:
                raise CategoryAlreadyExistsException(data.name)

        # Check parent
        if data.parent_id is not None:
            if data.parent_id == category_id:
                raise InvalidParentCategoryException()
            parent = await self.repo.get_by_id(data.parent_id)
            if not parent:
                raise InvalidParentCategoryException()

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)

        return await self.repo.update(category)

    async def activate_category(self, category_id: uuid.UUID) -> CategoryModel:
        category = await self.get_category(category_id)
        category.is_active = True
        return await self.repo.update(category)
        
    async def deactivate_category(self, category_id: uuid.UUID) -> CategoryModel:
        category = await self.get_category(category_id)
        category.is_active = False
        return await self.repo.update(category)
