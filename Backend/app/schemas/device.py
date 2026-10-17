"""
Device Pydantic schemas.
"""

from pydantic import BaseModel, ConfigDict


# =====================================================
# Register Device
# =====================================================

class DeviceRegister(BaseModel):
    usb_model: str
    usb_serial: str
    usb_size: int


# =====================================================
# Device Response
# =====================================================

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    usb_model: str
    usb_serial: str
    usb_size: int


# =====================================================
# Check USB Ownership Request
# =====================================================

class DeviceCheckRequest(BaseModel):
    usb_serial: str


# =====================================================
# Check USB Ownership Response
# =====================================================

class DeviceCheckResponse(BaseModel):
    registered: bool
    owner: bool
    owner_name: str | None = None
    owner_email: str | None = None