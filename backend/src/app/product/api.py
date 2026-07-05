"""Product — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.product.schemas import ProductResponse, ProductCreate, ProductUpdate
from app.product.service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=list[ProductResponse])
async def list_products(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db)
) -> Sequence[ProductResponse]:
    """Retrieve all products."""
    service = ProductService(db)
    return await service.get_all_products(include_inactive)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Get a specific product by ID."""
    service = ProductService(db)
    return await service.get_product(product_id)

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Create a new product."""
    service = ProductService(db)
    return await service.create_product(data)

@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Update a product."""
    service = ProductService(db)
    return await service.update_product(product_id, data)

@router.post("/{product_id}/activate", response_model=ProductResponse)
async def activate_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Activate a product."""
    service = ProductService(db)
    return await service.activate_product(product_id)

@router.post("/{product_id}/deactivate", response_model=ProductResponse)
async def deactivate_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Deactivate a product."""
    service = ProductService(db)
    return await service.deactivate_product(product_id)
