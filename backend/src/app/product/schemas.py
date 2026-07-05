"""Product — Request/Response Schemas"""

from pydantic import BaseModel, ConfigDict, Field
import uuid
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=100)
    barcode: str | None = None
    description: str | None = None
    selling_price: float = Field(0.0, ge=0)
    cost_price: float = Field(0.0, ge=0)
    tax_rate: float = Field(0.0, ge=0, le=100)
    image_url: str | None = None
    category_id: uuid.UUID | None = None
    brand_id: uuid.UUID | None = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    sku: str | None = Field(None, max_length=100)
    barcode: str | None = None
    description: str | None = None
    selling_price: float | None = Field(None, ge=0)
    cost_price: float | None = Field(None, ge=0)
    tax_rate: float | None = Field(None, ge=0, le=100)
    image_url: str | None = None
    category_id: uuid.UUID | None = None
    brand_id: uuid.UUID | None = None
    is_active: bool | None = None

class ProductResponse(ProductBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
