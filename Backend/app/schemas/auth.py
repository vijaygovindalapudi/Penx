"""
Authentication schemas for PenX.
"""

from pydantic import BaseModel, EmailStr, Field


# ======================================================
# User Registration
# ======================================================

class UserRegister(BaseModel):
    """
    User registration request.

    The OTP itself is not sent during registration.
    The frontend must provide the short-lived
    verification token received after successful
    OTP verification.
    """

    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )

    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9._-]+$",
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
    )

    verification_token: str = Field(
        ...,
        min_length=1,
    )


# ======================================================
# User Login
# ======================================================

class UserLogin(BaseModel):
    """
    User login request.
    """

    email: EmailStr

    password: str


# ======================================================
# Google Login
# ======================================================

class GoogleLoginRequest(BaseModel):
    """
    Google authentication request.

    The Electron application completes Google OAuth
    and sends the resulting Google ID token to
    the PenX backend.
    """

    id_token: str = Field(
        ...,
        min_length=1,
    )


# ======================================================
# Forgot Password
# ======================================================

class ForgotPasswordRequest(BaseModel):
    """
    Request a password reset OTP.
    """

    email: EmailStr


# ======================================================
# Verify Reset OTP
# ======================================================

class VerifyResetOTPRequest(BaseModel):
    """
    Verify the password reset OTP.
    """

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
    )


# ======================================================
# Reset Password
# ======================================================

class ResetPasswordRequest(BaseModel):
    """
    Set a new password after successful
    reset OTP verification.
    """

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
    )

    reset_token: str = Field(
        ...,
        min_length=1,
    )


# ======================================================
# Token Response
# ======================================================

class TokenResponse(BaseModel):
    """
    JWT token response.
    """

    access_token: str

    token_type: str = "bearer"


# ======================================================
# Generic Message Response
# ======================================================

class MessageResponse(BaseModel):
    """
    Generic success response.
    """

    message: str