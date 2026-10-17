"""
Base model for all PenX database models.
"""

from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class BaseModel(Base, UUIDMixin, TimestampMixin):
    """
    Base model inherited by all PenX models.

    Includes:
    - UUID primary key
    - created_at
    - updated_at
    """

    __abstract__ = True