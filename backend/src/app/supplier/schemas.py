"""Supplier — Request/Response Schemas"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class SupplierBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the supplier business")
    contact_person: str = Field(..., max_length=255, description="Name of the main contact")
    phone_number: str = Field(..., max_length=50, description="Contact phone number")
    email: str | None = Field(None, max_length=255, description="Contact email address")
    gst_number: str = Field(..., max_length=50, description="GST or Tax ID number")
    address: str = Field(..., description="Physical business address")
    payment_terms: str = Field(..., max_length=255, description="Payment terms e.g., Net 30")
    notes: str | None = Field(None, description="Optional internal notes")

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    contact_person: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None, max_length=50)
    email: str | None = Field(None, max_length=255)
    gst_number: str | None = Field(None, max_length=50)
    address: str | None = Field(None)
    payment_terms: str | None = Field(None, max_length=255)
    notes: str | None = Field(None)

class SupplierResponse(SupplierBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
