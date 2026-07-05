import datetime
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.auth.models import User
from app.patient.models import PatientModel
from app.scheduling.models import AppointmentModel
from app.scheduling.domain import AppointmentStatus
from app.customer_order.models import CustomerOrderModel, CustomerOrderItemModel
from app.product.models import ProductModel
from app.billing.models import BillingDocumentModel, BillingDocumentType, BookingReceiptModel, FinalBillModel
from sqlalchemy.orm import selectinload

from .schemas import PatientDashboardResponse, TimelineActivity, PatientAppointmentResponse, PatientOrderResponse, PatientOrderItemResponse, PatientDocumentResponse

class PatientPortalService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_dashboard_summary(self, user: User) -> PatientDashboardResponse:
        # User details
        patient_name = "Guest"
        mobile_number = user.mobile_number
        patient_id = user.patient_id
        
        # If patient_id is not linked but user exists, try looking up by mobile number
        if not patient_id:
            stmt = select(PatientModel).where(PatientModel.mobile_number == mobile_number)
            res = await self.db.execute(stmt)
            patient = res.scalars().first()
            if patient:
                patient_id = patient.id
                patient_name = f"{patient.first_name} {patient.last_name}"
        else:
            # Fetch patient name
            stmt = select(PatientModel).where(PatientModel.id == patient_id)
            res = await self.db.execute(stmt)
            patient = res.scalars().first()
            if patient:
                patient_name = f"{patient.first_name} {patient.last_name}"
                
        # 1. Total Appointments
        total_appointments = 0
        upcoming_appt = None
        if patient_id:
            stmt = select(func.count(AppointmentModel.id)).where(AppointmentModel.patient_id == patient_id)
            res = await self.db.execute(stmt)
            total_appointments = res.scalar() or 0
            
            today = datetime.date.today()
            stmt = select(AppointmentModel).where(
                AppointmentModel.patient_id == patient_id,
                AppointmentModel.date >= today,
                AppointmentModel.status == AppointmentStatus.BOOKED
            ).order_by(AppointmentModel.date, AppointmentModel.start_time).limit(1)
            res = await self.db.execute(stmt)
            upcoming_appt = res.scalars().first()
            
        # 2. Total Orders
        stmt = select(func.count(CustomerOrderModel.id)).where(CustomerOrderModel.customer_phone == mobile_number)
        res = await self.db.execute(stmt)
        total_orders = res.scalar() or 0
        
        # 3. Available Receipts & Bills
        available_receipts = 0
        available_bills = 0
        if patient_id:
            stmt = select(BillingDocumentModel.document_type, func.count(BillingDocumentModel.id))\
                .where(BillingDocumentModel.patient_id == patient_id)\
                .group_by(BillingDocumentModel.document_type)
            res = await self.db.execute(stmt)
            for doc_type, count in res.all():
                if doc_type == BillingDocumentType.BOOKING_RECEIPT:
                    available_receipts = count
                elif doc_type == BillingDocumentType.FINAL_BILL:
                    available_bills = count
                    
        # 4. Recent Activity (Chronological Timeline)
        activities: List[TimelineActivity] = []
        
        if patient_id:
            # Appointments
            stmt = select(AppointmentModel).where(AppointmentModel.patient_id == patient_id).order_by(desc(AppointmentModel.created_at)).limit(5)
            res = await self.db.execute(stmt)
            for appt in res.scalars().all():
                activities.append(TimelineActivity(
                    title=f"Appointment {appt.status.value.title()}",
                    description=f"Scheduled for {appt.date} at {appt.start_time}",
                    timestamp=appt.created_at.isoformat() if appt.created_at else "",
                    activity_type="APPOINTMENT"
                ))
                
            # Bills / Receipts
            stmt = select(BillingDocumentModel).where(BillingDocumentModel.patient_id == patient_id).order_by(desc(BillingDocumentModel.created_at)).limit(5)
            res = await self.db.execute(stmt)
            for doc in res.scalars().all():
                doc_type_str = "Receipt" if doc.document_type == BillingDocumentType.BOOKING_RECEIPT else "Final Bill"
                activities.append(TimelineActivity(
                    title=f"{doc_type_str} Generated",
                    description=f"Document Number: {doc.document_number}",
                    timestamp=doc.created_at.isoformat() if doc.created_at else "",
                    activity_type="RECEIPT" if doc.document_type == BillingDocumentType.BOOKING_RECEIPT else "BILL"
                ))
                
        # Orders
        stmt = select(CustomerOrderModel).where(CustomerOrderModel.customer_phone == mobile_number).order_by(desc(CustomerOrderModel.created_at)).limit(5)
        res = await self.db.execute(stmt)
        for order in res.scalars().all():
            activities.append(TimelineActivity(
                title=f"Product Order {order.status.value.title()}",
                description=f"Order Number: {order.order_number}",
                timestamp=order.created_at.isoformat() if order.created_at else "",
                activity_type="ORDER"
            ))
            
        # Sort and limit activities
        activities.sort(key=lambda x: x.timestamp, reverse=True)
        activities = activities[:10]
        
        return PatientDashboardResponse(
            patient_name=patient_name,
            mobile_number=mobile_number,
            total_appointments=total_appointments,
            total_orders=total_orders,
            available_receipts=available_receipts,
            available_bills=available_bills,
            upcoming_appointment_date=str(upcoming_appt.date) if upcoming_appt else None,
            upcoming_appointment_time=str(upcoming_appt.start_time) if upcoming_appt else None,
            recent_activity=activities
        )

    async def get_patient_appointments(self, user: User) -> List[PatientAppointmentResponse]:
        patient_id = user.patient_id
        if not patient_id:
            stmt = select(PatientModel).where(PatientModel.mobile_number == user.mobile_number)
            res = await self.db.execute(stmt)
            patient = res.scalars().first()
            if patient:
                patient_id = patient.id
                
        if not patient_id:
            return []
            
        stmt = select(AppointmentModel).where(AppointmentModel.patient_id == patient_id).order_by(desc(AppointmentModel.date), desc(AppointmentModel.start_time))
        res = await self.db.execute(stmt)
        appointments = res.scalars().all()
        
        results: List[PatientAppointmentResponse] = []
        
        for appt in appointments:
            service_name = "Consultation"
            advance_paid = 0
            remaining_amount = None
            receipt_number = appt.receipt_number
            final_bill_number = None
            
            # Fetch Booking Receipt
            if receipt_number:
                stmt_receipt = select(BookingReceiptModel).where(BookingReceiptModel.receipt_number == receipt_number)
                res_receipt = await self.db.execute(stmt_receipt)
                receipt = res_receipt.scalars().first()
                if receipt:
                    service_name = receipt.catalog_item_name
                    advance_paid = receipt.advance_paid
                    remaining_amount = receipt.remaining_amount
                    
            # Fetch Final Bill if completed
            if appt.status == AppointmentStatus.COMPLETED:
                stmt_bill = select(FinalBillModel).where(FinalBillModel.appointment_id == appt.id)
                res_bill = await self.db.execute(stmt_bill)
                bill = res_bill.scalars().first()
                if bill:
                    final_bill_number = bill.bill_number
                    
            results.append(PatientAppointmentResponse(
                id=str(appt.id),
                service_name=service_name,
                date=str(appt.date),
                time=str(appt.start_time),
                status=appt.status.value,
                booking_date=appt.created_at.isoformat() if appt.created_at else "",
                advance_paid=advance_paid,
                remaining_amount=remaining_amount,
                receipt_number=receipt_number,
                final_bill_number=final_bill_number
            ))
            
        return results

    async def get_patient_orders(self, user: User) -> List[PatientOrderResponse]:
        mobile_number = user.mobile_number
        
        # We need to fetch orders for this phone number, including their items and products
        stmt = (
            select(CustomerOrderModel)
            .where(CustomerOrderModel.customer_phone == mobile_number)
            .options(
                selectinload(CustomerOrderModel.items).selectinload(CustomerOrderItemModel.product)
            )
            .order_by(desc(CustomerOrderModel.order_date), desc(CustomerOrderModel.created_at))
        )
        
        res = await self.db.execute(stmt)
        orders = res.scalars().all()
        
        results: List[PatientOrderResponse] = []
        for order in orders:
            items_res = []
            for item in order.items:
                items_res.append(PatientOrderItemResponse(
                    id=str(item.id),
                    product_name=item.product_name,
                    product_image=item.product.image_url if item.product else None,
                    ordered_quantity=item.ordered_quantity,
                    selling_price=float(item.selling_price),
                    line_total=float(item.line_total)
                ))
                
            results.append(PatientOrderResponse(
                id=str(order.id),
                order_number=order.order_number,
                order_date=str(order.order_date),
                status=order.status.value,
                grand_total=float(order.grand_total),
                items=items_res
            ))
            
        return results

    async def get_patient_documents(self, user: User) -> List[PatientDocumentResponse]:
        patient_id = user.patient_id
        if not patient_id:
            stmt = select(PatientModel).where(PatientModel.mobile_number == user.mobile_number)
            res = await self.db.execute(stmt)
            patient = res.scalars().first()
            if patient:
                patient_id = patient.id
                
        if not patient_id:
            return []
            
        stmt = select(BillingDocumentModel).where(BillingDocumentModel.patient_id == patient_id).order_by(desc(BillingDocumentModel.created_at))
        res = await self.db.execute(stmt)
        documents = res.scalars().all()
        
        results: List[PatientDocumentResponse] = []
        
        for doc in documents:
            service_name = None
            total_amount = None
            advance_paid = None
            remaining_amount = None
            balance_paid = None
            
            if doc.document_type == BillingDocumentType.BOOKING_RECEIPT:
                stmt_receipt = select(BookingReceiptModel).where(BookingReceiptModel.document_id == doc.id)
                res_receipt = await self.db.execute(stmt_receipt)
                receipt = res_receipt.scalars().first()
                if receipt:
                    service_name = receipt.catalog_item_name
                    total_amount = receipt.total_amount
                    advance_paid = receipt.advance_paid
                    remaining_amount = receipt.remaining_amount
            elif doc.document_type == BillingDocumentType.FINAL_BILL:
                stmt_bill = select(FinalBillModel).where(FinalBillModel.document_id == doc.id)
                res_bill = await self.db.execute(stmt_bill)
                bill = res_bill.scalars().first()
                if bill:
                    service_name = bill.catalog_item_name
                    total_amount = bill.total_amount
                    advance_paid = bill.advance_paid
                    balance_paid = bill.balance_paid
                    
            results.append(PatientDocumentResponse(
                id=str(doc.id),
                document_type=doc.document_type.value,
                document_number=doc.document_number,
                generated_date=doc.generated_date,
                generated_time=doc.generated_time,
                document_path=doc.document_path,
                appointment_id=str(doc.appointment_id) if doc.appointment_id else None,
                service_name=service_name,
                total_amount=total_amount,
                advance_paid=advance_paid,
                remaining_amount=remaining_amount,
                balance_paid=balance_paid
            ))
            
        return results
