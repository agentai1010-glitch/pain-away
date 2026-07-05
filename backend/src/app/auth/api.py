"""Auth — API Routes"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.dependencies import get_db
from app.auth.schemas import SendOTPRequest, VerifyOTPRequest, TokenResponse, UserProfileResponse
from app.auth.service import AuthService
from app.auth.dependencies import get_current_user
from app.auth.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp")
async def send_otp(request: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Send OTP to mobile number."""
    service = AuthService(db)
    return await service.send_otp(request)

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP and authenticate user."""
    service = AuthService(db)
    return await service.verify_otp(request)

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user (client-side token removal)."""
    return {"message": "Successfully logged out"}
