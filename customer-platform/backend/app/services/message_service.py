# app/services/message_service.py
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.models.message import MessageSender, MessageType
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
        customer_id: str,
        supplier_id: str,
        message: str,
        product_id: Optional[str] = None,
        message_type: MessageType = MessageType.GENERAL
    ) -> Dict[str, Any]:
        """Send a message from customer to supplier"""
        try:
            conversation_id = MessageService._generate_conversation_id(customer_id, supplier_id)
            
            # Create message document (using raw MongoDB since customer platform doesn't use Beanie)
            db = get_database()
            collection = db.messages
            
            message_doc = {
                "conversation_id": conversation_id,
                "sender_type": MessageSender.CUSTOMER.value,
                "sender_id": customer_id,
                "recipient_id": supplier_id,
                "product_id": product_id,
                "message": message,
                "message_type": message_type.value,
                "is_read": False,
                "attachments": [],
                "created_at": datetime.utcnow()
            }
            
            # Save to database
            result = await collection.insert_one(message_doc)
            
            # Format response
            return {
                "id": str(result.inserted_id),
                "conversation_id": message_doc["conversation_id"],
                "sender_type": message_doc["sender_type"],
                "sender_id": message_doc["sender_id"],
                "recipient_id": message_doc["recipient_id"],
                "product_id": message_doc["product_id"],
                "message": message_doc["message"],
                "message_type": message_doc["message_type"],
                "is_read": message_doc["is_read"],
                "created_at": message_doc["created_at"]
            }
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise
    
    @staticmethod
    async def get_conversations(customer_id: str) -> List[Dict[str, Any]]:
        """Get all conversations for a customer - only shows conversations with this specific customer"""
        try:
            db = get_database()
            collection = db.messages
            
            # Find all conversations where customer is involved
            # Ensure we only get conversations where this customer_id is either sender or recipient
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"sender_id": customer_id, "sender_type": "customer"},
                            {"recipient_id": customer_id}
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
                                    {
                                        "$and": [
                                            {"$eq": ["$recipient_id", customer_id]},
                                            {"$eq": ["$is_read", False]}
                                        ]
                                    },
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
                
                # Verify conversation_id contains customer_id (security check)
                conv_parts = conv_id.split(":")
                if len(conv_parts) != 2 or customer_id not in conv_parts:
                    logger.warning(f"Skipping conversation {conv_id} - customer {customer_id} not part of it")
                    continue
                
                # Determine other party
                if last_msg.get("sender_id") == customer_id:
                    other_party_id = last_msg.get("recipient_id")
                    other_party_type = "supplier"
                else:
                    other_party_id = last_msg.get("sender_id")
                    other_party_type = "supplier"  # Since customer is recipient, sender must be supplier
                
                # Additional security: ensure other_party_id is not the customer_id
                if other_party_id == customer_id:
                    logger.warning(f"Invalid conversation: other_party_id equals customer_id for {conv_id}")
                    continue
                
                # Get other party name
                other_party_name = await MessageService._get_user_name(other_party_id)
                
                # Get product info if exists
                product_title = None
                product_id = last_msg.get("product_id")
                if product_id:
                    try:
                        product = await db.products.find_one(
                            {"_id": ObjectId(product_id) if ObjectId.is_valid(product_id) else product_id},
                            {"title": 1}
                        )
                        if product:
                            product_title = product.get("title")
                    except:
                        pass
                
                conversations.append({
                    "conversation_id": conv_id,
                    "other_party_id": other_party_id,
                    "other_party_name": other_party_name,
                    "other_party_type": other_party_type,
                    "product_id": product_id,
                    "product_title": product_title,
                    "last_message": {
                        "id": str(last_msg.get("_id", "")),
                        "message": last_msg.get("message", ""),
                        "sender_type": last_msg.get("sender_type", "customer"),
                        "created_at": last_msg.get("created_at", datetime.utcnow())
                    },
                    "unread_count": group.get("unread_count", 0),
                    "created_at": last_msg.get("created_at", datetime.utcnow()),
                    "updated_at": last_msg.get("created_at", datetime.utcnow())
                })
            
            return conversations
        except Exception as e:
            logger.error(f"Error getting conversations: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    @staticmethod
    async def get_messages(conversation_id: str, customer_id: str) -> List[Dict[str, Any]]:
        """Get all messages in a conversation - only for this specific customer"""
        try:
            db = get_database()
            collection = db.messages
            
            # Verify customer is part of this conversation
            # First, verify the conversation_id contains this customer_id
            # conversation_id format: "id1:id2" where ids are sorted
            conversation_parts = conversation_id.split(":")
            if len(conversation_parts) != 2:
                logger.warning(f"Invalid conversation_id format: {conversation_id}")
                return []
            
            # Check if customer_id is part of this conversation
            if customer_id not in conversation_parts:
                logger.warning(f"Customer {customer_id} not authorized for conversation {conversation_id}")
                return []
            
            # Additional check: verify at least one message exists where customer is involved
            conversation = await collection.find_one({
                "conversation_id": conversation_id,
                "$or": [
                    {"sender_id": customer_id, "sender_type": "customer"},
                    {"recipient_id": customer_id}
                ]
            })
            if not conversation:
                logger.warning(f"No messages found for customer {customer_id} in conversation {conversation_id}")
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
                    "recipient_id": customer_id,
                    "is_read": False
                },
                {"$set": {"is_read": True}}
            )
            
            return messages
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return []
    
    @staticmethod
    async def _get_user_name(user_id: str) -> str:
        """Get user name from users collection"""
        try:
            db = get_database()
            # Try users collection
            user = await db.users.find_one(
                {"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id},
                {"business_name": 1, "full_name": 1}
            )
            if user:
                return user.get("business_name") or user.get("full_name") or "Unknown"
            return "Unknown"
        except:
            return "Unknown"

