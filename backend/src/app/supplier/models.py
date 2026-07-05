"""Supplier — Database Models"""

import uuid
from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class SupplierModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "suppliers"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    contact_person: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gst_number: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    payment_terms: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
