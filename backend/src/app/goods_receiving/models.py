"""Goods Receiving — Database Models"""

import uuid
from sqlalchemy import Integer, String, Float, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class GoodsReceiptModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "goods_receipts"

    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    po_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('purchase_orders.id'), nullable=False, index=True)
    supplier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('suppliers.id'), nullable=False, index=True)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('warehouses.id'), nullable=False, index=True)
    
    received_date: Mapped[str] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    purchase_order = relationship("PurchaseOrderModel", lazy="joined")
    supplier = relationship("SupplierModel", lazy="joined")
    warehouse = relationship("WarehouseModel", lazy="joined")
    items = relationship("GoodsReceiptItemModel", back_populates="receipt", cascade="all, delete-orphan", lazy="joined")

class GoodsReceiptItemModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "goods_receipt_items"

    receipt_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('goods_receipts.id'), nullable=False, index=True)
    po_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('purchase_order_items.id'), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False, index=True)
    
    ordered_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    received_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    accepted_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    line_status: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "COMPLETE", "PARTIAL"

    receipt = relationship("GoodsReceiptModel", back_populates="items")
    product = relationship("ProductModel", lazy="joined")
    po_item = relationship("PurchaseOrderItemModel", lazy="joined")
