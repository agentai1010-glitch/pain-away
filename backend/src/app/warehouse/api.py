"""Warehouse — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.warehouse.schemas import WarehouseResponse, WarehouseCreate, WarehouseUpdate
from app.warehouse.service import WarehouseService

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

@router.get("", response_model=list[WarehouseResponse])
async def list_warehouses(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db)
) -> Sequence[WarehouseResponse]:
    """Retrieve all warehouses."""
    service = WarehouseService(db)
    return await service.get_all_warehouses(include_inactive)

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> WarehouseResponse:
    """Get a specific warehouse by ID."""
    service = WarehouseService(db)
    return await service.get_warehouse(warehouse_id)

@router.post("", response_model=WarehouseResponse, status_code=201)
async def create_warehouse(
    data: WarehouseCreate,
    db: AsyncSession = Depends(get_db)
) -> WarehouseResponse:
    """Create a new warehouse."""
    service = WarehouseService(db)
    return await service.create_warehouse(data)

@router.patch("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: uuid.UUID,
    data: WarehouseUpdate,
    db: AsyncSession = Depends(get_db)
) -> WarehouseResponse:
    """Update a warehouse."""
    service = WarehouseService(db)
    return await service.update_warehouse(warehouse_id, data)

@router.post("/{warehouse_id}/activate", response_model=WarehouseResponse)
async def activate_warehouse(
    warehouse_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> WarehouseResponse:
    """Activate a warehouse."""
    service = WarehouseService(db)
    return await service.activate_warehouse(warehouse_id)

@router.post("/{warehouse_id}/deactivate", response_model=WarehouseResponse)
async def deactivate_warehouse(
    warehouse_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> WarehouseResponse:
    """Deactivate a warehouse."""
    service = WarehouseService(db)
    return await service.deactivate_warehouse(warehouse_id)
