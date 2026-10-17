"""
OTP request and response schemas.
"""

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


# ======================================================
# Send OTP Request
# ======================================================

class SendOTPRequest(BaseModel):
    """
    Request schema to send an OTP.
    """

    email: EmailStr

    purpose: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )


# ======================================================
# Verify OTP Request
# ======================================================

class VerifyOTPRequest(BaseModel):
    """
    Request schema to verify an OTP.
    """

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
    )

    purpose: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )


# ======================================================
# OTP Response
# ======================================================

class OTPResponse(BaseModel):
    """
    Standard OTP API response.

    verification_token is returned only after
    successful OTP verification.
    """

    message: str

    verification_token: str | None = None