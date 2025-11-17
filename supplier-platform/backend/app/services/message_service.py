# app/services/message_service.py
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.models.message import Message, MessageSender, MessageType
import logging

logger = logging.getLogger(__name__)


class MessageService:
    """Service layer for message/chat operations"""
    
    @staticmethod
    def _generate_conversation_id(customer_id: str, supplier_id: str) -> str:
        """Generate consistent conversation ID for a specific customer-supplier pair"""
        # Sort IDs to ensure same conversation_id regardless of order
        # This ensures that conversation between customer A and supplier B always has the same ID
        # regardless of who sends the first message
        ids = sorted([str(customer_id).strip(), str(supplier_id).strip()])
        conversation_id = f"{ids[0]}:{ids[1]}"
        logger.debug(f"Generated conversation_id: {conversation_id} for customer {customer_id} and supplier {supplier_id}")
        return conversation_id
    
    @staticmethod
    async def send_message(
        supplier_id: str,
        customer_id: str,
        message: str,
        product_id: Optional[str] = None,
        message_type: MessageType = MessageType.GENERAL
    ) -> Dict[str, Any]:
        """Send a message from supplier to customer"""
        try:
            conversation_id = MessageService._generate_conversation_id(customer_id, supplier_id)
            
            # Create message document
            message_doc = Message(
                conversation_id=conversation_id,
                sender_type=MessageSender.SUPPLIER,
                sender_id=supplier_id,
                recipient_id=customer_id,
                product_id=product_id,
                message=message,
                message_type=message_type,
                is_read=False
            )
            
            # Save to database
            await message_doc.insert()
            
            # Format response
            return {
                "id": str(message_doc.id),
                "conversation_id": message_doc.conversation_id,
                "sender_type": message_doc.sender_type.value,
                "sender_id": message_doc.sender_id,
                "recipient_id": message_doc.recipient_id,
                "product_id": message_doc.product_id,
                "message": message_doc.message,
                "message_type": message_doc.message_type.value,
                "is_read": message_doc.is_read,
                "created_at": message_doc.created_at
            }
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise
    
    @staticmethod
    async def get_conversations(supplier_id: str) -> List[Dict[str, Any]]:
        """Get all conversations for a supplier - only shows conversations with this specific supplier"""
        try:
            db = get_database()
            collection = db.messages
            
            # Find all conversations where supplier is involved
            # Ensure we only get conversations where this supplier_id is either sender or recipient
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"sender_id": supplier_id, "sender_type": "supplier"},
                            {"recipient_id": supplier_id}
                        ]
                    }
                },
                {
                    "$sort": {"created_at": -1}
                },
                {
                    "$group": {
                        "_id": "$conversation_id",
                        "last_message": {"$first": "$$ROOT"},
                        "unread_count": {
                            "$sum": {
                                "$cond": [
                                    {"$and": [
                                        {"$eq": ["$recipient_id", supplier_id]},
                                        {"$eq": ["$is_read", False]}
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    "$sort": {"last_message.created_at": -1}
                }
            ]
            
            conversations = []
            async for group in collection.aggregate(pipeline):
                conv_id = group["_id"]
                last_msg = group["last_message"]
                
                # Verify conversation_id contains supplier_id (security check)
                conv_parts = conv_id.split(":")
                if len(conv_parts) != 2 or supplier_id not in conv_parts:
                    logger.warning(f"Skipping conversation {conv_id} - supplier {supplier_id} not part of it")
                    continue
                
                # Determine other party (customer)
                if last_msg["sender_id"] == supplier_id:
                    other_party_id = last_msg["recipient_id"]
                else:
                    other_party_id = last_msg["sender_id"]
                other_party_type = "customer"
                
                # Additional security: ensure other_party_id is not the supplier_id
                if other_party_id == supplier_id:
                    logger.warning(f"Invalid conversation: other_party_id equals supplier_id for {conv_id}")
                    continue
                
                # Get customer name
                other_party_name = await MessageService._get_customer_name(other_party_id)
                
                # Get product info if exists
                product_title = None
                if last_msg.get("product_id"):
                    product = await db.products.find_one(
                        {"_id": ObjectId(last_msg["product_id"])},
                        {"title": 1}
                    )
                    if product:
                        product_title = product.get("title")
                
                conversations.append({
                    "conversation_id": conv_id,
                    "other_party_id": other_party_id,
                    "other_party_name": other_party_name,
                    "other_party_type": other_party_type,
                    "product_id": last_msg.get("product_id"),
                    "product_title": product_title,
                    "last_message": {
                        "id": str(last_msg["_id"]),
                        "message": last_msg["message"],
                        "sender_type": last_msg["sender_type"],
                        "created_at": last_msg["created_at"]
                    },
                    "unread_count": group["unread_count"],
                    "created_at": last_msg["created_at"],
                    "updated_at": last_msg["created_at"]
                })
            
            return conversations
        except Exception as e:
            logger.error(f"Error getting conversations: {e}")
            return []
    
    @staticmethod
    async def get_messages(conversation_id: str, supplier_id: str) -> List[Dict[str, Any]]:
        """Get all messages in a conversation - only for this specific supplier"""
        try:
            db = get_database()
            collection = db.messages
            
            # Verify supplier is part of this conversation
            # First, verify the conversation_id contains this supplier_id
            # conversation_id format: "id1:id2" where ids are sorted
            conversation_parts = conversation_id.split(":")
            if len(conversation_parts) != 2:
                logger.warning(f"Invalid conversation_id format: {conversation_id}")
                return []
            
            # Check if supplier_id is part of this conversation
            if supplier_id not in conversation_parts:
                logger.warning(f"Supplier {supplier_id} not authorized for conversation {conversation_id}")
                return []
            
            # Additional check: verify at least one message exists where supplier is involved
            conversation = await collection.find_one({
                "conversation_id": conversation_id,
                "$or": [
                    {"sender_id": supplier_id, "sender_type": "supplier"},
                    {"recipient_id": supplier_id}
                ]
            })
            if not conversation:
                logger.warning(f"No messages found for supplier {supplier_id} in conversation {conversation_id}")
                return []
            
            # Get all messages in conversation
            messages = []
            async for msg in collection.find(
                {"conversation_id": conversation_id}
            ).sort("created_at", 1):
                messages.append({
                    "id": str(msg["_id"]),
                    "conversation_id": msg["conversation_id"],
                    "sender_type": msg["sender_type"],
                    "sender_id": msg["sender_id"],
                    "recipient_id": msg["recipient_id"],
                    "product_id": msg.get("product_id"),
                    "message": msg["message"],
                    "message_type": msg["message_type"],
                    "is_read": msg["is_read"],
                    "created_at": msg["created_at"]
                })
            
            # Mark messages as read
            await collection.update_many(
                {
                    "conversation_id": conversation_id,
                    "recipient_id": supplier_id,
                    "is_read": False
                },
                {"$set": {"is_read": True}}
            )
            
            return messages
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return []
    
    @staticmethod
    async def _get_customer_name(customer_id: str) -> str:
        """Get customer name from profiles collection"""
        try:
            db = get_database()
            # Try profiles collection (customer platform)
            profile = await db.customer_profiles.find_one(
                {"user_id": customer_id},
                {"user.name": 1, "user.first_name": 1, "user.last_name": 1}
            )
            if profile and profile.get("user"):
                user = profile["user"]
                if user.get("name"):
                    return user["name"]
                if user.get("first_name") or user.get("last_name"):
                    return f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
            return "Customer"
        except:
            return "Customer"

