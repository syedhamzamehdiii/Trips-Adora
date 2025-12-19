from __future__ import annotations

from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.settings import (
    SupplierSettingsPayload,
    SupplierSettingsResponse,
    SupplierSettingsSectionUpdate,
)
from app.services.settings_service import SupplierSettingsService
from app.services.platform_settings_service import PlatformSettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])

VALID_SECTIONS: Dict[str, str] = {
    "profile": "profile",
    "account": "account",
    "banking": "banking",
    "notifications": "notifications",
}


@router.get("", response_model=SupplierSettingsResponse)
async def get_supplier_settings(current_user: User = Depends(get_current_user)) -> SupplierSettingsResponse:
    doc = await SupplierSettingsService.get_document(str(current_user.id))
    settings = doc.data if doc and doc.data else {}
    updated_at = doc.updated_at if doc else None
    return SupplierSettingsResponse(settings=settings, updated_at=updated_at)


@router.put("", response_model=SupplierSettingsResponse)
async def replace_supplier_settings(
    payload: SupplierSettingsPayload,
    current_user: User = Depends(get_current_user),
) -> SupplierSettingsResponse:
    settings = await SupplierSettingsService.upsert_settings(str(current_user.id), payload.settings)
    doc = await SupplierSettingsService.get_document(str(current_user.id))
    updated_at = doc.updated_at if doc else None
    return SupplierSettingsResponse(settings=settings, updated_at=updated_at)


@router.put("/{section}", response_model=SupplierSettingsResponse)
async def update_supplier_settings_section(
    section: str = Path(
        ...,
        description="Settings section to update",
        regex="^(profile|account|banking|notifications)$",
    ),
    payload: Optional[SupplierSettingsSectionUpdate] = None,
    current_user: User = Depends(get_current_user),
) -> SupplierSettingsResponse:
    if section not in VALID_SECTIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported settings section")

    section_payload = payload.settings if payload and payload.settings is not None else {}
    settings = await SupplierSettingsService.update_section(
        str(current_user.id),
        section,
        section_payload,
    )
    doc = await SupplierSettingsService.get_document(str(current_user.id))
    updated_at = doc.updated_at if doc else None
    return SupplierSettingsResponse(settings=settings, updated_at=updated_at)


@router.get("/platform")
async def get_platform_settings():
    """Get platform-wide settings (commission, payout schedule, refund policy)."""
    try:
        return await PlatformSettingsService.get_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch platform settings: {str(e)}")

