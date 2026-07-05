"""Category — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.category.schemas import CategoryResponse, CategoryCreate, CategoryUpdate
from app.category.service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=list[CategoryResponse])
async def list_categories(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db)
) -> Sequence[CategoryResponse]:
    """Retrieve all categories."""
    service = CategoryService(db)
    return await service.get_all_categories(include_inactive)

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> CategoryResponse:
    """Get a specific category by ID."""
    service = CategoryService(db)
    return await service.get_category(category_id)

@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db)
) -> CategoryResponse:
    """Create a new category."""
    service = CategoryService(db)
    return await service.create_category(data)

@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db)
) -> CategoryResponse:
    """Update a category."""
    service = CategoryService(db)
    return await service.update_category(category_id, data)

@router.post("/{category_id}/activate", response_model=CategoryResponse)
async def activate_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> CategoryResponse:
    """Activate a category."""
    service = CategoryService(db)
    return await service.activate_category(category_id)

@router.post("/{category_id}/deactivate", response_model=CategoryResponse)
async def deactivate_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> CategoryResponse:
    """Deactivate a category."""
    service = CategoryService(db)
    return await service.deactivate_category(category_id)
