from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.dependencies import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from .schemas import PatientDashboardResponse
from .service import PatientPortalService

router = APIRouter(prefix="/patient-portal", tags=["Patient Portal"])

@router.get("/dashboard", response_model=PatientDashboardResponse)
async def get_patient_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve aggregated data for the Patient Dashboard."""
    service = PatientPortalService(db)
    return await service.get_dashboard_summary(current_user)
