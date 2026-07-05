"""Auth — Request/Response Schemas"""

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

class SendOTPRequest(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15, description="Mobile number with country code")

class VerifyOTPRequest(BaseModel):
    mobile_number: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    patient_id: str | None = None

class UserProfileResponse(BaseModel):
    id: UUID
    mobile_number: str
    patient_id: UUID | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
