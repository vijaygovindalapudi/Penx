"""
Authentication routes for PenX.
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
)

from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db

from app.models.user import User

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    GoogleLoginRequest,
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest,
    TokenResponse,
    MessageResponse,
)

from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.services.login_security_service import LoginSecurityService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ======================================================
# Register
# ======================================================

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):

    try:

        token, created_user = AuthService.register(
            db=db,
            user_data=user_data,
        )

        # ----------------------------------------------
        # Send Welcome Email
        # ----------------------------------------------

        await EmailService.send_welcome_email(
            email=created_user.email,
            full_name=created_user.full_name,
            username=created_user.username,
            penx_id=created_user.penx_id,
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ======================================================
# Normal Login
# ======================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login_user(
    request: Request,
    user_data: UserLogin,
    db: Session = Depends(get_db),
):

    try:

        # ----------------------------------------------
        # Authenticate user
        # ----------------------------------------------

        token = AuthService.login(
            db=db,
            user_data=user_data,
        )

        # ----------------------------------------------
        # Get authenticated user
        # ----------------------------------------------

        user = (
            db.query(User)
            .filter(User.email == user_data.email)
            .first()
        )

        if user:

            # ------------------------------------------
            # Collect login information
            # ------------------------------------------

            ip_address = (
                request.client.host
                if request.client
                else None
            )

            user_agent = request.headers.get(
                "user-agent"
            )

            browser = user_agent

            # ------------------------------------------
            # Create Login Security Event
            # ------------------------------------------

            try:

                login_event = (
                    LoginSecurityService.create_login_event(
                        db=db,
                        current_user=user,
                        ip_address=ip_address,
                        device_name="PenX Desktop",
                        browser=browser,
                        user_agent=user_agent,
                        event_type="LOGIN",
                    )
                )

                print(
                    "🔐 Login security event created:",
                    login_event.id,
                )

                # --------------------------------------
                # Send New Login Security Email
                # --------------------------------------

                try:

                    await EmailService.send_login_security_alert(
                        email=user.email,
                        full_name=user.full_name,
                        ip_address=ip_address,
                        device_name="PenX Desktop",
                        browser=browser,
                        login_time=str(
                            login_event.created_at
                        ),
                        action_token=(
                            login_event.action_token
                        ),
                    )

                    print(
                        "📧 New login security alert sent."
                    )

                except Exception as email_error:

                    # Email failure must NOT prevent
                    # successful authentication.

                    print(
                        "⚠️ Login security email "
                        "could not be sent:",
                        email_error,
                    )

            except Exception as security_error:

                # Security event failure must NOT
                # prevent a valid login.

                print(
                    "⚠️ Login security event could "
                    "not be created:",
                    security_error,
                )

        # ----------------------------------------------
        # Return PenX JWT
        # ----------------------------------------------

        return TokenResponse(
            access_token=token,
            token_type="bearer",
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )


# ======================================================
# Google Login
# ======================================================

@router.post(
    "/google",
    response_model=TokenResponse,
)
async def google_login(
    request: Request,
    google_request: GoogleLoginRequest,
    db: Session = Depends(get_db),
):

    try:

        print(
            "🔵 Google login request received."
        )

        # ----------------------------------------------
        # Authenticate Google user
        # ----------------------------------------------

        token, user = AuthService.google_login(
            db=db,
            id_token=google_request.id_token,
        )

        print(
            "✅ Google authentication successful:",
            user.email,
        )

        # ----------------------------------------------
        # Collect login information
        # ----------------------------------------------

        ip_address = (
            request.client.host
            if request.client
            else None
        )

        user_agent = request.headers.get(
            "user-agent"
        )

        # ----------------------------------------------
        # Create Login Security Event
        # ----------------------------------------------

        try:

            google_login_event = (
                LoginSecurityService.create_login_event(
                    db=db,
                    current_user=user,
                    ip_address=ip_address,
                    device_name="PenX Desktop",
                    browser=user_agent,
                    user_agent=user_agent,
                    event_type="GOOGLE_LOGIN",
                )
            )

            print(
                "🔐 Google login security event created:",
                google_login_event.id,
            )

        except Exception as security_error:

            print(
                "⚠️ Google login security event "
                "could not be created:",
                security_error,
            )

        # ----------------------------------------------
        # Existing Google Security Email
        # ----------------------------------------------

        try:

            await EmailService.send_google_login_alert(
                email=user.email,
                full_name=user.full_name,
            )

            print(
                "📧 Google login security email sent."
            )

        except Exception as email_error:

            print(
                "⚠️ Google login email could not be sent:",
                email_error,
            )

        # ----------------------------------------------
        # Return PenX JWT
        # ----------------------------------------------

        return TokenResponse(
            access_token=token,
            token_type="bearer",
        )

    except ValueError as exc:

        print(
            "❌ Google login validation error:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "❌ Google Login Error:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed.",
        )


# ======================================================
# Forgot Password
# ======================================================

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):

    try:

        print(
            "🔐 Password reset requested for:",
            request.email,
        )

        # ----------------------------------------------
        # Generate reset OTP
        # ----------------------------------------------

        otp = AuthService.forgot_password(
            db=db,
            request=request,
        )

        # ----------------------------------------------
        # Send OTP email
        # ----------------------------------------------

        await EmailService.send_otp_email(
            email=str(request.email),
            otp=otp,
        )

        print(
            "📧 Password reset OTP sent."
        )

        return MessageResponse(
            message=(
                "If an account exists for this email, "
                "a password reset OTP has been sent."
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "❌ Forgot password error:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process password reset request.",
        )


# ======================================================
# Verify Reset OTP
# ======================================================

@router.post(
    "/verify-reset-otp",
    response_model=TokenResponse,
)
def verify_reset_otp(
    request: VerifyResetOTPRequest,
    db: Session = Depends(get_db),
):

    try:

        print(
            "🔐 Verifying password reset OTP for:",
            request.email,
        )

        # ----------------------------------------------
        # Verify OTP
        # ----------------------------------------------

        reset_token = AuthService.verify_reset_otp(
            db=db,
            request=request,
        )

        print(
            "✅ Password reset OTP verified."
        )

        # ----------------------------------------------
        # Return temporary reset token
        # ----------------------------------------------

        return TokenResponse(
            access_token=reset_token,
            token_type="password-reset",
        )

    except ValueError as exc:

        print(
            "❌ Reset OTP verification failed:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "❌ Reset OTP error:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify reset OTP.",
        )


# ======================================================
# Reset Password
# ======================================================

@router.post(
    "/reset-password",
    response_model=MessageResponse,
)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):

    try:

        print(
            "🔑 Password reset requested for:",
            request.email,
        )

        # ----------------------------------------------
        # Reset password
        # ----------------------------------------------

        user = AuthService.reset_password(
            db=db,
            request=request,
        )

        print(
            "✅ Password successfully changed:",
            user.email,
        )

        # ----------------------------------------------
        # Send password changed email
        # ----------------------------------------------

        try:

            await EmailService.send_password_changed_email(
                email=user.email,
                full_name=user.full_name,
            )

            print(
                "📧 Password changed email sent."
            )

        except Exception as email_error:

            print(
                "⚠️ Password changed email could not be sent:",
                email_error,
            )

        return MessageResponse(
            message="Password reset successfully.",
        )

    except ValueError as exc:

        print(
            "❌ Password reset validation error:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "❌ Password reset error:",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset password.",
        )


# ======================================================
# Current User
# ======================================================

@router.get("/me")
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):

    return {
        "id": str(current_user.id),
        "penx_id": current_user.penx_id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
    }