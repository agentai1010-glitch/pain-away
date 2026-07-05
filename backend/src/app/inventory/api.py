"""Inventory — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.inventory.schemas import InventoryResponse
from app.inventory.service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=list[InventoryResponse])
async def list_inventory(
    warehouse_id: uuid.UUID | None = Query(None, description="Filter by warehouse"),
    product_id: uuid.UUID | None = Query(None, description="Filter by product"),
    db: AsyncSession = Depends(get_db)
) -> Sequence[InventoryResponse]:
    """Retrieve all inventory records, optionally filtered."""
    service = InventoryService(db)
    return await service.list_inventory(warehouse_id=warehouse_id, product_id=product_id)

@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory(
    inventory_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> InventoryResponse:
    """Get a specific inventory record by ID."""
    service = InventoryService(db)
    return await service.get_inventory(inventory_id)
