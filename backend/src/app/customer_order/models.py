import enum
import uuid
from sqlalchemy import String, Float, ForeignKey, DateTime, Enum, Integer, Date, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class OrderStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class CustomerOrderModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "customer_orders"

    order_number: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(255), nullable=False)
    order_date: Mapped[Date] = mapped_column(Date, nullable=False)
    status: Mapped[OrderStatusEnum] = mapped_column(Enum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.DRAFT)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    tax_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    grand_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    
    created_by: Mapped[str] = mapped_column(String(255), nullable=False)
    
    items = relationship("CustomerOrderItemModel", back_populates="order", cascade="all, delete-orphan")


class CustomerOrderItemModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "customer_order_items"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customer_orders.id"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Immutable snapshots
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(255), nullable=False)
    selling_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    
    ordered_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order = relationship("CustomerOrderModel", back_populates="items")
    product = relationship("ProductModel")
