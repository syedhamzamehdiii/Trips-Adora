from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.notification_service import NotificationService
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: str
    supplier_id: str
    type: str
    title: str
    message: str
    booking_id: Optional[str] = None
    product_id: Optional[str] = None
    read: bool
    created_at: Optional[str] = None
    read_at: Optional[str] = None


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    unread_only: bool = Query(False)
):
    """Get notifications for the current supplier."""
    import logging
    logger = logging.getLogger(__name__)
    
    supplier_id = str(current_user.id)
    logger.info(f"Fetching notifications for supplier_id: {supplier_id}")
    
    notifications = await NotificationService.get_notifications(
        supplier_id=supplier_id,
        limit=limit,
        skip=skip,
        unread_only=unread_only
    )
    unread_count = await NotificationService.get_unread_count(supplier_id)
    
    logger.info(f"Found {len(notifications)} notifications, {unread_count} unread for supplier {supplier_id}")
    
    return NotificationListResponse(
        notifications=[NotificationResponse(**n) for n in notifications],
        total=len(notifications),
        unread_count=unread_count
    )


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications."""
    supplier_id = str(current_user.id)
    count = await NotificationService.get_unread_count(supplier_id)
    return {"unread_count": count}


@router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read."""
    supplier_id = str(current_user.id)
    success = await NotificationService.mark_as_read(notification_id, supplier_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current supplier."""
    supplier_id = str(current_user.id)
    count = await NotificationService.mark_all_as_read(supplier_id)
    return {"message": f"Marked {count} notifications as read", "count": count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a notification."""
    supplier_id = str(current_user.id)
    success = await NotificationService.delete_notification(notification_id, supplier_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return None

