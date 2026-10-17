"""
Security utilities for PenX.

Handles:

- Password hashing
- Password verification
- JWT access token creation
- JWT token validation
- Short-lived verification tokens
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# ======================================================
# Password Hashing
# ======================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a plain text password.
    """

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against its hash.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ======================================================
# JWT Token Creation
# ======================================================

def create_access_token(
    data: dict,
    expires_minutes: int | None = None,
) -> str:
    """
    Create a JWT token.

    If expires_minutes is not supplied,
    the normal PenX access-token lifetime
    from application settings is used.
    """

    to_encode = data.copy()

    if expires_minutes is None:
        expires_minutes = (
            settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=expires_minutes
        )
    )

    to_encode.update({
        "exp": expire,
    })

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


# ======================================================
# JWT Token Validation
# ======================================================

def decode_access_token(
    token: str,
) -> dict:
    """
    Decode and validate a JWT token.
    """

    try:

        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

        return payload

    except JWTError as exc:

        raise ValueError(
            "Invalid or expired token"
        ) from exc


# ======================================================
# OTP Verification Token
# ======================================================

def create_otp_verification_token(
    email: str,
    purpose: str,
) -> str:
    """
    Create a short-lived token proving that
    the user successfully verified an OTP.

    This token is NOT an access token.
    It is only valid for the requested purpose.
    """

    return create_access_token(
        {
            "sub": email,
            "type": "otp_verification",
            "purpose": purpose,
        },
        expires_minutes=10,
    )