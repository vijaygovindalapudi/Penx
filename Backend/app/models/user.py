"""
User database model for PenX.
"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class User(BaseModel):
    """
    Represents a PenX user.
    """

    __tablename__ = "users"

    # =====================================================
    # PenX Identity
    # =====================================================

    penx_id: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        nullable=False,
    )

    username: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
    )

    # =====================================================
    # Personal Information
    # =====================================================

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    # =====================================================
    # Authentication
    # =====================================================

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # =====================================================
    # Account Status
    # =====================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # =====================================================
    # Relationships
    # =====================================================

    devices = relationship(
        "Device",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    cloud_files = relationship(
    "CloudFile",
    back_populates="user",
    cascade="all, delete-orphan",
)