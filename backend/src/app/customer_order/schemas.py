from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID
from .models import OrderStatusEnum

class CustomerOrderItemBase(BaseModel):
    product_id: UUID
    ordered_quantity: int

class CustomerOrderItemCreate(CustomerOrderItemBase):
    pass

class CustomerOrderItemResponse(CustomerOrderItemBase):
    id: UUID
    order_id: UUID
    product_name: str
    sku: str
    selling_price: float
    tax_rate: float
    line_total: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerOrderBase(BaseModel):
    customer_name: str
    customer_phone: str
    order_date: date
    notes: Optional[str] = None

class CustomerOrderCreate(CustomerOrderBase):
    items: List[CustomerOrderItemCreate]
    created_by: str

class CustomerOrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    order_date: Optional[date] = None
    notes: Optional[str] = None
    items: Optional[List[CustomerOrderItemCreate]] = None

class CustomerOrderResponse(CustomerOrderBase):
    id: UUID
    order_number: str
    status: OrderStatusEnum
    subtotal: float
    tax_total: float
    grand_total: float
    created_by: str
    created_at: datetime
    updated_at: datetime
    items: List[CustomerOrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
