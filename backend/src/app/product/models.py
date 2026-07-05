"""Product — Database Models"""

import uuid
from sqlalchemy import String, Boolean, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class ProductModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Financials
    selling_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    cost_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.0) # e.g. 18.00 for 18%
    
    # Metadata
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    category = relationship("CategoryModel")
