"""Stock Movement — Request/Response Schemas"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.stock_movement.models import MovementTypeEnum
from app.product.schemas import ProductResponse
from app.warehouse.schemas import WarehouseResponse

class StockMovementBase(BaseModel):
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    movement_type: MovementTypeEnum
    quantity_changed: int = Field(..., description="Positive for additions, negative for deductions")
    reference_source: str | None = Field(None, description="E.g., PO-1001, ORDER-500")
    notes: str | None = Field(None)
    created_by: str | None = Field(None)

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementResponse(StockMovementBase):
    id: uuid.UUID
    reference_number: str
    balance_before: int
    balance_after: int
    created_at: datetime
    updated_at: datetime
    product: ProductResponse
    warehouse: WarehouseResponse

    model_config = ConfigDict(from_attributes=True)
