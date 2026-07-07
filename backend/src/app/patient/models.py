"""Patient — Database Models"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PatientModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Database representation of a Patient."""

    __tablename__ = "patients"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(15), nullable=False, unique=True, index=True)
    basic_address: Mapped[str] = mapped_column(String(255), nullable=False)
    gender: Mapped[str] = mapped_column(String(10), default="Male", nullable=False)
