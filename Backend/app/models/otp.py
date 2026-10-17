"""
OTP database model.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base_model import BaseModel


class OTP(BaseModel):
    """
    Stores OTPs for registration, login,
    and password reset verification.
    """

    __tablename__ = "otps"

    email: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    otp_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    purpose: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    attempt_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) + timedelta(minutes=5),
        nullable=False,
    )