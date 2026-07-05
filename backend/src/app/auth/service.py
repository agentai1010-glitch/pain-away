"""Auth — Business Logic"""

import datetime
from fastapi import HTTPException, status
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth.models import User
from app.auth.schemas import SendOTPRequest, VerifyOTPRequest, TokenResponse
from app.patient.models import PatientModel
from app.auth.dependencies import SECRET_KEY, ALGORITHM

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def send_otp(self, request: SendOTPRequest) -> dict:
        """Simulates sending an OTP."""
        # In a real app, integrate with SMS gateway
        # For simulation, OTP is assumed to be 123456 always
        return {"message": "OTP sent successfully (Use 123456 for testing)"}

    async def verify_otp(self, request: VerifyOTPRequest) -> TokenResponse:
        """Verifies OTP and logs in or creates the user."""
        if request.otp != "123456":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )

        # Look up existing user
        stmt = select(User).where(User.mobile_number == request.mobile_number)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            # Check if there is a patient with this mobile number to automatically link
            patient_stmt = select(PatientModel).where(PatientModel.mobile_number == request.mobile_number)
            patient_result = await self.session.execute(patient_stmt)
            patient = patient_result.scalar_one_or_none()
            
            patient_id = patient.id if patient else None
            
            # Create new user
            user = User(mobile_number=request.mobile_number, patient_id=patient_id)
            self.session.add(user)
            await self.session.flush()
        else:
            # If user exists but is not linked to patient, try to link them now
            if not user.patient_id:
                patient_stmt = select(PatientModel).where(PatientModel.mobile_number == request.mobile_number)
                patient_result = await self.session.execute(patient_stmt)
                patient = patient_result.scalar_one_or_none()
                if patient:
                    user.patient_id = patient.id
                    
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is inactive"
                )

        user.last_login = datetime.datetime.utcnow()
        await self.session.commit()

        # Generate JWT Token
        payload = {
            "sub": str(user.id),
            "role": "patient",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=str(user.id),
            patient_id=str(user.patient_id) if user.patient_id else None
        )
