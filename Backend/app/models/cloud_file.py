"""
Cloud file database model for PenX.
"""

from sqlalchemy import ForeignKey, String, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class CloudFile(BaseModel):
    """
    Represents an encrypted file stored in PenX Cloud.
    """

    __tablename__ = "cloud_files"

    # ==================================================
    # Ownership
    # ==================================================

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ==================================================
    # File Information
    # ==================================================

    original_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    encrypted_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        unique=True,
    )

    # ==================================================
    # File Metadata
    # ==================================================

    size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    checksum: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    # ==================================================
    # Relationship
    # ==================================================

    user = relationship(
        "User",
        back_populates="cloud_files",
    )