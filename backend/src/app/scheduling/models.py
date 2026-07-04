"""Scheduling — Database Models"""

import datetime
import uuid
from sqlalchemy import Date, String, Time, Enum, Uuid, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.scheduling.domain import AppointmentStatus


class AppointmentModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a scheduled appointment."""

    __tablename__ = "appointments"

    date: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    end_time: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    
    # Simple status Enum: BOOKED, CANCELLED, NO_SHOW, COMPLETED
    status: Mapped[AppointmentStatus] = mapped_column(Enum(AppointmentStatus), default=AppointmentStatus.BOOKED, nullable=False)
    
    patient_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=True)
    catalog_item_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=True)
    receipt_number: Mapped[str] = mapped_column(String(50), nullable=True)
    rebooked_from_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=True)
    rebooked_to_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=True)


class RebookingEligibilityModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of patient rebooking eligibility after cancellation."""

    __tablename__ = "rebooking_eligibilities"

    patient_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    appointment_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, unique=True)
    is_consumed: Mapped[bool] = mapped_column(default=False, nullable=False)


class HolidayModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a clinic holiday."""

    __tablename__ = "holidays"

    date: Mapped[datetime.date] = mapped_column(Date, nullable=False, unique=True, index=True)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

