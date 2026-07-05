"""Category — Request/Response Schemas"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CategoryBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the category")
    description: str | None = Field(None, max_length=1000, description="Detailed description")
    parent_id: uuid.UUID | None = Field(None, description="Optional parent category ID")
    display_order: int = Field(0, description="Order to display in UI")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=1000)
    parent_id: uuid.UUID | None = Field(None)
    display_order: int | None = Field(None)

class CategoryResponse(CategoryBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
