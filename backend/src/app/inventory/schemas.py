"""Inventory — Request/Response Schemas"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.product.schemas import ProductResponse
from app.warehouse.schemas import WarehouseResponse

class InventoryBase(BaseModel):
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    current_quantity: int = Field(0, description="Total physical quantity present in warehouse", ge=0)
    reserved_quantity: int = Field(0, description="Quantity reserved for orders", ge=0)
    reorder_level: int = Field(0, description="Minimum quantity to trigger reorder", ge=0)

class InventoryResponse(InventoryBase):
    id: uuid.UUID
    available_quantity: int
    created_at: datetime
    updated_at: datetime
    product: ProductResponse
    warehouse: WarehouseResponse

    model_config = ConfigDict(from_attributes=True)
