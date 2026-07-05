"""Stock Movement — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.stock_movement.models import MovementTypeEnum
from app.stock_movement.schemas import StockMovementResponse, StockMovementCreate
from app.stock_movement.service import StockMovementService

router = APIRouter(prefix="/stock-movements", tags=["Stock Movements"])

@router.get("", response_model=list[StockMovementResponse])
async def list_movements(
    warehouse_id: uuid.UUID | None = Query(None, description="Filter by warehouse"),
    product_id: uuid.UUID | None = Query(None, description="Filter by product"),
    movement_type: MovementTypeEnum | None = Query(None, description="Filter by movement type"),
    db: AsyncSession = Depends(get_db)
) -> Sequence[StockMovementResponse]:
    """Retrieve all stock movements."""
    service = StockMovementService(db)
    return await service.list_movements(warehouse_id=warehouse_id, product_id=product_id, movement_type=movement_type)

@router.post("", response_model=StockMovementResponse, status_code=201)
async def create_movement(
    data: StockMovementCreate,
    db: AsyncSession = Depends(get_db)
) -> StockMovementResponse:
    """Create a new stock movement. 
    Note: In production this would typically only be called internally by other services 
    (like Procurement or Order Management), but exposed here for testing and manual adjustments.
    """
    service = StockMovementService(db)
    return await service.record_movement(data)
