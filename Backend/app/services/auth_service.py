"""
Authentication service for PenX.
"""

import secrets
from datetime import datetime, timedelta, timezone

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from sqlalchemy.orm import Session

from app.core.config import settings

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

from app.models.user import User

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest,
)

from app.utils.validators import (
    validate_email,
    validate_password,
    validate_full_name,
)


# ======================================================
# Temporary Password Reset Storage
# ======================================================
#
# Development implementation.
#
# Production:
# Replace this with Redis or a database-backed
# password reset table.
#
# Structure:
#
# {
#     "email@example.com": {
#         "otp": "123456",
#         "expires_at": datetime,
#         "verified": False,
#     }
# }
#
# ======================================================

RESET_OTP_STORE = {}


class AuthService:
    """
    Authentication service for PenX.

    Handles:

    - User registration
    - Registration OTP verification-token validation
    - Username validation
    - PenX ID generation
    - Email/password login
    - Google login
    - Forgot password
    - Password reset OTP verification
    - Password reset
    - JWT token generation
    """

    # ==================================================
    # Generate PenX ID
    # ==================================================

    @staticmethod
    def generate_penx_id(db: Session) -> str:

        while True:

            random_part = secrets.token_hex(10).upper()

            penx_id = f"PX-{random_part}"

            existing_user = (
                db.query(User)
                .filter(User.penx_id == penx_id)
                .first()
            )

            if not existing_user:
                return penx_id

    # ==================================================
    # Validate Registration Verification Token
    # ==================================================

    @staticmethod
    def validate_verification_token(
        token: str,
        email: str,
    ) -> bool:

        if not token:

            raise ValueError(
                "OTP verification is required."
            )

        try:

            payload = decode_access_token(token)

        except ValueError as exc:

            raise ValueError(
                "OTP verification has expired or is invalid."
            ) from exc

        token_type = payload.get("type")

        if token_type != "otp_verification":

            raise ValueError(
                "Invalid OTP verification token."
            )

        purpose = payload.get("purpose")

        if purpose != "REGISTER":

            raise ValueError(
                "Invalid registration verification token."
            )

        token_email = payload.get("sub")

        if not token_email:

            raise ValueError(
                "Invalid OTP verification token."
            )

        if token_email.lower() != email.lower():

            raise ValueError(
                "OTP verification does not match this email."
            )

        return True

    # ==================================================
    # Register
    # ==================================================

    @staticmethod
    def register(
        db: Session,
        user_data: UserRegister,
    ):

        email = validate_email(
            str(user_data.email)
        )

        AuthService.validate_verification_token(
            token=user_data.verification_token,
            email=email,
        )

        full_name = user_data.full_name.strip()

        username = user_data.username.strip()

        validate_full_name(full_name)

        validate_password(
            user_data.password
        )

        if len(username) < 3:

            raise ValueError(
                "Username must contain at least 3 characters."
            )

        if len(username) > 30:

            raise ValueError(
                "Username cannot exceed 30 characters."
            )

        allowed_characters = (
            "abcdefghijklmnopqrstuvwxyz"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "0123456789"
            "._-"
        )

        if any(
            character not in allowed_characters
            for character in username
        ):

            raise ValueError(
                "Username can contain only letters, numbers, dots, underscores, and hyphens."
            )

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:

            raise ValueError(
                "Email already registered."
            )

        existing_username = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if existing_username:

            raise ValueError(
                "Username already taken."
            )

        penx_id = (
            AuthService.generate_penx_id(db)
        )

        new_user = User(
            penx_id=penx_id,
            username=username,
            full_name=full_name,
            email=email,
            password_hash=hash_password(
                user_data.password
            ),
            is_active=True,
            is_verified=True,
        )

        db.add(new_user)

        try:

            db.commit()

        except Exception:

            db.rollback()
            raise

        db.refresh(new_user)

        access_token = create_access_token(
            {
                "sub": new_user.email,
                "type": "access",
            }
        )

        return access_token, new_user

    # ==================================================
    # Normal Login
    # ==================================================

    @staticmethod
    def login(
        db: Session,
        user_data: UserLogin,
    ) -> str:

        email = validate_email(
            str(user_data.email)
        )

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:

            raise ValueError(
                "Invalid email or password."
            )

        if not user.is_active:

            raise ValueError(
                "Your account has been deactivated."
            )

        if not verify_password(
            user_data.password,
            user.password_hash,
        ):

            raise ValueError(
                "Invalid email or password."
            )

        access_token = create_access_token(
            {
                "sub": user.email,
                "type": "access",
            }
        )

        return access_token

    # ==================================================
    # Google Login
    # ==================================================

    @staticmethod
    def google_login(
        db: Session,
        id_token: str,
    ):

        if not id_token:

            raise ValueError(
                "Google ID token is required."
            )

        print(
            "🔐 Google token verification started..."
        )

        try:

            google_user = (
                google_id_token.verify_oauth2_token(
                    id_token,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
                )
            )

        except ValueError as exc:

            print(
                "❌ Google token verification failed:",
                exc,
            )

            raise ValueError(
                "Invalid Google ID token."
            ) from exc

        except Exception as exc:

            print(
                "❌ Google verification error:",
                exc,
            )

            raise ValueError(
                "Google authentication failed."
            ) from exc

        print(
            "✅ Google token verified successfully."
        )

        email = google_user.get("email")

        full_name = (
            google_user.get("name")
            or google_user.get("given_name")
            or "PenX User"
        )

        email_verified = google_user.get(
            "email_verified",
            False,
        )

        if not email:

            raise ValueError(
                "Google account email was not provided."
            )

        if not email_verified:

            raise ValueError(
                "Your Google email address is not verified."
            )

        email = email.strip().lower()

        full_name = full_name.strip()

        if not full_name:

            full_name = "PenX User"

        # ------------------------------------------------
        # Existing User
        # ------------------------------------------------

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user:

            print(
                "👤 Existing PenX user found:",
                user.email,
            )

            if not user.is_active:

                raise ValueError(
                    "Your account has been deactivated."
                )

            if not user.is_verified:

                user.is_verified = True

                db.commit()

                db.refresh(user)

            access_token = create_access_token(
                {
                    "sub": user.email,
                    "type": "access",
                }
            )

            return access_token, user

        # ------------------------------------------------
        # New Google User
        # ------------------------------------------------

        print(
            "🆕 Creating new PenX user for:",
            email,
        )

        username_base = email.split("@")[0]

        username = "".join(
            character
            for character in username_base
            if (
                character.isalnum()
                or character in "._-"
            )
        )

        if len(username) < 3:

            username = "penxuser"

        username = username[:30]

        base_username = username

        counter = 1

        while (
            db.query(User)
            .filter(User.username == username)
            .first()
            is not None
        ):

            suffix = f"_{counter}"

            username = (
                base_username[
                    :30 - len(suffix)
                ]
                + suffix
            )

            counter += 1

        penx_id = (
            AuthService.generate_penx_id(db)
        )

        internal_password = (
            secrets.token_urlsafe(32)
        )

        new_user = User(
            penx_id=penx_id,
            username=username,
            full_name=full_name[:100],
            email=email,
            password_hash=hash_password(
                internal_password
            ),
            is_active=True,
            is_verified=True,
        )

        db.add(new_user)

        try:

            db.commit()

        except Exception:

            db.rollback()
            raise

        db.refresh(new_user)

        print(
            "✅ New PenX Google user created:",
            new_user.email,
        )

        access_token = create_access_token(
            {
                "sub": new_user.email,
                "type": "access",
            }
        )

        return access_token, new_user

    # ==================================================
    # Forgot Password
    # ==================================================

    @staticmethod
    def forgot_password(
        db: Session,
        request: ForgotPasswordRequest,
    ) -> str:
        """
        Generate a password reset OTP.

        The OTP is valid for 5 minutes.

        Returns:
            OTP string so EmailService can send it.
        """

        email = validate_email(
            str(request.email)
        )

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        # ------------------------------------------------
        # Do not reveal whether an email exists.
        #
        # For the current development flow we return
        # a generic message when user doesn't exist.
        # ------------------------------------------------

        if user is None:

            raise ValueError(
                "If an account exists for this email, a reset OTP has been sent."
            )

        if not user.is_active:

            raise ValueError(
                "Your account has been deactivated."
            )

        # ------------------------------------------------
        # Generate 6-digit OTP
        # ------------------------------------------------

        otp = f"{secrets.randbelow(1000000):06d}"

        expires_at = (
            datetime.now(timezone.utc)
            + timedelta(minutes=5)
        )

        RESET_OTP_STORE[email] = {
            "otp": otp,
            "expires_at": expires_at,
            "verified": False,
        }

        print(
            "🔐 Password reset OTP generated for:",
            email,
        )

        return otp

    # ==================================================
    # Verify Password Reset OTP
    # ==================================================

    @staticmethod
    def verify_reset_otp(
        db: Session,
        request: VerifyResetOTPRequest,
    ) -> str:
        """
        Verify password reset OTP.

        Returns a short-lived reset token.
        """

        email = validate_email(
            str(request.email)
        )

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:

            raise ValueError(
                "Invalid or expired reset OTP."
            )

        reset_data = RESET_OTP_STORE.get(
            email
        )

        if reset_data is None:

            raise ValueError(
                "Reset OTP has expired or was not requested."
            )

        now = datetime.now(
            timezone.utc
        )

        if now > reset_data["expires_at"]:

            RESET_OTP_STORE.pop(
                email,
                None,
            )

            raise ValueError(
                "Reset OTP has expired."
            )

        if request.otp != reset_data["otp"]:

            raise ValueError(
                "Invalid reset OTP."
            )

        # ------------------------------------------------
        # Mark OTP as verified
        # ------------------------------------------------

        reset_data["verified"] = True

        # ------------------------------------------------
        # Generate short-lived reset token
        # ------------------------------------------------

        reset_token = create_access_token(
            {
                "sub": email,
                "type": "password_reset",
            }
        )

        return reset_token

    # ==================================================
    # Reset Password
    # ==================================================

    @staticmethod
    def reset_password(
        db: Session,
        request: ResetPasswordRequest,
    ) -> User:
        """
        Reset the user's password after
        successful OTP verification.
        """

        email = validate_email(
            str(request.email)
        )

        # ------------------------------------------------
        # Validate reset token
        # ------------------------------------------------

        try:

            payload = decode_access_token(
                request.reset_token
            )

        except ValueError as exc:

            raise ValueError(
                "Password reset session has expired."
            ) from exc

        # ------------------------------------------------
        # Validate token type
        # ------------------------------------------------

        if payload.get("type") != "password_reset":

            raise ValueError(
                "Invalid password reset token."
            )

        # ------------------------------------------------
        # Validate email
        # ------------------------------------------------

        token_email = payload.get(
            "sub"
        )

        if not token_email:

            raise ValueError(
                "Invalid password reset token."
            )

        if token_email.lower() != email.lower():

            raise ValueError(
                "Password reset token does not match this email."
            )

        # ------------------------------------------------
        # Validate OTP verification state
        # ------------------------------------------------

        reset_data = RESET_OTP_STORE.get(
            email
        )

        if reset_data is None:

            raise ValueError(
                "Password reset session has expired."
            )

        if not reset_data.get(
            "verified",
            False,
        ):

            raise ValueError(
                "Please verify the reset OTP first."
            )

        # ------------------------------------------------
        # Find user
        # ------------------------------------------------

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:

            raise ValueError(
                "User account was not found."
            )

        if not user.is_active:

            raise ValueError(
                "Your account has been deactivated."
            )

        # ------------------------------------------------
        # Validate new password
        # ------------------------------------------------

        validate_password(
            request.password
        )

        # ------------------------------------------------
        # Update password
        # ------------------------------------------------

        user.password_hash = hash_password(
            request.password
        )

        db.commit()

        db.refresh(user)

        # ------------------------------------------------
        # Consume reset session
        # ------------------------------------------------

        RESET_OTP_STORE.pop(
            email,
            None,
        )

        print(
            "✅ Password successfully reset:",
            email,
        )

        return user