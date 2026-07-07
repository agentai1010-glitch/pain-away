"""Scheduling — Request/Response Schemas"""

import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.scheduling.domain import AppointmentStatus


class SlotResponse(BaseModel):
    start_time: datetime.time
    end_time: datetime.time
    is_available: bool
    male_capacity: int = 3
    female_capacity: int = 3
    total_capacity: int = 6
    is_disabled: bool = False


class DateAvailabilityResponse(BaseModel):
    date: datetime.date
    slots: list[SlotResponse]


class RebookedAppointmentResponse(BaseModel):
    id: uuid.UUID
    rebooked_from_id: uuid.UUID
    status: AppointmentStatus

    model_config = ConfigDict(from_attributes=True)


class HolidayCreate(BaseModel):
    date: datetime.date
    reason: str = Field(..., max_length=255)
    holiday_type: str = Field(default="FULL", pattern=r"^(FULL|PARTIAL)$")
    disabled_slots: list[str] = Field(default_factory=list)


class HolidayResponse(BaseModel):
    id: uuid.UUID
    date: datetime.date
    reason: str
    is_active: bool
    holiday_type: str = "FULL"
    disabled_slots: list[str] = Field(default_factory=list)

    @field_validator("disabled_slots", mode="before")
    @classmethod
    def parse_disabled_slots(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        if v is None:
            return []
        return v

    model_config = ConfigDict(from_attributes=True)


class HolidayValidationPreview(BaseModel):
    is_valid: bool
    message: str | None = None

class HolidayValidateRequest(BaseModel):
    date: datetime.date
