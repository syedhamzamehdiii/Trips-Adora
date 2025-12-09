"""
Message Service for Admin Platform
Handles sending messages from admin to customers
"""
from datetime import datetime
from typing import Dict, Any
from bson import ObjectId
from app.core.database import get_database
import logging

logger = logging.getLogger(__name__)


class AdminMessageService:
    MESSAGES_COLLECTION = "messages"
    ADMIN_ID = "admin"

    @staticmethod
    def _get_collection(name: str):
        """Get a MongoDB collection by name."""
        db = get_database()
        return db[name]

    @staticmethod
    async def send_admin_message(
        customer_id: str,
        message: str,
        admin_name: str = "Admin"
    ) -> Dict[str, Any]:
        """
        Send a message from admin to customer.
        
        Args:
            customer_id: Customer user ID
            message: Message content
            admin_name: Name of the admin sending the message
            
        Returns:
            Created message document
        """
        try:
            messages_collection = AdminMessageService._get_collection(AdminMessageService.MESSAGES_COLLECTION)
            
            # Generate conversation ID for admin-customer
            # Format: "admin|cust:{customer_id}"
            conversation_id = f"admin|cust:{customer_id}"
            
            # Create message document
            message_doc = {
                "conversation_id": conversation_id,
                "sender_type": "admin",  # Admin sender type
                "sender_id": AdminMessageService.ADMIN_ID,
                "sender_name": admin_name,  # Store admin name for display
                "recipient_id": customer_id,
                "product_id": None,
                "product_title": None,
                "subject": None,
                "message": message,
                "message_type": "support",  # Admin messages are typically support
                "reply_to_message_id": None,
                "reply_preview": None,
                "is_read": False,
                "attachments": [],
                "created_at": datetime.utcnow()
            }
            
            # Save to database
            result = await messages_collection.insert_one(message_doc)
            message_doc["_id"] = result.inserted_id
            message_doc["id"] = str(result.inserted_id)
            
            logger.info(f"Admin message sent to customer {customer_id}")
            
            return message_doc
            
        except Exception as e:
            logger.error(f"Error sending admin message: {e}")
            raise

