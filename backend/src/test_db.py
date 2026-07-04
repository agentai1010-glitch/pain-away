import asyncio
from sqlalchemy import select
from app.db.session import async_session_factory
from app.billing.models import BookingReceiptModel, FinalBillModel, BillingDocumentModel
from app.scheduling.models import AppointmentModel
from app.patient.models import PatientModel

async def main():
    async with async_session_factory() as session:
        # Find Pravin
        res = await session.execute(select(PatientModel).where(PatientModel.first_name == 'Pravin'))
        patient = res.scalars().first()
        if not patient:
            print("Pravin not found")
            return
            
        print(f"Patient ID: {patient.id}")
        
        res = await session.execute(select(AppointmentModel).where(AppointmentModel.patient_id == patient.id))
        apts = res.scalars().all()
        for apt in apts:
            print(f"Apt: {apt.id}, Receipt: {apt.receipt_number}")
            if apt.receipt_number:
                res = await session.execute(select(BookingReceiptModel).where(BookingReceiptModel.receipt_number == apt.receipt_number))
                receipt = res.scalars().first()
                if receipt:
                    print(f"  -> Receipt Model: doc_id={receipt.document_id}")
                else:
                    print("  -> Receipt Model NOT FOUND in DB for this receipt_number!")

if __name__ == '__main__':
    asyncio.run(main())
