from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.device import (
    DeviceRegister,
    DeviceResponse,
    DeviceCheckRequest,
    DeviceCheckResponse,
)
from app.services.device_service import DeviceService

router = APIRouter(
    prefix="/devices",
    tags=["Devices"],
)


# =====================================================
# Register Device
# =====================================================

@router.post(
    "/register",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_device(
    device: DeviceRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        created_device = DeviceService.register(
            db=db,
            current_user=current_user,
            device_data=device,
        )

        return DeviceResponse(
            id=str(created_device.id),
            usb_model=created_device.usb_model,
            usb_serial=created_device.usb_serial,
            usb_size=created_device.usb_size,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =====================================================
# Check USB Ownership
# =====================================================

@router.post(
    "/check",
    response_model=DeviceCheckResponse,
)
def check_usb(
    request: DeviceCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = DeviceService.check_usb_owner(
        db=db,
        current_user=current_user,
        usb_serial=request.usb_serial,
    )

    return DeviceCheckResponse(**result)


# =====================================================
# Get My Devices
# =====================================================

@router.get(
    "/",
    response_model=list[DeviceResponse],
)
def get_my_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    devices = DeviceService.get_my_devices(
        db=db,
        current_user=current_user,
    )

    return [
        DeviceResponse(
            id=str(device.id),
            usb_model=device.usb_model,
            usb_serial=device.usb_serial,
            usb_size=device.usb_size,
        )
        for device in devices
    ]