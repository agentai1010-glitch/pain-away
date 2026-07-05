"""Auth — Database Models"""

import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    mobile_number = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("PatientModel", backref="user")
