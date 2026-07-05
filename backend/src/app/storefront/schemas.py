"""Storefront — API Schemas"""

from pydantic import BaseModel
import uuid
from typing import Optional

class StorefrontProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    sku: str
    description: Optional[str]
    selling_price: float
    image_url: Optional[str]
    category_id: Optional[uuid.UUID]
    category_name: Optional[str]
    brand_id: Optional[uuid.UUID]
    brand_name: Optional[str]
    available_quantity: int
    is_active: bool

class StorefrontCategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]

class StorefrontBrandResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
