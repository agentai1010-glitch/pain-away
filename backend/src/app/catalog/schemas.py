"""Catalog — Request/Response Schemas"""

import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.catalog.domain import ItemType


class CatalogItemBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = Field(None, max_length=1000)
    price: int = Field(..., ge=0)
    is_active: bool = True


class CatalogServiceItem(CatalogItemBase):
    item_type: Literal[ItemType.SERVICE]
    duration_minutes: int | None = Field(None, ge=1)


class CatalogPackageItem(CatalogItemBase):
    item_type: Literal[ItemType.PACKAGE]
    session_count: int | None = Field(None, ge=1)


class CatalogItemCreate(CatalogItemBase):
    item_type: ItemType
    duration_minutes: int | None = Field(None, ge=1)
    session_count: int | None = Field(None, ge=1)


class CatalogItemUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=1000)
    price: int | None = Field(None, ge=0)
    is_active: bool | None = None
    duration_minutes: int | None = Field(None, ge=1)
    session_count: int | None = Field(None, ge=1)


class CatalogItemResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    item_type: ItemType
    price: int
    is_active: bool
    duration_minutes: int | None
    session_count: int | None

    model_config = ConfigDict(from_attributes=True)
