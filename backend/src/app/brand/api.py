"""Brand — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.brand.schemas import BrandResponse, BrandCreate, BrandUpdate
from app.brand.service import BrandService

router = APIRouter(prefix="/brands", tags=["Brands"])

@router.get("", response_model=list[BrandResponse])
async def list_brands(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db)
) -> Sequence[BrandResponse]:
    """Retrieve all brands."""
    service = BrandService(db)
    return await service.get_all_brands(include_inactive)

@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> BrandResponse:
    """Get a specific brand by ID."""
    service = BrandService(db)
    return await service.get_brand(brand_id)

@router.post("", response_model=BrandResponse, status_code=201)
async def create_brand(
    data: BrandCreate,
    db: AsyncSession = Depends(get_db)
) -> BrandResponse:
    """Create a new brand."""
    service = BrandService(db)
    return await service.create_brand(data)

@router.patch("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: uuid.UUID,
    data: BrandUpdate,
    db: AsyncSession = Depends(get_db)
) -> BrandResponse:
    """Update a brand."""
    service = BrandService(db)
    return await service.update_brand(brand_id, data)

@router.post("/{brand_id}/activate", response_model=BrandResponse)
async def activate_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> BrandResponse:
    """Activate a brand."""
    service = BrandService(db)
    return await service.activate_brand(brand_id)

@router.post("/{brand_id}/deactivate", response_model=BrandResponse)
async def deactivate_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> BrandResponse:
    """Deactivate a brand."""
    service = BrandService(db)
    return await service.deactivate_brand(brand_id)
