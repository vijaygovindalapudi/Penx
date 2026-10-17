"""
Security routes.

Handles:
- Remote Wipe
- Remote Lock
- Pending device commands
- Wipe acknowledgement
- Remote Wipe cancellation
- Login security alerts
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.security import (
    RemoteWipeRequest,
    RemoteLockRequest,
    SecuritySessionResponse,
    WipeCommandResponse,
    WipeAcknowledgementRequest,
    LoginSecurityEventResponse,
    LoginSecurityActionRequest,
    LoginSecurityActionResponse,
)

from app.services.security_service import SecurityService
from app.services.login_security_service import LoginSecurityService


router = APIRouter(
    prefix="/security",
    tags=["Security"],
)


# =====================================================
# REMOTE WIPE
# =====================================================

@router.post(
    "/remote-wipe",
    response_model=WipeCommandResponse,
)
def request_remote_wipe(
    request: RemoteWipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        security_session = SecurityService.request_remote_wipe(
            db=db,
            current_user=current_user,
            request=request,
        )

        return WipeCommandResponse(
            session_id=str(security_session.id),
            device_id=str(security_session.device_id),
            status=security_session.status,
            message=(
                "Remote wipe request created. "
                "The device will execute the wipe when "
                "it securely reconnects."
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# REMOTE LOCK
# =====================================================

@router.post(
    "/remote-lock",
    response_model=SecuritySessionResponse,
)
def request_remote_lock(
    request: RemoteLockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return SecurityService.request_remote_lock(
            db=db,
            current_user=current_user,
            request=request,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# DEVICE COMMANDS
# =====================================================

@router.get(
    "/devices/{device_id}/commands",
    response_model=list[SecuritySessionResponse],
)
def get_device_commands(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return SecurityService.get_pending_commands(
            db=db,
            current_user=current_user,
            device_id=device_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# WIPE ACKNOWLEDGEMENT
# =====================================================

@router.post(
    "/wipe/acknowledge",
    response_model=SecuritySessionResponse,
)
def acknowledge_wipe(
    request: WipeAcknowledgementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return SecurityService.acknowledge_wipe(
            db=db,
            current_user=current_user,
            request=request,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# CANCEL REMOTE WIPE
# =====================================================

@router.post(
    "/remote-wipe/{session_id}/cancel",
    response_model=SecuritySessionResponse,
)
def cancel_remote_wipe(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return SecurityService.cancel_remote_wipe(
            db=db,
            current_user=current_user,
            session_id=session_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# LOGIN SECURITY ALERTS
# =====================================================

@router.get(
    "/login-alerts",
    response_model=list[LoginSecurityEventResponse],
)
def get_login_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return LoginSecurityService.get_pending_events(
            db=db,
            current_user=current_user,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# CONFIRM LOGIN
# =====================================================

@router.post(
    "/login-alert/confirm",
    response_model=LoginSecurityActionResponse,
)
def confirm_login(
    request: LoginSecurityActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        event = LoginSecurityService.confirm_login(
            db=db,
            current_user=current_user,
            event_id=request.event_id,
        )

        return LoginSecurityActionResponse(
            id=str(event.id),
            status=event.status,
            message="Login confirmed successfully.",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# REJECT LOGIN
# =====================================================

@router.post(
    "/login-alert/reject",
    response_model=LoginSecurityActionResponse,
)
def reject_login(
    request: LoginSecurityActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        event = LoginSecurityService.reject_login(
            db=db,
            current_user=current_user,
            event_id=request.event_id,
        )

        return LoginSecurityActionResponse(
            id=str(event.id),
            status=event.status,
            message=(
                "Login rejected. "
                "The associated session has been revoked."
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =====================================================
# EXPIRE OLD LOGIN ALERTS
# =====================================================

@router.post(
    "/login-alerts/expire",
)
def expire_login_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        count = LoginSecurityService.expire_old_events(
            db=db,
            current_user=current_user,
        )

        return {
            "success": True,
            "expired_count": count,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )