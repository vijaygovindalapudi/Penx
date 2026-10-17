"""
Security service for Remote Lock and Remote Wipe.
"""

import secrets
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.security_session import SecuritySession
from app.models.user import User
from app.schemas.security import (
    RemoteLockRequest,
    RemoteWipeRequest,
    WipeAcknowledgementRequest,
)
from app.core.security import verify_password


class SecurityService:

    # =====================================================
    # Internal Helpers
    # =====================================================

    @staticmethod
    def _get_user_device(
        db: Session,
        current_user: User,
        device_id: str,
    ) -> Device:

        try:
            device_uuid = UUID(device_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid device ID.")

        device = (
            db.query(Device)
            .filter(
                Device.id == device_uuid,
                Device.user_id == current_user.id,
            )
            .first()
        )

        if not device:
            raise ValueError(
                "Device not found or does not belong to your account."
            )

        return device

    # =====================================================
    # Verify Password
    # =====================================================

    @staticmethod
    def _verify_user_password(
        current_user: User,
        password: str,
    ) -> None:

        if not verify_password(
            password,
            current_user.password_hash,
        ):
            raise ValueError("Incorrect password.")

    # =====================================================
    # Remote Wipe
    # =====================================================

    @staticmethod
    def request_remote_wipe(
        db: Session,
        current_user: User,
        request: RemoteWipeRequest,
    ) -> SecuritySession:

        # -------------------------------------------------
        # Verify full name
        # -------------------------------------------------

        if request.full_name.strip() != current_user.full_name.strip():
            raise ValueError(
                "Full name does not match your account."
            )

        # -------------------------------------------------
        # Verify password
        # -------------------------------------------------

        SecurityService._verify_user_password(
            current_user=current_user,
            password=request.password,
        )

        # -------------------------------------------------
        # Verify device ownership
        # -------------------------------------------------

        device = SecurityService._get_user_device(
            db=db,
            current_user=current_user,
            device_id=request.device_id,
        )

        # -------------------------------------------------
        # Check existing pending wipe
        # -------------------------------------------------

        existing = (
            db.query(SecuritySession)
            .filter(
                SecuritySession.device_id == device.id,
                SecuritySession.user_id == current_user.id,
                SecuritySession.session_type == "REMOTE_WIPE",
                SecuritySession.status.in_(
                    [
                        "WIPE_REQUESTED",
                        "PENDING_DEVICE_CONNECTION",
                        "WIPE_IN_PROGRESS",
                    ]
                ),
            )
            .first()
        )

        if existing:
            raise ValueError(
                "A remote wipe is already pending for this device."
            )

        # -------------------------------------------------
        # Generate secure command token
        # -------------------------------------------------

        command_token = secrets.token_urlsafe(48)

        # -------------------------------------------------
        # Create security session
        # -------------------------------------------------

        security_session = SecuritySession(
            user_id=current_user.id,
            device_id=device.id,
            session_type="REMOTE_WIPE",
            status="WIPE_REQUESTED",
            command_token=command_token,
            requested_at=datetime.now(timezone.utc),
        )

        db.add(security_session)
        db.commit()
        db.refresh(security_session)

        return security_session

    # =====================================================
    # Remote Lock
    # =====================================================

    @staticmethod
    def request_remote_lock(
        db: Session,
        current_user: User,
        request: RemoteLockRequest,
    ) -> SecuritySession:

        # -------------------------------------------------
        # Verify password
        # -------------------------------------------------

        SecurityService._verify_user_password(
            current_user=current_user,
            password=request.password,
        )

        # -------------------------------------------------
        # Verify device ownership
        # -------------------------------------------------

        device = SecurityService._get_user_device(
            db=db,
            current_user=current_user,
            device_id=request.device_id,
        )

        # -------------------------------------------------
        # Check existing lock
        # -------------------------------------------------

        existing = (
            db.query(SecuritySession)
            .filter(
                SecuritySession.device_id == device.id,
                SecuritySession.user_id == current_user.id,
                SecuritySession.session_type == "REMOTE_LOCK",
                SecuritySession.status == "LOCK_REQUESTED",
            )
            .first()
        )

        if existing:
            raise ValueError(
                "A remote lock is already pending for this device."
            )

        command_token = secrets.token_urlsafe(48)

        security_session = SecuritySession(
            user_id=current_user.id,
            device_id=device.id,
            session_type="REMOTE_LOCK",
            status="LOCK_REQUESTED",
            command_token=command_token,
            requested_at=datetime.now(timezone.utc),
        )

        db.add(security_session)
        db.commit()
        db.refresh(security_session)

        return security_session

    # =====================================================
    # Get Pending Commands
    # =====================================================

    @staticmethod
    def get_pending_commands(
        db: Session,
        current_user: User,
        device_id: str,
    ):

        device = SecurityService._get_user_device(
            db=db,
            current_user=current_user,
            device_id=device_id,
        )

        return (
            db.query(SecuritySession)
            .filter(
                SecuritySession.device_id == device.id,
                SecuritySession.user_id == current_user.id,
                SecuritySession.status.in_(
                    [
                        "WIPE_REQUESTED",
                        "PENDING_DEVICE_CONNECTION",
                        "LOCK_REQUESTED",
                    ]
                ),
            )
            .order_by(
                SecuritySession.requested_at.asc()
            )
            .all()
        )

    # =====================================================
    # Wipe Acknowledgement
    # =====================================================

    @staticmethod
    def acknowledge_wipe(
        db: Session,
        current_user: User,
        request: WipeAcknowledgementRequest,
    ) -> SecuritySession:

        try:
            session_uuid = UUID(request.session_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid security session ID.")

        security_session = (
            db.query(SecuritySession)
            .filter(
                SecuritySession.id == session_uuid,
                SecuritySession.user_id == current_user.id,
                SecuritySession.session_type == "REMOTE_WIPE",
            )
            .first()
        )

        if not security_session:
            raise ValueError(
                "Remote wipe session not found."
            )

        # -------------------------------------------------
        # Prevent duplicate acknowledgement
        # -------------------------------------------------

        if security_session.status == "WIPED":
            return security_session

        # -------------------------------------------------
        # Successful wipe
        # -------------------------------------------------

        if request.success:

            security_session.status = "WIPED"

            security_session.completed_at = datetime.now(
                timezone.utc
            )

            security_session.failure_reason = None

        # -------------------------------------------------
        # Failed wipe
        # -------------------------------------------------

        else:

            security_session.status = "WIPE_FAILED"

            security_session.completed_at = datetime.now(
                timezone.utc
            )

            security_session.failure_reason = (
                request.failure_reason
                or "Remote wipe failed on the device."
            )

        db.commit()
        db.refresh(security_session)

        return security_session

    # =====================================================
    # Cancel Remote Wipe
    # =====================================================

    @staticmethod
    def cancel_remote_wipe(
        db: Session,
        current_user: User,
        session_id: str,
    ) -> SecuritySession:

        try:
            session_uuid = UUID(session_id)
        except (ValueError, TypeError):
            raise ValueError(
                "Invalid security session ID."
            )

        security_session = (
            db.query(SecuritySession)
            .filter(
                SecuritySession.id == session_uuid,
                SecuritySession.user_id == current_user.id,
                SecuritySession.session_type == "REMOTE_WIPE",
            )
            .first()
        )

        if not security_session:
            raise ValueError(
                "Remote wipe session not found."
            )

        if security_session.status not in (
            "WIPE_REQUESTED",
            "PENDING_DEVICE_CONNECTION",
        ):
            raise ValueError(
                "This wipe request can no longer be cancelled."
            )

        security_session.status = "CANCELLED"

        db.commit()
        db.refresh(security_session)

        return security_session