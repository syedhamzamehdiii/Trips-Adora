from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_database
from app.models.notification import Notification
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing supplier notifications."""
    
    @staticmethod
    async def get_notifications(
        supplier_id: str,
        limit: int = 50,
        skip: int = 0,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get notifications for a supplier."""
        try:
            if unread_only:
                notifications = await Notification.find(
                    Notification.supplier_id == supplier_id,
                    Notification.read == False
                ).sort(-Notification.created_at).skip(skip).limit(limit).to_list()
            else:
                notifications = await Notification.find(
                    Notification.supplier_id == supplier_id
                ).sort(-Notification.created_at).skip(skip).limit(limit).to_list()
            
            return [
                {
                    "id": str(notif.id),
                    "supplier_id": notif.supplier_id,
                    "type": notif.type,
                    "title": notif.title,
                    "message": notif.message,
                    "booking_id": notif.booking_id,
                    "product_id": notif.product_id,
                    "read": notif.read,
                    "created_at": notif.created_at.isoformat() if notif.created_at else None,
                    "read_at": notif.read_at.isoformat() if notif.read_at else None,
                }
                for notif in notifications
            ]
        except Exception as e:
            logger.error(f"Error fetching notifications for supplier {supplier_id}: {e}")
            return []
    
    @staticmethod
    async def get_unread_count(supplier_id: str) -> int:
        """Get count of unread notifications for a supplier."""
        try:
            count = await Notification.find(
                Notification.supplier_id == supplier_id,
                Notification.read == False
            ).count()
            return count
        except Exception as e:
            logger.error(f"Error counting unread notifications for supplier {supplier_id}: {e}")
            return 0
    
    @staticmethod
    async def mark_as_read(notification_id: str, supplier_id: str) -> bool:
        """Mark a notification as read."""
        try:
            from bson import ObjectId
            notification = await Notification.find_one(
                Notification.id == ObjectId(notification_id),
                Notification.supplier_id == supplier_id
            )
            if not notification:
                return False
            
            notification.read = True
            notification.read_at = datetime.utcnow()
            await notification.save()
            return True
        except Exception as e:
            logger.error(f"Error marking notification {notification_id} as read: {e}")
            return False
    
    @staticmethod
    async def mark_all_as_read(supplier_id: str) -> int:
        """Mark all notifications as read for a supplier."""
        try:
            notifications = await Notification.find(
                Notification.supplier_id == supplier_id,
                Notification.read == False
            ).to_list()
            
            count = 0
            for notif in notifications:
                notif.read = True
                notif.read_at = datetime.utcnow()
                await notif.save()
                count += 1
            
            return count
        except Exception as e:
            logger.error(f"Error marking all notifications as read for supplier {supplier_id}: {e}")
            return 0
    
    @staticmethod
    async def delete_notification(notification_id: str, supplier_id: str) -> bool:
        """Delete a notification."""
        try:
            from bson import ObjectId
            notification = await Notification.find_one(
                Notification.id == ObjectId(notification_id),
                Notification.supplier_id == supplier_id
            )
            if notification:
                await notification.delete()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting notification {notification_id}: {e}")
            return False

