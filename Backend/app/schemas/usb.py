"""
USB Pydantic schemas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =====================================================
# Register USB
# =====================================================

class USBRegisterRequest(BaseModel):
    usb_id: str
    usb_name: str
    vault_id: str


# =====================================================
# USB Check
# =====================================================

class USBCheckRequest(BaseModel):
    usb_id: str


# =====================================================
# USB Response
# =====================================================

class USBResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    usb_id: str
    usb_name: str
    vault_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# =====================================================
# Owner Response
# =====================================================

class USBOwnerResponse(BaseModel):
    registered: bool

    owner_name: Optional[str] = None
    owner_email: Optional[str] = None

    owner: bool = False