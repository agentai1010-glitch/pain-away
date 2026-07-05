"""Warehouse — Request/Response Schemas"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class WarehouseBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the warehouse")
    code: str = Field(..., max_length=50, description="Unique warehouse code")
    description: str | None = Field(None, description="Optional description")
    address: str = Field(..., description="Physical address of warehouse")
    contact_person: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None, max_length=50)
    is_default: bool = Field(False, description="Whether this is the default warehouse")

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    code: str | None = Field(None, max_length=50)
    description: str | None = Field(None)
    address: str | None = Field(None)
    contact_person: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None, max_length=50)
    is_default: bool | None = Field(None)

class WarehouseResponse(WarehouseBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
