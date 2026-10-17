"""
Password reset router for PenX.
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.password_reset import (
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest,
    MessageResponse,
)

from app.services.password_reset_service import (
    PasswordResetService,
)

from app.services.email_service import EmailService


router = APIRouter(
    prefix="/auth",
    tags=["Password Reset"],
)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Send password reset OTP.
    """

    try:
        otp = PasswordResetService.send_reset_otp(
            db=db,
            email=request.email,
        )

        await EmailService.send_otp_email(
            email=request.email,
            otp=otp,
        )

        return MessageResponse(
            message="Password reset OTP sent successfully."
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/verify-reset-otp",
    response_model=MessageResponse,
)
def verify_reset_otp(
    request: VerifyResetOTPRequest,
    db: Session = Depends(get_db),
):
    """
    Verify password reset OTP.
    """

    try:
        PasswordResetService.verify_reset_otp(
            db=db,
            email=request.email,
            otp=request.otp,
        )

        return MessageResponse(
            message="OTP verified successfully."
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset user password.
    """

    try:
        PasswordResetService.reset_password(
            db=db,
            email=request.email,
            new_password=request.new_password,
        )

        return MessageResponse(
            message="Password changed successfully."
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )