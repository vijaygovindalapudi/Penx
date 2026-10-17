"""
OTP service for PenX.
"""

import secrets
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_otp_verification_token,
)

from app.models.otp import OTP


class OTPService:
    """
    Handles OTP generation and verification.
    """

    OTP_LENGTH = 6
    MAX_ATTEMPTS = 3

    # ==================================================
    # Generate OTP
    # ==================================================

    @staticmethod
    def generate_otp() -> str:
        """
        Generate a cryptographically secure 6-digit OTP.
        """

        return str(
            secrets.randbelow(900000) + 100000
        )

    # ==================================================
    # Create OTP
    # ==================================================

    @staticmethod
    def create_otp(
        db: Session,
        email: str,
        purpose: str,
    ) -> str:
        """
        Generate and store a new OTP.

        Returns:
            Plain OTP used only for sending email.
        """

        # ------------------------------------------------
        # Delete previous unused OTPs
        # ------------------------------------------------

        (
            db.query(OTP)
            .filter(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.is_used == False,
            )
            .delete(
                synchronize_session=False
            )
        )

        # ------------------------------------------------
        # Generate OTP
        # ------------------------------------------------

        otp = OTPService.generate_otp()

        # ------------------------------------------------
        # Store hashed OTP
        # ------------------------------------------------

        otp_record = OTP(
            email=email,
            otp_hash=hash_password(otp),
            purpose=purpose,
        )

        db.add(otp_record)

        db.commit()

        return otp

    # ==================================================
    # Verify OTP
    # ==================================================

    @staticmethod
    def verify_otp(
        db: Session,
        email: str,
        otp: str,
        purpose: str,
    ) -> str:
        """
        Verify OTP.

        On successful verification:

        1. OTP is marked as used.
        2. A short-lived verification token is created.
        3. The verification token is returned.

        Returns:
            OTP verification token.
        """

        # ------------------------------------------------
        # Find latest active OTP
        # ------------------------------------------------

        otp_record = (
            db.query(OTP)
            .filter(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.is_used == False,
            )
            .order_by(
                OTP.created_at.desc()
            )
            .first()
        )

        # ------------------------------------------------
        # OTP not found
        # ------------------------------------------------

        if otp_record is None:
            raise ValueError(
                "OTP not found."
            )

        # ------------------------------------------------
        # Expiry check
        # ------------------------------------------------

        if (
            otp_record.expires_at
            < datetime.now(timezone.utc)
        ):
            raise ValueError(
                "OTP has expired."
            )

        # ------------------------------------------------
        # Attempt limit
        # ------------------------------------------------

        if (
            otp_record.attempt_count
            >= OTPService.MAX_ATTEMPTS
        ):
            raise ValueError(
                "Maximum OTP attempts exceeded."
            )

        # ------------------------------------------------
        # Verify OTP
        # ------------------------------------------------

        if not verify_password(
            otp,
            otp_record.otp_hash,
        ):

            otp_record.attempt_count += 1

            db.commit()

            raise ValueError(
                "Invalid OTP."
            )

        # ------------------------------------------------
        # Mark OTP as used
        # ------------------------------------------------

        otp_record.is_used = True

        db.commit()

        # ------------------------------------------------
        # Create verification token
        # ------------------------------------------------

        verification_token = (
            create_otp_verification_token(
                email=email,
                purpose=purpose,
            )
        )

        return verification_token

    # ==================================================
    # Invalidate OTPs
    # ==================================================

    @staticmethod
    def invalidate_otps(
        db: Session,
        email: str,
        purpose: str,
    ) -> None:
        """
        Mark all active OTPs as used.
        """

        (
            db.query(OTP)
            .filter(
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.is_used == False,
            )
            .update(
                {
                    "is_used": True
                },
                synchronize_session=False,
            )
        )

        db.commit()

    # ==================================================
    # Cleanup Expired OTPs
    # ==================================================

    @staticmethod
    def cleanup_expired_otps(
        db: Session,
    ) -> None:
        """
        Delete expired OTPs.
        """

        (
            db.query(OTP)
            .filter(
                OTP.expires_at
                < datetime.now(timezone.utc)
            )
            .delete(
                synchronize_session=False
            )
        )

        db.commit()