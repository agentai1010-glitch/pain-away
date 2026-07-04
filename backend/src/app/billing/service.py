"""Billing — Business Logic"""

import uuid
import os
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.billing.repository import BillingRepository
from app.billing.schemas import AdvancePaymentRequest, PaymentResponse
from app.billing.models import PaymentModel, BookingReceiptModel, FinalBillModel, PaymentStatus, PaymentType, BillingDocumentModel, BillingDocumentType
from app.billing.domain import generate_receipt_number, calculate_remaining_amount
from app.billing.schemas import AdvancePaymentRequest, PaymentResponse, CheckoutRequest, CheckoutResponse, FinancialSummaryResponse, FinalBillResponse
from app.billing.document_service import DocumentService
from app.shared.constants import IST
import datetime


class BillingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = BillingRepository(session)

    async def process_advance_payment(self, data: AdvancePaymentRequest) -> PaymentResponse:
        """Process an advance payment and generate a receipt."""
        
        # Rule: Public booking always requires advance payment > 0
        if data.is_public_booking and data.advance_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Public bookings require an advance payment."
            )
            
        remaining = calculate_remaining_amount(data.total_amount, data.advance_amount)
        
        # Create Payment Record (Non-refundable)
        payment_id = uuid.uuid4()
        payment = PaymentModel(
            id=payment_id,
            amount=data.advance_amount,
            payment_type=PaymentType.ADVANCE,
            status=PaymentStatus.SUCCESS, # Assuming payment gateway succeeded before calling this
            transaction_reference=data.transaction_reference,
            is_non_refundable=True
        )
        receipt_number = generate_receipt_number()
        
        now = datetime.datetime.now(IST)
        generated_date = now.strftime("%Y-%m-%d")
        generated_time = now.strftime("%H:%M:%S")

        doc_path = DocumentService.generate_receipt_document(
            document_number=receipt_number,
            generated_date=generated_date,
            generated_time=generated_time,
            patient_name=data.patient_name,
            catalog_item_name=data.catalog_item_name,
            total_amount=data.total_amount,
            advance_paid=data.advance_amount,
            remaining_amount=remaining
        )

        doc_id = uuid.uuid4()
        billing_doc = BillingDocumentModel(
            id=doc_id,
            document_type=BillingDocumentType.BOOKING_RECEIPT,
            document_number=receipt_number,
            generated_date=generated_date,
            generated_time=generated_time,
            patient_id=data.patient_id,
            appointment_id=None, # Appointment not created yet
            document_path=doc_path
        )
        
        self.session.add(billing_doc)

        # Create Receipt Record
        receipt = BookingReceiptModel(
            id=uuid.uuid4(),
            payment_id=payment_id,
            receipt_number=receipt_number,
            document_id=doc_id,
            patient_id=data.patient_id,
            patient_name=data.patient_name,
            catalog_item_id=data.catalog_item_id,
            catalog_item_name=data.catalog_item_name,
            total_amount=data.total_amount,
            advance_paid=data.advance_amount,
            remaining_amount=remaining
        )
        
        await self.repository.create_payment_with_receipt(payment, receipt)
        payment.receipt = receipt
        
        return PaymentResponse.model_validate(payment)

    async def get_financial_summary(self, patient_id, catalog_item_id) -> FinancialSummaryResponse:
        """Get the financial summary based on the advance receipt."""
        receipt = await self.repository.get_receipt_for_appointment(patient_id, catalog_item_id)
        if not receipt:
            raise HTTPException(status_code=404, detail="Booking receipt not found.")
            
        status_text = "Pending" if receipt.remaining_amount > 0 else "Paid in Full"
            
        return FinancialSummaryResponse(
            catalog_item_name=receipt.catalog_item_name,
            total_amount=receipt.total_amount,
            advance_paid=receipt.advance_paid,
            remaining_amount=receipt.remaining_amount,
            payment_status=status_text
        )

    async def process_checkout(self, request: CheckoutRequest, patient_name: str, catalog_item_name: str, patient_id, catalog_item_id) -> CheckoutResponse:
        """Process checkout, collect balance, generate final bill."""
        receipt = await self.repository.get_receipt_for_appointment(patient_id, catalog_item_id)
        if not receipt:
            raise HTTPException(status_code=404, detail="Booking receipt not found.")
            
        # Create Payment Record (Balance)
        payment_id = uuid.uuid4()
        payment = PaymentModel(
            id=payment_id,
            amount=receipt.remaining_amount,
            payment_type=PaymentType.BALANCE,
            status=PaymentStatus.SUCCESS,
            transaction_reference=f"Reception-Checkout-{request.payment_method}",
            is_non_refundable=True
        )
        
        # Create Final Bill Record
        receipt_num = generate_receipt_number()
        bill_number = f"BILL-{receipt_num.split('-', 1)[1]}"

        now = datetime.datetime.now(IST)
        generated_date = now.strftime("%Y-%m-%d")
        generated_time = now.strftime("%H:%M:%S")

        doc_path = DocumentService.generate_final_bill_document(
            document_number=bill_number,
            generated_date=generated_date,
            generated_time=generated_time,
            patient_name=patient_name,
            catalog_item_name=catalog_item_name,
            total_amount=receipt.total_amount,
            advance_paid=receipt.advance_paid,
            balance_paid=receipt.remaining_amount
        )

        doc_id = uuid.uuid4()
        billing_doc = BillingDocumentModel(
            id=doc_id,
            document_type=BillingDocumentType.FINAL_BILL,
            document_number=bill_number,
            generated_date=generated_date,
            generated_time=generated_time,
            patient_id=patient_id,
            appointment_id=request.appointment_id,
            document_path=doc_path
        )

        self.session.add(billing_doc)

        final_bill = FinalBillModel(
            id=uuid.uuid4(),
            payment_id=payment_id,
            bill_number=bill_number,
            document_id=doc_id,
            appointment_id=request.appointment_id,
            patient_id=patient_id,
            patient_name=patient_name,
            catalog_item_id=catalog_item_id,
            catalog_item_name=catalog_item_name,
            total_amount=receipt.total_amount,
            advance_paid=receipt.advance_paid,
            balance_paid=receipt.remaining_amount
        )
        
        await self.repository.create_payment_with_final_bill(payment, final_bill)
        
        final_bill_response = FinalBillResponse.model_validate(final_bill)
        
        return CheckoutResponse(
            final_bill=final_bill_response,
            status="SUCCESS"
        )

    async def get_document_path(self, document_id: str) -> str | None:
        """Fetch the document path by ID and return the absolute path."""
        stmt = select(BillingDocumentModel).where(BillingDocumentModel.id == uuid.UUID(document_id))
        result = await self.session.execute(stmt)
        doc = result.scalars().first()
        if doc:
            doc_path = Path(doc.document_path)
            if not doc_path.is_absolute():
                # Resolve relative to the backend/src working directory
                doc_path = Path(__file__).resolve().parent.parent.parent / doc_path
            if doc_path.exists():
                return str(doc_path)
        return None

    async def transfer_advance_payment(self, original_receipt_number: str, new_receipt_number: str, new_patient_id: uuid.UUID) -> BookingReceiptModel:
        """Transfer an existing advance payment to a new booking receipt."""
        # 1. Locate original receipt
        orig_receipt = await self.session.execute(
            select(BookingReceiptModel).where(BookingReceiptModel.receipt_number == original_receipt_number)
        )
        original = orig_receipt.scalars().first()
        if not original:
            raise HTTPException(status_code=404, detail="Original booking receipt not found.")

        # 2. Create new booking receipt document
        now = datetime.datetime.now(IST)
        generated_date = now.strftime("%Y-%m-%d")
        generated_time = now.strftime("%H:%M:%S")

        doc_path = DocumentService.generate_receipt_document(
            document_number=new_receipt_number,
            generated_date=generated_date,
            generated_time=generated_time,
            patient_name=original.patient_name,
            catalog_item_name=original.catalog_item_name,
            total_amount=original.total_amount,
            advance_paid=original.advance_paid,
            remaining_amount=original.remaining_amount
        )

        doc_id = uuid.uuid4()
        billing_doc = BillingDocumentModel(
            id=doc_id,
            document_type=BillingDocumentType.BOOKING_RECEIPT,
            document_number=new_receipt_number,
            generated_date=generated_date,
            generated_time=generated_time,
            patient_id=new_patient_id,
            appointment_id=None,
            document_path=doc_path
        )
        self.session.add(billing_doc)

        # 3. Create BookingReceiptModel referencing the SAME payment_id (transfer)
        new_receipt = BookingReceiptModel(
            id=uuid.uuid4(),
            payment_id=original.payment_id,
            receipt_number=new_receipt_number,
            document_id=doc_id,
            patient_id=new_patient_id,
            patient_name=original.patient_name,
            catalog_item_id=original.catalog_item_id,
            catalog_item_name=original.catalog_item_name,
            total_amount=original.total_amount,
            advance_paid=original.advance_paid,
            remaining_amount=original.remaining_amount
        )
        self.session.add(new_receipt)
        await self.session.flush()

        return new_receipt

