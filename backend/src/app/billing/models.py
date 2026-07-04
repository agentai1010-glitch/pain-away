"""Billing — Database Models"""

import uuid
from sqlalchemy import String, Integer, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from enum import Enum as PyEnum

class PaymentStatus(str, PyEnum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class BillingDocumentType(str, PyEnum):
    BOOKING_RECEIPT = "BOOKING_RECEIPT"
    FINAL_BILL = "FINAL_BILL"

class PaymentType(str, PyEnum):
    ADVANCE = "ADVANCE"
    BALANCE = "BALANCE"
    FULL = "FULL"

class PaymentModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a Payment."""

    __tablename__ = "payments"

    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_type: Mapped[PaymentType] = mapped_column(Enum(PaymentType), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), nullable=False)
    transaction_reference: Mapped[str] = mapped_column(String(255), nullable=True)
    is_non_refundable: Mapped[bool] = mapped_column(default=True, nullable=False)

    receipt = relationship("BookingReceiptModel", back_populates="payment", uselist=False)
    final_bill = relationship("FinalBillModel", back_populates="payment", uselist=False)

class BillingDocumentModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a Billing Document (Receipt or Final Bill)."""
    
    __tablename__ = "billing_documents"
    
    document_type: Mapped[BillingDocumentType] = mapped_column(Enum(BillingDocumentType), nullable=False)
    document_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    generated_date: Mapped[str] = mapped_column(String(20), nullable=False)
    generated_time: Mapped[str] = mapped_column(String(20), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    appointment_id: Mapped[uuid.UUID] = mapped_column(nullable=True)
    document_path: Mapped[str] = mapped_column(String(500), nullable=False)


class BookingReceiptModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a Booking Receipt."""

    __tablename__ = "booking_receipts"

    payment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("payments.id"), nullable=False)
    receipt_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("billing_documents.id"), nullable=True)
    
    # Snapshot of data since Billing doesn't directly join other domains
    patient_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    catalog_item_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    catalog_item_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    advance_paid: Mapped[int] = mapped_column(Integer, nullable=False)
    remaining_amount: Mapped[int] = mapped_column(Integer, nullable=False)

    payment = relationship("PaymentModel", back_populates="receipt")

class FinalBillModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a Final Bill."""

    __tablename__ = "final_bills"

    payment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("payments.id"), nullable=False, unique=True)
    bill_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("billing_documents.id"), nullable=True)
    appointment_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    
    patient_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    catalog_item_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    catalog_item_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    advance_paid: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_paid: Mapped[int] = mapped_column(Integer, nullable=False)

    payment = relationship("PaymentModel", back_populates="final_bill")
