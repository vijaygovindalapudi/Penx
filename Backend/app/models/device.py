from sqlalchemy import String, BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class Device(BaseModel):
    __tablename__ = "devices"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    usb_serial: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    usb_model: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    usb_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="devices",
    )