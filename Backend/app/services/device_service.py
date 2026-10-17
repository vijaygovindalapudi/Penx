def mask_owner_email(email: str) -> str:
    local, separator, domain = (email or "").rpartition("@")
    if not separator or not local or not domain:
        return "Hidden account"
    if len(local) > 12:
        return f"{local[:6]}******{local[-4:]}@{domain}"
    if len(local) > 6:
        return f"{local[:2]}******{local[-1:]}@{domain}"
    return f"{local[:1]}******@{domain}"


from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.user import User
from app.schemas.device import DeviceRegister


class DeviceService:

    # =====================================================
    # Register Device
    # =====================================================

    @staticmethod
    def register(
        db: Session,
        current_user: User,
        device_data: DeviceRegister,
    ) -> Device:
        """
        Register a new USB device for the logged-in user.
        """

        existing_device = (
            db.query(Device)
            .filter(Device.usb_serial == device_data.usb_serial)
            .first()
        )

        if existing_device:
            raise ValueError(
                "This USB is already registered to another account."
            )

        device = Device(
            user_id=current_user.id,
            usb_model=device_data.usb_model,
            usb_serial=device_data.usb_serial,
            usb_size=device_data.usb_size,
        )

        db.add(device)
        db.commit()
        db.refresh(device)

        return device

    # =====================================================
    # Get My Devices
    # =====================================================

    @staticmethod
    def get_my_devices(
        db: Session,
        current_user: User,
    ):
        """
        Return all devices registered by the logged-in user.
        """

        return (
            db.query(Device)
            .filter(Device.user_id == current_user.id)
            .all()
        )

    # =====================================================
    # Check USB Ownership
    # =====================================================

    @staticmethod
    def check_usb_owner(
        db: Session,
        current_user: User,
        usb_serial: str,
    ):
        """
        Check whether a USB is already registered and
        whether it belongs to the logged-in user.
        """

        device = (
            db.query(Device)
            .filter(Device.usb_serial == usb_serial)
            .first()
        )

        # USB not registered
        if not device:
            return {
                "registered": False,
                "owner": False,
            }

        # USB belongs to current user
        if device.user_id == current_user.id:
            return {
                "registered": True,
                "owner": True,
            }

        # USB belongs to another user
        return {
            "registered": True,
            "owner": False,
            "owner_name": None,
            "owner_email": mask_owner_email(device.user.email),
        }