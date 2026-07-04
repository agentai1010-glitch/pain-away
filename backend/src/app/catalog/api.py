"""Catalog — API Routes"""

from collections.abc import Sequence

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.schemas import CatalogItemResponse, CatalogItemCreate, CatalogItemUpdate
from app.catalog.service import CatalogService
from app.shared.dependencies import get_db

router = APIRouter(prefix="/catalog", tags=["Catalog"])


@router.get("/public", response_model=list[CatalogItemResponse])
async def get_public_catalog(
    db: AsyncSession = Depends(get_db),
) -> Sequence[CatalogItemResponse]:
    """Retrieve all active catalog items available for public booking."""
    service = CatalogService(db)
    return await service.get_public_catalog()


# --- Director Endpoints ---

@router.get("/director/items", response_model=list[CatalogItemResponse])
async def get_all_catalog_items(
    db: AsyncSession = Depends(get_db),
) -> Sequence[CatalogItemResponse]:
    """Retrieve all catalog items (including inactive) for Director management."""
    service = CatalogService(db)
    return await service.get_all_catalog_items()

@router.post("/director/items", response_model=CatalogItemResponse, status_code=201)
async def create_catalog_item(
    data: CatalogItemCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new service or package."""
    service = CatalogService(db)
    return await service.create_catalog_item(data)

@router.patch("/director/items/{item_id}", response_model=CatalogItemResponse)
async def update_catalog_item(
    item_id: str,
    data: CatalogItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update properties or active status of a service or package."""
    service = CatalogService(db)
    return await service.update_catalog_item(item_id, data)

