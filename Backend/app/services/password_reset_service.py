"""
Password reset service for PenX.
"""

from sqlalchemy.orm import Session

from app.models.user import User
from app.services.otp_service import OTPService
from app.core.security import hash_password
from app.utils.validators import (
    validate_email,
    validate_password,
)


class PasswordResetService:
    """
    Handles forgot password workflow.
    """

    @staticmethod
    def send_reset_otp(
        db: Session,
        email: str,
    ) -> str:
        """
        Generate password reset OTP.
        """

        email = validate_email(email)

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:
            raise ValueError(
                "No account found with this email."
            )

        otp = OTPService.create_otp(
            db=db,
            email=email,
            purpose="PASSWORD_RESET",
        )

        return otp

    @staticmethod
    def verify_reset_otp(
        db: Session,
        email: str,
        otp: str,
    ) -> bool:
        """
        Verify password reset OTP.
        """

        email = validate_email(email)

        return OTPService.verify_otp(
            db=db,
            email=email,
            otp=otp,
            purpose="PASSWORD_RESET",
        )

    @staticmethod
    def reset_password(
        db: Session,
        email: str,
        new_password: str,
    ) -> None:
        """
        Update user password.
        """

        email = validate_email(email)

        validate_password(new_password)

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:
            raise ValueError(
                "No account found with this email."
            )

        user.password_hash = hash_password(
            new_password
        )

        db.commit()