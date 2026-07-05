"""Purchase Order — Request/Response Schemas"""

import uuid
from datetime import date, datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field
from app.purchase_order.models import PurchaseOrderStatusEnum
from app.supplier.schemas import SupplierResponse
from app.warehouse.schemas import WarehouseResponse
from app.product.schemas import ProductResponse

class PurchaseOrderItemBase(BaseModel):
    product_id: uuid.UUID
    ordered_quantity: int = Field(..., gt=0)
    unit_cost: float = Field(..., ge=0)
    tax_rate: float = Field(0.0, ge=0)

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    id: uuid.UUID
    po_id: uuid.UUID
    line_total: float
    product: ProductResponse
    
    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderBase(BaseModel):
    supplier_id: uuid.UUID
    warehouse_id: uuid.UUID
    order_date: date
    expected_delivery_date: date | None = None
    notes: str | None = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate] = Field(..., min_length=1)
    created_by: str | None = None

class PurchaseOrderUpdate(BaseModel):
    # Only Drafts can be updated, and usually we just recreate the items entirely or update header info
    supplier_id: uuid.UUID | None = None
    warehouse_id: uuid.UUID | None = None
    order_date: date | None = None
    expected_delivery_date: date | None = None
    notes: str | None = None
    items: List[PurchaseOrderItemCreate] | None = None

class PurchaseOrderResponse(PurchaseOrderBase):
    id: uuid.UUID
    po_number: str
    status: PurchaseOrderStatusEnum
    subtotal: float
    tax_total: float
    grand_total: float
    created_by: str | None
    created_at: datetime
    updated_at: datetime
    
    supplier: SupplierResponse
    warehouse: WarehouseResponse
    items: List[PurchaseOrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
