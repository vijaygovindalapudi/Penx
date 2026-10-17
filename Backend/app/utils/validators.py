"""
Validation utilities for PenX.
"""

import re

# Common disposable email domains
DISPOSABLE_EMAIL_DOMAINS = {
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "trashmail.com",
}


def normalize_email(email: str) -> str:
    """
    Normalize email before saving.
    """
    return email.strip().lower()


def validate_full_name(name: str) -> None:
    """
    Validate user's full name.
    """

    name = name.strip()

    if len(name) < 3:
        raise ValueError(
            "Full name must contain at least 3 characters."
        )

    if len(name) > 100:
        raise ValueError(
            "Full name cannot exceed 100 characters."
        )

    if not re.fullmatch(r"[A-Za-z ]+", name):
        raise ValueError(
            "Full name can contain only letters and spaces."
        )


def validate_password(password: str) -> None:
    """
    Validate password strength.
    """

    if len(password) < 8:
        raise ValueError(
            "Password must be at least 8 characters."
        )

    if not re.search(r"[A-Z]", password):
        raise ValueError(
            "Password must contain one uppercase letter."
        )

    if not re.search(r"[a-z]", password):
        raise ValueError(
            "Password must contain one lowercase letter."
        )

    if not re.search(r"\d", password):
        raise ValueError(
            "Password must contain one number."
        )

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError(
            "Password must contain one special character."
        )


def validate_email(email: str) -> str:
    """
    Validate email and block disposable domains.
    """

    email = normalize_email(email)

    domain = email.split("@")[-1]

    if domain in DISPOSABLE_EMAIL_DOMAINS:
        raise ValueError(
            "Disposable email addresses are not allowed."
        )

    return email