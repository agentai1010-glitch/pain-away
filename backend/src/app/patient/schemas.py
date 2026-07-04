"""Patient — Request/Response Schemas"""

import uuid
from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    mobile_number: str = Field(..., min_length=10, max_length=15, pattern=r"^\+?[1-9]\d{9,14}$")
    basic_address: str = Field(..., min_length=1, max_length=255)


class PatientResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    mobile_number: str
    basic_address: str

    class Config:
        from_attributes = True
