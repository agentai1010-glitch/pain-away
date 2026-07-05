"""Purchase Order — Database Models"""

import uuid
import enum
from sqlalchemy import Integer, String, Float, ForeignKey, Text, Enum, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class PurchaseOrderStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED"
    FULLY_RECEIVED = "FULLY_RECEIVED"
    CANCELLED = "CANCELLED"

class PurchaseOrderModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "purchase_orders"

    po_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    supplier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('suppliers.id'), nullable=False, index=True)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('warehouses.id'), nullable=False, index=True)
    
    order_date: Mapped[str] = mapped_column(Date, nullable=False)
    expected_delivery_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    status: Mapped[PurchaseOrderStatusEnum] = mapped_column(Enum(PurchaseOrderStatusEnum), default=PurchaseOrderStatusEnum.DRAFT, nullable=False)
    
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    subtotal: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tax_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    grand_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    supplier = relationship("SupplierModel", lazy="joined")
    warehouse = relationship("WarehouseModel", lazy="joined")
    items = relationship("PurchaseOrderItemModel", back_populates="purchase_order", cascade="all, delete-orphan", lazy="joined")

class PurchaseOrderItemModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "purchase_order_items"

    po_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('purchase_orders.id'), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False, index=True)
    
    ordered_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_cost: Mapped[float] = mapped_column(Float, nullable=False)
    tax_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    line_total: Mapped[float] = mapped_column(Float, nullable=False)

    purchase_order = relationship("PurchaseOrderModel", back_populates="items")
    product = relationship("ProductModel", lazy="joined")
