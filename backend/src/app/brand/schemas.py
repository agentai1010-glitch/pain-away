"""Brand — Request/Response Schemas"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class BrandBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the brand")
    description: str | None = Field(None, max_length=1000, description="Detailed description")
    logo_url: str | None = Field(None, max_length=500, description="URL or path to logo")
    website: str | None = Field(None, max_length=255, description="Brand website URL")
    display_order: int = Field(0, description="Order to display in UI")

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=1000)
    logo_url: str | None = Field(None, max_length=500)
    website: str | None = Field(None, max_length=255)
    display_order: int | None = Field(None)

class BrandResponse(BrandBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
