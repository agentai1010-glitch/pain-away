import asyncio
from app.db.session import async_session_factory
from sqlalchemy import select, text

async def main():
    async with async_session_factory() as session:
        # 1. Get Pravin Tarde's appointments
        result = await session.execute(text("""
            SELECT a.id, a.date, a.start_time, a.status, a.receipt_number, a.patient_id, a.catalog_item_id
            FROM appointments a
            WHERE a.patient_id = '7b6964cb-2362-4794-9f79-bb701b5bda75'
            ORDER BY a.date DESC
        """))
        rows = result.fetchall()
        print("=== APPOINTMENTS ===")
        for r in rows:
            print(f"  id={r[0]}, date={r[1]}, time={r[2]}, status={r[3]}, receipt_number={r[4]}")
        
        # 2. Get booking receipts for this patient
        result2 = await session.execute(text("""
            SELECT br.id, br.receipt_number, br.document_id, br.patient_id, br.catalog_item_id
            FROM booking_receipts br
            WHERE br.patient_id = '7b6964cb-2362-4794-9f79-bb701b5bda75'
        """))
        rows2 = result2.fetchall()
        print("\n=== BOOKING RECEIPTS ===")
        for r in rows2:
            print(f"  id={r[0]}, receipt_number={r[1]}, document_id={r[2]}, patient_id={r[3]}")
        
        # 3. Get final bills for this patient
        result3 = await session.execute(text("""
            SELECT fb.id, fb.bill_number, fb.document_id, fb.appointment_id, fb.patient_id
            FROM final_bills fb
            WHERE fb.patient_id = '7b6964cb-2362-4794-9f79-bb701b5bda75'
        """))
        rows3 = result3.fetchall()
        print("\n=== FINAL BILLS ===")
        for r in rows3:
            print(f"  id={r[0]}, bill_number={r[1]}, document_id={r[2]}, appointment_id={r[3]}")
        
        # 4. Get billing documents for this patient
        result4 = await session.execute(text("""
            SELECT bd.id, bd.document_type, bd.document_number, bd.patient_id, bd.appointment_id
            FROM billing_documents bd
            WHERE bd.patient_id = '7b6964cb-2362-4794-9f79-bb701b5bda75'
        """))
        rows4 = result4.fetchall()
        print("\n=== BILLING DOCUMENTS ===")
        for r in rows4:
            print(f"  id={r[0]}, type={r[1]}, number={r[2]}, patient_id={r[3]}, appointment_id={r[4]}")

        # 5. Now simulate what get_patient_workspace does
        print("\n=== SIMULATING get_patient_workspace ===")
        if rows:
            apt_row = rows[0]
            apt_id = apt_row[0]
            receipt_number = apt_row[4]
            apt_status = apt_row[3]
            print(f"Appointment: id={apt_id}, status={apt_status}, receipt_number='{receipt_number}'")
            
            if receipt_number:
                res = await session.execute(text("""
                    SELECT document_id FROM booking_receipts WHERE receipt_number = :rn
                """), {"rn": receipt_number})
                doc_id = res.scalar()
                print(f"  Receipt document_id from booking_receipts: {doc_id}")
            else:
                print("  No receipt_number on appointment!")
            
            if apt_status == 'COMPLETED':
                res2 = await session.execute(text("""
                    SELECT document_id FROM final_bills WHERE appointment_id = :aid
                """), {"aid": str(apt_id)})
                fb_doc_id = res2.scalar()
                print(f"  Final bill document_id from final_bills: {fb_doc_id}")

if __name__ == '__main__':
    asyncio.run(main())
