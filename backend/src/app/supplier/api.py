"""Supplier — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.supplier.schemas import SupplierResponse, SupplierCreate, SupplierUpdate
from app.supplier.service import SupplierService

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db)
) -> Sequence[SupplierResponse]:
    """Retrieve all suppliers."""
    service = SupplierService(db)
    return await service.get_all_suppliers(include_inactive)

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> SupplierResponse:
    """Get a specific supplier by ID."""
    service = SupplierService(db)
    return await service.get_supplier(supplier_id)

@router.post("", response_model=SupplierResponse, status_code=201)
async def create_supplier(
    data: SupplierCreate,
    db: AsyncSession = Depends(get_db)
) -> SupplierResponse:
    """Create a new supplier."""
    service = SupplierService(db)
    return await service.create_supplier(data)

@router.patch("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: uuid.UUID,
    data: SupplierUpdate,
    db: AsyncSession = Depends(get_db)
) -> SupplierResponse:
    """Update a supplier."""
    service = SupplierService(db)
    return await service.update_supplier(supplier_id, data)

@router.post("/{supplier_id}/activate", response_model=SupplierResponse)
async def activate_supplier(
    supplier_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> SupplierResponse:
    """Activate a supplier."""
    service = SupplierService(db)
    return await service.activate_supplier(supplier_id)

@router.post("/{supplier_id}/deactivate", response_model=SupplierResponse)
async def deactivate_supplier(
    supplier_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> SupplierResponse:
    """Deactivate a supplier."""
    service = SupplierService(db)
    return await service.deactivate_supplier(supplier_id)
