import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import StaticPool

from app.db.base import Base
from app.billing.service import BillingService
from app.billing.schemas import AdvancePaymentRequest
from app.billing.models import PaymentType, PaymentStatus

async def run_test():
    # Setup isolated SQLite in-memory database
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
    )
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Scenario 1: Process Advance Payment
    async with async_session() as session:
        service = BillingService(session)
        
        patient_id = uuid.uuid4()
        catalog_item_id = uuid.uuid4()
        
        payment_data = AdvancePaymentRequest(
            patient_id=patient_id,
            patient_name="Rahul Patil",
            catalog_item_id=catalog_item_id,
            catalog_item_name="Back Pain",
            total_amount=1000,
            advance_amount=500,
            transaction_reference="TXN-12345"
        )
        
        response = await service.process_advance_payment(payment_data)
        await session.commit()
        
        assert response.payment_type == PaymentType.ADVANCE, "Payment should be marked as ADVANCE"
        assert response.amount == 500, "Advance amount mismatch"
        assert response.status == PaymentStatus.SUCCESS, "Payment status should be SUCCESS"
        
        receipt = response.receipt
        assert receipt is not None, "Receipt must be generated"
        assert receipt.patient_name == "Rahul Patil", "Patient info missing from receipt"
        assert receipt.catalog_item_name == "Back Pain", "Service info missing from receipt"
        assert receipt.total_amount == 1000, "Total amount mismatch"
        assert receipt.advance_paid == 500, "Advance paid mismatch"
        assert receipt.remaining_amount == 500, "Remaining amount calculation failed"
        assert receipt.receipt_number.startswith("REC-"), "Invalid receipt format"
        
if __name__ == "__main__":
    asyncio.run(run_test())
    print("PASS")
