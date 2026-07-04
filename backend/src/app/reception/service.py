"""Reception — Business Logic"""

import jwt
import datetime
from fastapi import HTTPException, status
from app.reception.schemas import LoginRequest, TokenResponse, ScheduleResponse, QueueItemResponse, PatientSearchResponse, PatientWorkspaceResponse, PatientAppointmentHistoryItem, ReceptionBookingRequest, AppointmentSearchItem
from app.orchestration.service import PublicBookingOrchestrator
from app.orchestration.schemas import BookingConfirmation
from app.scheduling.service import SchedulingService
from app.patient.service import PatientService
from app.billing.service import BillingService
from app.billing.schemas import FinancialSummaryResponse, CheckoutRequest, CheckoutResponse
from app.catalog.service import CatalogService
from app.shared.constants import IST
from sqlalchemy.ext.asyncio import AsyncSession

SECRET_KEY = "SUPER_SECRET_RECEPTION_KEY"
ALGORITHM = "HS256"

class ReceptionService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.scheduling_service = SchedulingService(session)
        self.patient_service = PatientService(session)
        self.catalog_service = CatalogService(session)
        self.billing_service = BillingService(session)

    @staticmethod
    def authenticate(request: LoginRequest) -> TokenResponse:
        # Hardcoded for Milestone 2 Reception Capability 1 as per rules (no DB changes required)
        if request.username == "admin" and request.password == "admin123":
            payload = {
                "sub": request.username,
                "role": "reception",
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
            return TokenResponse(access_token=token, token_type="bearer")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    async def get_schedule(self, target_date_str: str | None = None) -> ScheduleResponse:
        """Fetch schedule queue generated from confirmed appointments for a specific date."""
        now = datetime.datetime.now(IST)
        
        if target_date_str:
            target_date = datetime.datetime.strptime(target_date_str, "%Y-%m-%d").date()
        else:
            target_date = now.date()

        appointments = await self.scheduling_service.get_appointments_by_date(target_date)
        
        queue_items = []
        for apt in appointments:
            patient = await self.patient_service.get_patient_by_id(apt.patient_id)
            catalog_item = await self.catalog_service.get_catalog_item(apt.catalog_item_id)
            
            queue_items.append(
                QueueItemResponse(
                    appointment_id=str(apt.id),
                    patient_id=str(apt.patient_id),
                    patient_name=f"{patient.first_name} {patient.last_name}" if patient else "Unknown",
                    service_name=catalog_item.name if catalog_item else "Unknown",
                    slot_time=apt.start_time.strftime("%H:%M"),
                    status=apt.status.value
                )
            )
            
        return ScheduleResponse(
            date=str(target_date),
            appointments=queue_items
        )

    async def search_patients(self, query: str) -> list[PatientSearchResponse]:
        """Search patients and include their latest appointment status."""
        patients = await self.patient_service.search_patients(query)
        results = []
        
        for p in patients:
            latest_apt = await self.scheduling_service.get_latest_appointment_for_patient(p.id)
            
            results.append(
                PatientSearchResponse(
                    patient_id=str(p.id),
                    patient_name=f"{p.first_name} {p.last_name}",
                    mobile_number=p.mobile_number,
                    latest_appointment_status=latest_apt.status.value if latest_apt else None
                )
            )
            
        return results

    async def search_appointments(self, q: str | None, date_str: str | None) -> list[AppointmentSearchItem]:
        from sqlalchemy import select, or_, cast, String
        from app.scheduling.models import AppointmentModel
        from app.patient.models import PatientModel
        
        stmt = select(AppointmentModel, PatientModel).join(PatientModel, AppointmentModel.patient_id == PatientModel.id)
        
        if date_str:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
            stmt = stmt.where(AppointmentModel.date == target_date)
            
        if q and len(q) >= 3:
            search_pattern = f"%{q.lower()}%"
            stmt = stmt.where(
                or_(
                    PatientModel.mobile_number.ilike(search_pattern),
                    cast(PatientModel.first_name, String).ilike(search_pattern),
                    cast(PatientModel.last_name, String).ilike(search_pattern)
                )
            )
            
        stmt = stmt.order_by(AppointmentModel.date.desc(), AppointmentModel.start_time.desc())
        
        res = await self.session.execute(stmt)
        rows = res.all()
        
        results = []
        for apt, patient in rows:
            catalog_item = await self.catalog_service.get_catalog_item(apt.catalog_item_id)
            results.append(
                AppointmentSearchItem(
                    appointment_id=str(apt.id),
                    patient_id=str(patient.id),
                    patient_name=f"{patient.first_name} {patient.last_name}",
                    mobile_number=patient.mobile_number,
                    date=str(apt.date),
                    slot_time=apt.start_time.strftime("%H:%M"),
                    service_name=catalog_item.name if catalog_item else "Unknown",
                    status=apt.status.value
                )
            )
            
        return results

    async def get_patient_workspace(self, patient_id: str) -> PatientWorkspaceResponse:
        patient = await self.patient_service.get_patient_by_id(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
            
        appointments = await self.scheduling_service.get_all_appointments_for_patient(patient_id)
        
        history_items = []
        active_apt_item = None
        
        for apt in appointments:
            catalog_item = await self.catalog_service.get_catalog_item(apt.catalog_item_id)
            
            # Fetch document IDs
            from sqlalchemy import select
            from app.billing.models import BookingReceiptModel, FinalBillModel
            
            receipt_doc_id = None
            if apt.receipt_number:
                stmt_receipt = select(BookingReceiptModel.document_id).where(BookingReceiptModel.receipt_number == apt.receipt_number)
                res = await self.session.execute(stmt_receipt)
                r_id = res.scalar()
                if r_id:
                    receipt_doc_id = str(r_id)
                    
            final_bill_doc_id = None
            if apt.status.value == "COMPLETED":
                stmt_fb = select(FinalBillModel.document_id).where(FinalBillModel.appointment_id == apt.id)
                res2 = await self.session.execute(stmt_fb)
                f_id = res2.scalar()
                if f_id:
                    final_bill_doc_id = str(f_id)

            item = PatientAppointmentHistoryItem(
                appointment_id=str(apt.id),
                date=str(apt.date),
                slot_time=apt.start_time.strftime("%H:%M"),
                service_name=catalog_item.name if catalog_item else "Unknown",
                status=apt.status.value,
                receipt_document_id=receipt_doc_id,
                final_bill_document_id=final_bill_doc_id
            )
            history_items.append(item)
            
            # Identify active appointment (first BOOKED appointment chronologically or just any active one)
            # Since appointments is sorted by date desc, start_time desc, we just take any that is BOOKED.
            # But usually active is in the future.
            if apt.status.value == "BOOKED" and active_apt_item is None:
                active_apt_item = item
                
        return PatientWorkspaceResponse(
            patient_id=str(patient.id),
            patient_name=f"{patient.first_name} {patient.last_name}",
            mobile_number=patient.mobile_number,
            basic_address=patient.basic_address,
            active_appointment=active_apt_item,
            appointment_history=history_items
        )

    async def book_appointment(self, request: ReceptionBookingRequest) -> BookingConfirmation:
        """Create a booking as a receptionist, utilizing the shared booking orchestrator."""
        orchestrator = PublicBookingOrchestrator(self.session)
        
        # We pass the payment_method into transaction_reference to persist it via the existing billing model
        if request.advance_amount == 0:
            request.transaction_reference = f"Reception-{request.payment_method}-NoAdvance"
        else:
            request.transaction_reference = f"Reception-{request.payment_method}-{request.transaction_reference}"

        # is_reception=True bypasses the 3-day and 9:00 AM limits, and allows 0 advance payment
        return await orchestrator.confirm_booking(request, is_reception=True)

    async def get_checkout_summary(self, appointment_id: str) -> FinancialSummaryResponse:
        import uuid
        apt = await self.scheduling_service.get_appointment_by_id(uuid.UUID(appointment_id))
        if not apt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return await self.billing_service.get_financial_summary(apt.patient_id, apt.catalog_item_id)

    async def process_checkout(self, request: CheckoutRequest) -> CheckoutResponse:
        apt = await self.scheduling_service.get_appointment_by_id(request.appointment_id)
        if not apt:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        if apt.status.value == "COMPLETED":
            raise HTTPException(status_code=400, detail="Appointment is already completed.")

        patient = await self.patient_service.get_patient_by_id(apt.patient_id)
        catalog_item = await self.catalog_service.get_catalog_item(apt.catalog_item_id)
        
        patient_name = f"{patient.first_name} {patient.last_name}" if patient else "Unknown"
        catalog_item_name = catalog_item.name if catalog_item else "Unknown"

        checkout_res = await self.billing_service.process_checkout(
            request, 
            patient_name, 
            catalog_item_name,
            apt.patient_id,
            apt.catalog_item_id
        )
        
        # Complete appointment
        from app.scheduling.domain import AppointmentStatus
        apt.status = AppointmentStatus.COMPLETED
        await self.session.flush()
        
        return checkout_res

    async def cancel_appointment(self, appointment_id):
        """Coordinate appointment cancellation."""
        import uuid
        if isinstance(appointment_id, str):
            appointment_id = uuid.UUID(appointment_id)
        apt = await self.scheduling_service.cancel_appointment(appointment_id)
        await self.session.commit()
        return {"status": "SUCCESS", "appointment_id": str(apt.id)}

