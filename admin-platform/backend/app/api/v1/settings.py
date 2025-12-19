from fastapi import APIRouter, HTTPException
import logging

from app.schemas.platform_settings import PlatformSettingsResponse, PlatformSettingsUpdateRequest
from app.services.platform_settings_service import PlatformSettingsService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/settings/platform", response_model=PlatformSettingsResponse)
async def get_platform_settings():
    try:
        return await PlatformSettingsService.get_settings()
    except Exception as e:
        logger.error(f"Error fetching platform settings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch platform settings")


@router.put("/settings/platform", response_model=PlatformSettingsResponse)
async def update_platform_settings(payload: PlatformSettingsUpdateRequest):
    try:
        # Check if refund_policy is being updated
        refund_policy_changed = payload.refund_policy is not None
        
        result = await PlatformSettingsService.update_settings(
            commission_rate=payload.commission_rate,
            commission_percent=payload.commission_percent,
            payout_schedule=payload.payout_schedule,
            refund_policy=payload.refund_policy,
            platform_name=payload.platform_name,
            platform_url=payload.platform_url,
            support_email=payload.support_email,
            contact_number=payload.contact_number,
        )
        
        # Notify suppliers if refund policy changed
        if refund_policy_changed:
            try:
                from app.services.notification_service import NotificationService
                await NotificationService.notify_suppliers_refund_policy_changed()
            except Exception as notify_error:
                logger.warning(f"Failed to notify suppliers about refund policy change: {notify_error}")
        
        return result
    except Exception as e:
        logger.error(f"Error updating platform settings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update platform settings")


