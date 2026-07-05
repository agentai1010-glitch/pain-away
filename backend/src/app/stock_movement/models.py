"""Stock Movement — Database Models"""

import uuid
import enum
from sqlalchemy import Integer, String, ForeignKey, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class MovementTypeEnum(str, enum.Enum):
    OPENING_STOCK = "OPENING_STOCK"
    GOODS_RECEIVED = "GOODS_RECEIVED"
    RESERVATION = "RESERVATION"
    RESERVATION_RELEASED = "RESERVATION_RELEASED"
    SALE = "SALE"
    ADJUSTMENT = "ADJUSTMENT"
    RETURN = "RETURN"

class StockMovementModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "stock_movements"

    reference_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False, index=True)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('warehouses.id'), nullable=False, index=True)
    
    movement_type: Mapped[MovementTypeEnum] = mapped_column(Enum(MovementTypeEnum), nullable=False)
    quantity_changed: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_before: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    
    reference_source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    product = relationship("ProductModel", lazy="joined")
    warehouse = relationship("WarehouseModel", lazy="joined")
