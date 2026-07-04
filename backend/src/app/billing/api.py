"""Billing — API Routes"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.billing.schemas import AdvancePaymentRequest, PaymentResponse
from app.billing.service import BillingService
from app.shared.dependencies import get_db

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.post("/advance-payment", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def process_advance_payment(
    data: AdvancePaymentRequest,
    db: AsyncSession = Depends(get_db),
) -> PaymentResponse:
    """Record an advance payment and generate a booking receipt."""
    service = BillingService(db)
    return await service.process_advance_payment(data)

@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a billing document by ID."""
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    
    service = BillingService(db)
    doc_path = await service.get_document_path(document_id)
    if not doc_path:
        raise HTTPException(status_code=404, detail="Document not found or file missing from storage.")
        
    return FileResponse(doc_path, media_type="text/plain", filename=doc_path.split("\\")[-1].split("/")[-1])
