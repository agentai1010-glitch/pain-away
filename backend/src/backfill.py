import asyncio
from sqlalchemy import select
from app.billing.models import BookingReceiptModel, FinalBillModel, BillingDocumentModel, BillingDocumentType
from app.billing.document_service import DocumentService
import uuid
import datetime
from app.db.session import async_session_factory as async_session

async def main():
    async with async_session() as session:
        # Backfill Receipts
        res = await session.execute(select(BookingReceiptModel).where(BookingReceiptModel.document_id == None))
        receipts = res.scalars().all()
        for receipt in receipts:
            doc_id = uuid.uuid4()
            now = datetime.datetime.now()
            g_date = now.strftime('%Y-%m-%d')
            g_time = now.strftime('%H:%M:%S')
            doc_path = DocumentService.generate_receipt_document(receipt.receipt_number, g_date, g_time, receipt.patient_name, receipt.catalog_item_name, receipt.total_amount, receipt.advance_paid, receipt.remaining_amount)
            b_doc = BillingDocumentModel(id=doc_id, document_type=BillingDocumentType.BOOKING_RECEIPT, document_number=receipt.receipt_number, generated_date=g_date, generated_time=g_time, patient_id=receipt.patient_id, appointment_id=None, document_path=doc_path)
            session.add(b_doc)
            receipt.document_id = doc_id
        
        # Backfill Final Bills
        res = await session.execute(select(FinalBillModel).where(FinalBillModel.document_id == None))
        bills = res.scalars().all()
        for bill in bills:
            doc_id = uuid.uuid4()
            now = datetime.datetime.now()
            g_date = now.strftime('%Y-%m-%d')
            g_time = now.strftime('%H:%M:%S')
            doc_path = DocumentService.generate_final_bill_document(bill.bill_number, g_date, g_time, bill.patient_name, bill.catalog_item_name, bill.total_amount, bill.advance_paid, bill.balance_paid)
            b_doc = BillingDocumentModel(id=doc_id, document_type=BillingDocumentType.FINAL_BILL, document_number=bill.bill_number, generated_date=g_date, generated_time=g_time, patient_id=bill.patient_id, appointment_id=bill.appointment_id, document_path=doc_path)
            session.add(b_doc)
            bill.document_id = doc_id
            
        await session.commit()
        print("Backfill completed.")

if __name__ == '__main__':
    asyncio.run(main())
