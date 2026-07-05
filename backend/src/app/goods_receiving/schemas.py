"""Goods Receiving — Request/Response Schemas"""

import uuid
from datetime import date, datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field
from app.supplier.schemas import SupplierResponse
from app.warehouse.schemas import WarehouseResponse
from app.product.schemas import ProductResponse
from app.purchase_order.schemas import PurchaseOrderResponse

class GoodsReceiptItemBase(BaseModel):
    po_item_id: uuid.UUID
    product_id: uuid.UUID
    ordered_quantity: int = Field(..., ge=0)
    received_quantity: int = Field(..., ge=0)
    accepted_quantity: int = Field(..., ge=0)

class GoodsReceiptItemCreate(GoodsReceiptItemBase):
    pass

class GoodsReceiptItemResponse(GoodsReceiptItemBase):
    id: uuid.UUID
    receipt_id: uuid.UUID
    line_status: str
    product: ProductResponse
    
    model_config = ConfigDict(from_attributes=True)

class GoodsReceiptBase(BaseModel):
    po_id: uuid.UUID
    supplier_id: uuid.UUID
    warehouse_id: uuid.UUID
    received_date: date
    notes: str | None = None

class GoodsReceiptCreate(GoodsReceiptBase):
    items: List[GoodsReceiptItemCreate] = Field(..., min_length=1)
    created_by: str | None = None

class GoodsReceiptResponse(GoodsReceiptBase):
    id: uuid.UUID
    receipt_number: str
    created_by: str | None
    created_at: datetime
    updated_at: datetime
    
    purchase_order: PurchaseOrderResponse
    supplier: SupplierResponse
    warehouse: WarehouseResponse
    items: List[GoodsReceiptItemResponse]

    model_config = ConfigDict(from_attributes=True)
