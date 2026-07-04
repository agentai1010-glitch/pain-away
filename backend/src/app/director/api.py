"""Director — API Routes"""

from fastapi import APIRouter
from app.director.schemas import DirectorLoginRequest
from app.director.service import DirectorService
from app.reception.schemas import TokenResponse

router = APIRouter(prefix="/director", tags=["Director"])

@router.post("/login", response_model=TokenResponse)
async def login(request: DirectorLoginRequest):
    """Authenticate a director."""
    return DirectorService.authenticate(request)
