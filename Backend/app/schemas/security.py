"""
Security / Remote Lock / Remote Wipe /
Login Security Pydantic schemas.
"""

from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


# =====================================================
# Remote Wipe Request
# =====================================================

class RemoteWipeRequest(BaseModel):
    """
    Request a remote wipe for a registered device.
    """

    device_id: str = Field(
        ...,
        min_length=1,
    )

    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )

    password: str = Field(
        ...,
        min_length=1,
    )


# =====================================================
# Remote Lock Request
# =====================================================

class RemoteLockRequest(BaseModel):
    """
    Request a remote lock for a registered device.
    """

    device_id: str = Field(
        ...,
        min_length=1,
    )

    password: str = Field(
        ...,
        min_length=1,
    )


# =====================================================
# Security Session Response
# =====================================================

class SecuritySessionResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: str
    device_id: str
    session_type: str
    status: str

    requested_at: datetime | None = None
    completed_at: datetime | None = None


# =====================================================
# Wipe Command Response
# =====================================================

class WipeCommandResponse(BaseModel):
    """
    Response returned after a remote wipe request.
    """

    session_id: str
    device_id: str
    status: str
    message: str


# =====================================================
# Wipe Acknowledgement
# =====================================================

class WipeAcknowledgementRequest(BaseModel):
    """
    Sent by the PenX Electron application after
    processing a remote wipe command.
    """

    session_id: str = Field(
        ...,
        min_length=1,
    )

    success: bool

    failure_reason: str | None = Field(
        default=None,
        max_length=500,
    )


# =====================================================
# Security Status Response
# =====================================================

class SecurityStatusResponse(BaseModel):
    """
    Current security state of a device.
    """

    device_id: str
    lock_status: str
    wipe_status: str
    pending_command: bool


# =====================================================
# Login Security Event Response
# =====================================================

class LoginSecurityEventResponse(BaseModel):
    """
    Security information for a detected login.
    """

    model_config = ConfigDict(
        from_attributes=True
    )

    id: str

    device_id: str | None = None

    event_type: str
    status: str

    ip_address: str | None = None
    location: str | None = None
    device_name: str | None = None
    browser: str | None = None

    created_at: datetime

    confirmed_at: datetime | None = None
    rejected_at: datetime | None = None


# =====================================================
# Login Security Action Request
# =====================================================

class LoginSecurityActionRequest(BaseModel):
    """
    Used when the account owner confirms or rejects
    a detected login.
    """

    event_id: str = Field(
        ...,
        min_length=1,
    )


# =====================================================
# Login Security Action Response
# =====================================================

class LoginSecurityActionResponse(BaseModel):
    """
    Response returned after confirming or rejecting
    a login security event.
    """

    id: str
    status: str
    message: str