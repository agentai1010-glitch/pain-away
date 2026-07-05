"""Purchase Order — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.purchase_order.schemas import PurchaseOrderResponse, PurchaseOrderCreate, PurchaseOrderUpdate
from app.purchase_order.service import PurchaseOrderService

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

@router.get("", response_model=list[PurchaseOrderResponse])
async def list_purchase_orders(db: AsyncSession = Depends(get_db)) -> Sequence[PurchaseOrderResponse]:
    """Retrieve all purchase orders."""
    service = PurchaseOrderService(db)
    return await service.list_purchase_orders()

@router.get("/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(po_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> PurchaseOrderResponse:
    """Get a specific purchase order."""
    service = PurchaseOrderService(db)
    return await service.get_purchase_order(po_id)

@router.post("", response_model=PurchaseOrderResponse, status_code=201)
async def create_purchase_order(data: PurchaseOrderCreate, db: AsyncSession = Depends(get_db)) -> PurchaseOrderResponse:
    """Create a new draft purchase order."""
    service = PurchaseOrderService(db)
    return await service.create_purchase_order(data)

@router.put("/{po_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(po_id: uuid.UUID, data: PurchaseOrderUpdate, db: AsyncSession = Depends(get_db)) -> PurchaseOrderResponse:
    """Update a draft purchase order."""
    service = PurchaseOrderService(db)
    return await service.update_purchase_order(po_id, data)

@router.post("/{po_id}/submit", response_model=PurchaseOrderResponse)
async def submit_purchase_order(po_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> PurchaseOrderResponse:
    """Submit a draft purchase order to the supplier."""
    service = PurchaseOrderService(db)
    return await service.submit_purchase_order(po_id)
