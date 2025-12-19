"""
Notification Service for Admin Platform
Handles sending notifications and emails to suppliers
"""
from typing import List, Dict, Any
from datetime import datetime
from app.core.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications and emails to suppliers."""
    
    @staticmethod
    async def get_all_active_suppliers() -> List[Dict[str, Any]]:
        """Get all active and verified suppliers."""
        try:
            db = get_database()
            users_collection = db["users"]
            
            # Find all active, verified suppliers
            cursor = users_collection.find({
                "role": "supplier",
                "is_active": True,
                "is_verified": True
            }, {
                "_id": 1,
                "email": 1,
                "full_name": 1,
                "business_name": 1,
                "supplier_code": 1
            })
            
            suppliers = []
            async for user in cursor:
                suppliers.append({
                    "id": str(user["_id"]),
                    "email": user.get("email"),
                    "full_name": user.get("full_name"),
                    "business_name": user.get("business_name"),
                    "supplier_code": user.get("supplier_code")
                })
            
            return suppliers
        except Exception as e:
            logger.error(f"Error fetching active suppliers: {e}")
            return []
    
    @staticmethod
    async def notify_suppliers_refund_policy_changed() -> Dict[str, Any]:
        """Notify all suppliers that refund policy has changed."""
        try:
            suppliers = await NotificationService.get_all_active_suppliers()
            logger.info(f"Notifying {len(suppliers)} suppliers about refund policy change")
            
            # Create notifications in supplier platform's notification collection
            # Note: Both admin and supplier platforms share the same MongoDB database
            db = get_database()
            notifications_collection = db["notifications"]
            
            notification_docs = []
            for supplier in suppliers:
                notification_doc = {
                    "supplier_id": supplier["id"],
                    "type": "refund_policy_update",
                    "title": "Refund Policy Updated",
                    "message": "The platform refund policy has been updated. Please review the new policy in the footer section.",
                    "read": False,
                    "created_at": datetime.utcnow(),
                    "read_at": None,
                    "booking_id": None,
                    "product_id": None
                }
                notification_docs.append(notification_doc)
            
            # Insert notifications in bulk
            if notification_docs:
                try:
                    await notifications_collection.insert_many(notification_docs)
                    logger.info(f"Created {len(notification_docs)} notifications for suppliers")
                except Exception as insert_error:
                    logger.warning(f"Could not insert notifications: {insert_error}")
            
            # Send emails to all suppliers
            # Note: Email sending should be handled by a shared service or message queue
            # For now, we'll create notifications and log that emails should be sent
            email_count = 0
            logger.info(f"Refund policy update notifications created. Email notifications should be sent via supplier platform service.")
            
            return {
                "suppliers_notified": len(suppliers),
                "notifications_created": len(notification_docs),
                "emails_sent": email_count
            }
        except Exception as e:
            logger.error(f"Error notifying suppliers about refund policy change: {e}", exc_info=True)
            return {
                "suppliers_notified": 0,
                "notifications_created": 0,
                "emails_sent": 0,
                "error": str(e)
            }

