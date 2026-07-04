"""Catalog — Database Models"""

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.catalog.domain import ItemType


class CatalogItemModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a catalog item (Service, Package, or Product)."""

    __tablename__ = "catalog_items"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    item_type: Mapped[ItemType] = mapped_column(Enum(ItemType), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # Stored in lowest denomination (e.g., paise or rupees depending on rule, let's use integers for rupees here since it's India. To be safe, just standard integer representing Rupee.)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # For packages: number of sessions included
    session_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
