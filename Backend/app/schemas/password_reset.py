"""
Password reset schemas.
"""

from pydantic import BaseModel, EmailStr, Field


class ForgotPasswordRequest(BaseModel):
    """
    Request to send password reset OTP.
    """

    email: EmailStr


class VerifyResetOTPRequest(BaseModel):
    """
    Verify password reset OTP.
    """

    email: EmailStr
    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
    )


class ResetPasswordRequest(BaseModel):
    """
    Reset password request.
    """

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
    )

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=64,
    )


class MessageResponse(BaseModel):
    """
    Generic success response.
    """

    message: str