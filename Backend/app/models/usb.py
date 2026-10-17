"""
USB database model.
"""

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class USB(BaseModel):
    """
    Represents a registered PenX USB device.
    """

    __tablename__ = "usb_devices"

    usb_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    usb_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    vault_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    last_connected: Mapped[str] = mapped_column(
        String(50),
        nullable=True,
    )

    # Relationships

    user = relationship(
        "User",
        back_populates="usb_devices",
    )