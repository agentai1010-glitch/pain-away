"""Warehouse — Database Models"""

import uuid
from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class WarehouseModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "warehouses"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
