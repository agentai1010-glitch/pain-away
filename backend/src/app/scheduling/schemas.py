"""Scheduling — Request/Response Schemas"""

import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field
from app.scheduling.domain import AppointmentStatus


class SlotResponse(BaseModel):
    start_time: datetime.time
    end_time: datetime.time
    is_available: bool


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


class HolidayResponse(BaseModel):
    id: uuid.UUID
    date: datetime.date
    reason: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class HolidayValidationPreview(BaseModel):
    is_valid: bool
    message: str | None = None

class HolidayValidateRequest(BaseModel):
    date: datetime.date
