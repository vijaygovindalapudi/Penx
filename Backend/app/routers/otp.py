"""
OTP Router.
"""

import traceback

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.otp import (
    SendOTPRequest,
    VerifyOTPRequest,
    OTPResponse,
)

from app.services.email_service import EmailService
from app.services.otp_service import OTPService


# ======================================================
# Router
# ======================================================

router = APIRouter(
    prefix="/otp",
    tags=["OTP"],
)


# ======================================================
# Send OTP
# ======================================================

@router.post(
    "/send",
    response_model=OTPResponse,
)
async def send_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db),
):
    """
    Generate and send OTP.
    """

    try:

        print(
            "========== SEND OTP START =========="
        )

        print(
            f"Email   : {request.email}"
        )

        print(
            f"Purpose : {request.purpose}"
        )

        # ------------------------------------------------
        # Create OTP
        # ------------------------------------------------

        print(
            "STEP 1 -> Creating OTP..."
        )

        otp = OTPService.create_otp(
            db=db,
            email=str(request.email),
            purpose=request.purpose,
        )

        print(
            "STEP 2 -> OTP Created"
        )

        # ------------------------------------------------
        # Send OTP Email
        # ------------------------------------------------

        print(
            "STEP 3 -> Sending Email..."
        )

        await EmailService.send_otp_email(
            email=str(request.email),
            otp=otp,
        )

        print(
            "STEP 4 -> Email Sent Successfully"
        )

        print(
            "========== SEND OTP END =========="
        )

        return OTPResponse(
            message="OTP sent successfully.",
        )

    except ValueError as exc:

        print(
            "========== VALUE ERROR =========="
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "========== UNEXPECTED ERROR =========="
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send OTP.",
        )


# ======================================================
# Verify OTP
# ======================================================

@router.post(
    "/verify",
    response_model=OTPResponse,
)
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    """
    Verify OTP and generate a short-lived
    registration verification token.
    """

    try:

        print(
            "========== VERIFY OTP START =========="
        )

        print(
            f"Email   : {request.email}"
        )

        print(
            f"Purpose : {request.purpose}"
        )

        # ------------------------------------------------
        # Verify OTP
        # ------------------------------------------------

        verification_token = (
            OTPService.verify_otp(
                db=db,
                email=str(request.email),
                otp=request.otp,
                purpose=request.purpose,
            )
        )

        print(
            "OTP verified successfully."
        )

        print(
            "Verification token generated."
        )

        print(
            "========== VERIFY OTP END =========="
        )

        # ------------------------------------------------
        # Return verification proof
        # ------------------------------------------------

        return OTPResponse(
            message="OTP verified successfully.",
            verification_token=verification_token,
        )

    except ValueError as exc:

        print(
            "========== VALUE ERROR =========="
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "========== UNEXPECTED ERROR =========="
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify OTP.",
        )