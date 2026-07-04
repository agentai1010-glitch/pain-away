"""Billing — Data Access"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.billing.models import PaymentModel, BookingReceiptModel


class BillingRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_payment_with_receipt(self, payment: PaymentModel, receipt: BookingReceiptModel) -> PaymentModel:
        """Persist payment and receipt in a single transaction."""
        self.session.add(payment)
        self.session.add(receipt)
        await self.session.flush()
        # Refresh to load relationships if needed, though they are populated via back_populates
        return payment

    async def create_payment_with_final_bill(self, payment: PaymentModel, final_bill) -> PaymentModel:
        """Persist payment and final bill in a single transaction."""
        self.session.add(payment)
        self.session.add(final_bill)
        await self.session.flush()
        return payment

    async def get_receipt_for_appointment(self, patient_id, catalog_item_id) -> BookingReceiptModel | None:
        """Find the receipt for this appointment using patient and catalog info."""
        # Simple lookup: most recent receipt for this patient + catalog
        from sqlalchemy import select
        stmt = select(BookingReceiptModel).where(
            BookingReceiptModel.patient_id == patient_id,
            BookingReceiptModel.catalog_item_id == catalog_item_id
        ).order_by(BookingReceiptModel.created_at.desc())
        
        result = await self.session.execute(stmt)
        return result.scalars().first()
