"""Inventory — Database Models"""

import uuid
from sqlalchemy import Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class InventoryModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "inventory"
    __table_args__ = (
        UniqueConstraint('product_id', 'warehouse_id', name='uq_inventory_product_warehouse'),
    )

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False, index=True)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('warehouses.id'), nullable=False, index=True)
    
    current_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reorder_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product = relationship("ProductModel", lazy="joined")
    warehouse = relationship("WarehouseModel", lazy="joined")

    @property
    def available_quantity(self) -> int:
        return max(0, self.current_quantity - self.reserved_quantity)
