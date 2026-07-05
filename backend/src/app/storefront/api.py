"""Storefront — API Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.shared.dependencies import get_db
from app.storefront.schemas import StorefrontProductResponse, StorefrontCategoryResponse, StorefrontBrandResponse
from app.storefront.service import StorefrontService

router = APIRouter(prefix="/storefront", tags=["Storefront"])

def get_storefront_service(db: AsyncSession = Depends(get_db)) -> StorefrontService:
    return StorefrontService(db)

@router.get("/products", response_model=List[StorefrontProductResponse])
async def list_public_products(
    service: StorefrontService = Depends(get_storefront_service)
):
    """Retrieve all active products for the public storefront with available quantity."""
    return await service.get_public_products()

@router.get("/categories", response_model=List[StorefrontCategoryResponse])
async def list_public_categories(
    service: StorefrontService = Depends(get_storefront_service)
):
    """Retrieve all active categories."""
    return await service.get_public_categories()

@router.get("/brands", response_model=List[StorefrontBrandResponse])
async def list_public_brands(
    service: StorefrontService = Depends(get_storefront_service)
):
    """Retrieve all active brands."""
    return await service.get_public_brands()
