import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.login_security_event import LoginSecurityEvent
from app.models.user import User
from app.models.security_session import SecuritySession


class LoginSecurityService:

    ACTION_TOKEN_EXPIRY_MINUTES = 15

    # =====================================================
    # Create Login Security Event
    # =====================================================

    @staticmethod
    def create_login_event(
        db: Session,
        current_user: User,
        *,
        device_id: str | None = None,
        ip_address: str | None = None,
        location: str | None = None,
        device_name: str | None = None,
        browser: str | None = None,
        user_agent: str | None = None,
        event_type: str = "LOGIN",
    ) -> LoginSecurityEvent:

        parsed_device_id = None

        if device_id:
            try:
                parsed_device_id = UUID(device_id)
            except (ValueError, TypeError):
                parsed_device_id = None

        action_token = secrets.token_urlsafe(48)

        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=LoginSecurityService.ACTION_TOKEN_EXPIRY_MINUTES
        )

        event = LoginSecurityEvent(
            user_id=current_user.id,
            device_id=parsed_device_id,
            event_type=event_type,
            status="PENDING",
            ip_address=ip_address,
            location=location,
            device_name=device_name,
            browser=browser,
            user_agent=user_agent,
            action_token=action_token,
            token_expires_at=expires_at,
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return event

    # =====================================================
    # Get Event
    # =====================================================

    @staticmethod
    def _get_event(
        db: Session,
        current_user: User,
        event_id: str,
    ) -> LoginSecurityEvent:

        try:
            event_uuid = UUID(event_id)
        except (ValueError, TypeError):
            raise ValueError("Invalid security event ID.")

        event = (
            db.query(LoginSecurityEvent)
            .filter(
                LoginSecurityEvent.id == event_uuid,
                LoginSecurityEvent.user_id == current_user.id,
            )
            .first()
        )

        if not event:
            raise ValueError("Security event not found.")

        return event

    # =====================================================
    # Confirm Login
    # =====================================================

    @staticmethod
    def confirm_login(
        db: Session,
        current_user: User,
        event_id: str,
    ) -> LoginSecurityEvent:

        event = LoginSecurityService._get_event(
            db=db,
            current_user=current_user,
            event_id=event_id,
        )

        if event.status == "CONFIRMED":
            return event

        if event.status != "PENDING":
            raise ValueError(
                "This security alert is no longer pending."
            )

        if (
            event.token_expires_at
            and event.token_expires_at < datetime.now(timezone.utc)
        ):
            event.status = "EXPIRED"

            db.commit()
            db.refresh(event)

            raise ValueError(
                "This security alert has expired."
            )

        event.status = "CONFIRMED"
        event.confirmed_at = datetime.now(timezone.utc)

        # One-time action token
        event.action_token = None
        event.token_expires_at = None

        db.commit()
        db.refresh(event)

        return event

    # =====================================================
    # Reject Login
    # =====================================================

    @staticmethod
    def reject_login(
        db: Session,
        current_user: User,
        event_id: str,
    ) -> LoginSecurityEvent:

        event = LoginSecurityService._get_event(
            db=db,
            current_user=current_user,
            event_id=event_id,
        )

        if event.status == "REJECTED":
            return event

        if event.status != "PENDING":
            raise ValueError(
                "This security alert is no longer pending."
            )

        if (
            event.token_expires_at
            and event.token_expires_at < datetime.now(timezone.utc)
        ):
            event.status = "EXPIRED"

            db.commit()
            db.refresh(event)

            raise ValueError(
                "This security alert has expired."
            )

        event.status = "REJECTED"
        event.rejected_at = datetime.now(timezone.utc)

        # One-time action token
        event.action_token = None
        event.token_expires_at = None

        db.commit()
        db.refresh(event)

        # -------------------------------------------------
        # Revoke active security sessions belonging to the
        # suspicious device.
        # -------------------------------------------------

        if event.device_id:

            (
                db.query(SecuritySession)
                .filter(
                    SecuritySession.user_id == current_user.id,
                    SecuritySession.device_id == event.device_id,
                    SecuritySession.status.in_(
                        [
                            "ACTIVE",
                            "LOCK_REQUESTED",
                        ]
                    ),
                )
                .update(
                    {
                        SecuritySession.status: "REVOKED",
                    },
                    synchronize_session=False,
                )
            )

            db.commit()

        return event

    # =====================================================
    # Pending Alerts
    # =====================================================

    @staticmethod
    def get_pending_events(
        db: Session,
        current_user: User,
    ):

        return (
            db.query(LoginSecurityEvent)
            .filter(
                LoginSecurityEvent.user_id == current_user.id,
                LoginSecurityEvent.status == "PENDING",
                LoginSecurityEvent.token_expires_at
                > datetime.now(timezone.utc),
            )
            .order_by(
                LoginSecurityEvent.created_at.desc()
            )
            .all()
        )

    # =====================================================
    # Expire Old Alerts
    # =====================================================

    @staticmethod
    def expire_old_events(
        db: Session,
        current_user: User,
    ):

        now = datetime.now(timezone.utc)

        events = (
            db.query(LoginSecurityEvent)
            .filter(
                LoginSecurityEvent.user_id == current_user.id,
                LoginSecurityEvent.status == "PENDING",
                LoginSecurityEvent.token_expires_at <= now,
            )
            .all()
        )

        for event in events:
            event.status = "EXPIRED"
            event.action_token = None

        db.commit()

        return len(events)