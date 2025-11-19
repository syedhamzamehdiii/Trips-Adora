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

    CUSTOMER_PREFIX = "cust:"
    SUPPLIER_PREFIX = "sup:"
    TOKEN_SEPARATOR = "|"

    @staticmethod
    def _format_customer_token(customer_id: str) -> str:
        return f"{MessageService.CUSTOMER_PREFIX}{str(customer_id).strip()}"

    @staticmethod
    def _format_supplier_token(supplier_id: str) -> str:
        return f"{MessageService.SUPPLIER_PREFIX}{str(supplier_id).strip()}"

    @staticmethod
    def _generate_conversation_id(customer_id: str, supplier_id: str) -> str:
        """Generate consistent conversation ID for a specific customer-supplier pair."""
        customer_token = MessageService._format_customer_token(customer_id)
        supplier_token = MessageService._format_supplier_token(supplier_id)
        conversation_id = f"{customer_token}{MessageService.TOKEN_SEPARATOR}{supplier_token}"
        logger.debug(
            "Generated conversation_id: %s for customer %s and supplier %s",
            conversation_id,
            customer_id,
            supplier_id,
        )
        return conversation_id

    @staticmethod
    def _conversation_contains_user(conversation_id: str, role: str, user_id: str) -> bool:
        """Check whether the given conversation_id includes the specific user in the specified role."""
        if not conversation_id:
            return False

        tokens: list[str]
        if MessageService.TOKEN_SEPARATOR in conversation_id:
            tokens = conversation_id.split(MessageService.TOKEN_SEPARATOR)
        else:
            # Legacy format used ":" only
            tokens = conversation_id.split(":")

        normalized_id = str(user_id).strip()

        for token in tokens:
            token = token.strip()
            if role == "customer":
                if token.startswith(MessageService.CUSTOMER_PREFIX) and token[len(MessageService.CUSTOMER_PREFIX):] == normalized_id:
                    return True
            elif role == "supplier":
                if token.startswith(MessageService.SUPPLIER_PREFIX) and token[len(MessageService.SUPPLIER_PREFIX):] == normalized_id:
                    return True

            # Legacy fallback (token is raw user_id)
            if token == normalized_id:
                return True

        return False

    @staticmethod
    async def _get_product_metadata(product_id: Optional[str]) -> tuple[Optional[str], Optional[str]]:
        """Fetch product title and supplier id for context."""
        if not product_id:
            return (None, None)

        try:
            db = get_database()
            query_id = ObjectId(product_id) if ObjectId.is_valid(product_id) else product_id
            product = await db.products.find_one(
                {"_id": query_id},
                {"title": 1, "name": 1, "productTitle": 1, "supplier_id": 1},
            )
            if not product:
                return (None, None)

            supplier_id = product.get("supplier_id")
            if isinstance(supplier_id, ObjectId):
                supplier_id = str(supplier_id)

            title = product.get("title") or product.get("name") or product.get("productTitle")
            if title:
                title = str(title)
            return (title, str(supplier_id) if supplier_id else None)
        except Exception as exc:
            logger.warning("Unable to fetch product metadata for %s: %s", product_id, exc)
            return (None, None)

    @staticmethod
    async def _build_reply_metadata(message_id: Optional[str], conversation_id: str) -> tuple[Optional[str], Optional[str]]:
        """Return reply_to_message_id and preview text if valid."""
        if not message_id:
            return (None, None)

        try:
            db = get_database()
            query_id = ObjectId(message_id) if ObjectId.is_valid(message_id) else message_id
            original = await db.messages.find_one({"_id": query_id})
            if not original:
                return (None, None)
            if original.get("conversation_id") != conversation_id:
                logger.warning(
                    "Reply message %s does not belong to conversation %s",
                    message_id,
                    conversation_id,
                )
                return (None, None)
            full_text = original.get("message", "")
            preview = (full_text or "")[:140]
            if full_text and len(full_text) > 140:
                preview += "…"
            return (str(original.get("_id")), preview)
        except Exception as exc:
            logger.warning("Unable to build reply metadata for %s: %s", message_id, exc)
            return (None, None)
    
    @staticmethod
    async def send_message(
        supplier_id: str,
        customer_id: str,
        message: str,
        product_id: Optional[str] = None,
        message_type: MessageType = MessageType.GENERAL,
        reply_to_message_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a message from supplier to customer"""
        try:
            conversation_id = MessageService._generate_conversation_id(customer_id, supplier_id)

            product_title, product_supplier_id = await MessageService._get_product_metadata(product_id)
            if product_supplier_id and str(product_supplier_id) != str(supplier_id):
                logger.warning(
                    "Supplier %s attempted to send message for product %s owned by %s",
                    supplier_id,
                    product_id,
                    product_supplier_id,
                )

            reply_id, reply_preview = await MessageService._build_reply_metadata(
                reply_to_message_id, conversation_id
            )
            
            # Create message document
            message_doc = Message(
                conversation_id=conversation_id,
                sender_type=MessageSender.SUPPLIER,
                sender_id=supplier_id,
                recipient_id=customer_id,
                product_id=product_id,
                product_title=product_title,
                message=message,
                message_type=message_type,
                reply_to_message_id=reply_id,
                reply_preview=reply_preview,
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
                "product_title": message_doc.product_title,
                "message": message_doc.message,
                "message_type": message_doc.message_type.value,
                "reply_to_message_id": message_doc.reply_to_message_id,
                "reply_preview": message_doc.reply_preview,
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

                # Verify conversation_id contains supplier role for this user (security check)
                if not MessageService._conversation_contains_user(conv_id, "supplier", supplier_id):
                    logger.debug(
                        "Skipping conversation %s - supplier %s not part of it",
                        conv_id,
                        supplier_id,
                    )
                    continue
                
                # Determine other party (customer)
                if last_msg["sender_id"] == supplier_id:
                    other_party_id = last_msg["recipient_id"]
                else:
                    other_party_id = last_msg["sender_id"]
                other_party_type = "customer"
                
                # Get customer name
                other_party_name = await MessageService._get_customer_name(other_party_id)
                
                # Get product info if exists
                product_title = last_msg.get("product_title")
                if not product_title and last_msg.get("product_id"):
                    product_query_id = last_msg["product_id"]
                    if ObjectId.is_valid(product_query_id):
                        product_query_id = ObjectId(product_query_id)
                    product = await db.products.find_one(
                        {"_id": product_query_id},
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
                        "sender_id": last_msg.get("sender_id", ""),
                        "product_id": last_msg.get("product_id"),
                        "product_title": product_title,
                        "message_type": last_msg.get("message_type", "general"),
                        "reply_to_message_id": last_msg.get("reply_to_message_id"),
                        "reply_preview": last_msg.get("reply_preview"),
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
            if not MessageService._conversation_contains_user(conversation_id, "supplier", supplier_id):
                logger.warning(
                    "Supplier %s not authorized for conversation %s",
                    supplier_id,
                    conversation_id,
                )
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
                # Get product title - use stored value or fetch if missing
                product_title = msg.get("product_title")
                product_id = msg.get("product_id")
                if not product_title and product_id:
                    try:
                        product_query_id = product_id
                        if ObjectId.is_valid(product_query_id):
                            product_query_id = ObjectId(product_query_id)
                        product = await db.products.find_one(
                            {"_id": product_query_id},
                            {"title": 1, "name": 1, "productTitle": 1}
                        )
                        if product:
                            product_title = product.get("title") or product.get("name") or product.get("productTitle")
                    except Exception as e:
                        logger.warning("Could not fetch product title for product_id %s: %s", product_id, e)
                
                messages.append({
                    "id": str(msg["_id"]),
                    "conversation_id": msg["conversation_id"],
                    "sender_type": msg["sender_type"],
                    "sender_id": msg["sender_id"],
                    "recipient_id": msg["recipient_id"],
                    "product_id": product_id,
                    "product_title": product_title,
                    "message": msg["message"],
                    "message_type": msg.get("message_type", "general"),
                    "reply_to_message_id": msg.get("reply_to_message_id"),
                    "reply_preview": msg.get("reply_preview"),
                    "is_read": msg.get("is_read", False),
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

    @staticmethod
    async def delete_conversation(conversation_id: str, supplier_id: str) -> bool:
        """Delete an entire conversation for a supplier."""
        try:
            if not MessageService._conversation_contains_user(conversation_id, "supplier", supplier_id):
                logger.warning("Supplier %s unauthorized to delete conversation %s", supplier_id, conversation_id)
                return False

            db = get_database()
            await db.messages.delete_many({"conversation_id": conversation_id})
            return True
        except Exception as exc:
            logger.error("Error deleting conversation %s for supplier %s: %s", conversation_id, supplier_id, exc)
            return False

    @staticmethod
    async def get_unread_count(supplier_id: str) -> int:
        """Return total unread messages for supplier."""
        try:
            db = get_database()
            return await db.messages.count_documents({"recipient_id": supplier_id, "is_read": False})
        except Exception as exc:
            logger.error("Error getting unread count for supplier %s: %s", supplier_id, exc)
            return 0

