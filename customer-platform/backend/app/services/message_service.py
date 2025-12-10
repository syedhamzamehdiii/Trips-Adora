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

    CUSTOMER_PREFIX = "cust:"
    SUPPLIER_PREFIX = "sup:"
    TOKEN_SEPARATOR = "|"
    ADMIN_ID = "admin"

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

        # Handle admin conversations: "admin|cust:{customer_id}"
        if conversation_id.startswith("admin|"):
            if role == "customer":
                customer_part = conversation_id.split("cust:")[-1] if "cust:" in conversation_id else ""
                return customer_part == str(user_id).strip()
            return False

        if MessageService.TOKEN_SEPARATOR in conversation_id:
            tokens = conversation_id.split(MessageService.TOKEN_SEPARATOR)
        else:
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

            # Legacy fallback (token stores raw user ID)
            if token == normalized_id:
                return True

        return False
    
    @staticmethod
    async def _get_product_metadata(product_id: Optional[str]) -> tuple[Optional[str], Optional[str]]:
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
                logger.warning("Product not found for product_id: %s", product_id)
                return (None, None)
            supplier_id = product.get("supplier_id")
            if isinstance(supplier_id, ObjectId):
                supplier_id = str(supplier_id)
            title = product.get("title") or product.get("name") or product.get("productTitle")
            if title:
                title = str(title)
                logger.info("Fetched product title '%s' for product_id: %s", title, product_id)
            else:
                logger.warning("No title found for product_id: %s (available fields: %s)", product_id, list(product.keys()))
            return (title, str(supplier_id) if supplier_id else None)
        except Exception as exc:
            logger.error("Unable to fetch product metadata for %s: %s", product_id, exc, exc_info=True)
            return (None, None)

    @staticmethod
    async def _build_reply_metadata(message_id: Optional[str], conversation_id: str) -> tuple[Optional[str], Optional[str]]:
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
        customer_id: str,
        supplier_id: str,
        message: str,
        product_id: Optional[str] = None,
        message_type: MessageType = MessageType.GENERAL,
        reply_to_message_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a message from customer to supplier"""
        try:
            # Admin thread bypasses product lookup and uses dedicated conversation id
            if supplier_id == MessageService.ADMIN_ID:
                product_title = None
                conversation_id = f"admin|cust:{customer_id}"
            else:
                product_title, canonical_supplier_id = await MessageService._get_product_metadata(product_id)
                if canonical_supplier_id:
                    supplier_id = str(canonical_supplier_id)
                conversation_id = MessageService._generate_conversation_id(customer_id, supplier_id)
            
            # Create message document (using raw MongoDB since customer platform doesn't use Beanie)
            db = get_database()
            collection = db.messages

            reply_id, reply_preview = await MessageService._build_reply_metadata(
                reply_to_message_id, conversation_id
            )
            
            message_doc = {
                "conversation_id": conversation_id,
                "sender_type": MessageSender.CUSTOMER.value,
                "sender_id": customer_id,
                "recipient_id": supplier_id,
                "product_id": product_id,
                "product_title": product_title,  # Store product title for context
                "message": message,
                "message_type": message_type.value,
                "reply_to_message_id": reply_id,
                "reply_preview": reply_preview,
                "is_read": False,
                "attachments": [],
                "created_at": datetime.utcnow()
            }
            
            # Log for debugging
            if product_id:
                logger.info(
                    "Sending message with product_id=%s, product_title=%s, supplier_id=%s",
                    product_id,
                    product_title,
                    supplier_id
                )
            
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
                "product_title": message_doc.get("product_title"),
                "message": message_doc["message"],
                "message_type": message_doc["message_type"],
                "reply_to_message_id": message_doc.get("reply_to_message_id"),
                "reply_preview": message_doc.get("reply_preview"),
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
            # Include admin messages where recipient_id matches customer_id
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"sender_id": customer_id, "sender_type": "customer"},
                            {"recipient_id": customer_id},  # This matches admin messages
                            {"sender_type": "admin", "recipient_id": customer_id}  # Explicit admin message match
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
            try:
                async for group in collection.aggregate(pipeline):
                    try:
                        conv_id = group.get("_id")
                        last_msg = group.get("last_message")
                        
                        if not conv_id or not last_msg:
                            logger.warning(f"Skipping invalid conversation group: {group}")
                            continue

                        # Verify conversation_id contains customer role for this user (security check)
                        if not MessageService._conversation_contains_user(conv_id, "customer", customer_id):
                            logger.debug(
                                "Skipping conversation %s - customer %s not part of it",
                                conv_id,
                                customer_id,
                            )
                            continue
                        
                        # Determine other party
                        sender_type = last_msg.get("sender_type", "")
                        recipient_id = last_msg.get("recipient_id")
                        sender_id = last_msg.get("sender_id")
                        if sender_type == "admin" or recipient_id == MessageService.ADMIN_ID:
                            other_party_id = MessageService.ADMIN_ID
                            other_party_type = "admin"
                            other_party_name = last_msg.get("sender_name", "Admin")
                        elif sender_id == customer_id:
                            other_party_id = recipient_id
                            # Determine if talking to supplier or admin via recipient
                            if recipient_id == MessageService.ADMIN_ID:
                                other_party_type = "admin"
                                other_party_name = "Admin"
                            else:
                                other_party_type = "supplier"
                                other_party_name = await MessageService._get_user_name(other_party_id) if other_party_id else "Unknown"
                        else:
                            other_party_id = sender_id
                            if sender_id == MessageService.ADMIN_ID:
                                other_party_type = "admin"
                                other_party_name = last_msg.get("sender_name", "Admin")
                            else:
                                other_party_type = sender_type if sender_type else "supplier"
                                other_party_name = await MessageService._get_user_name(other_party_id) if other_party_id else "Unknown"
                        
                        # Get product info if exists
                        product_title = last_msg.get("product_title")
                        product_id = last_msg.get("product_id")
                        if not product_title and product_id:
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
                            "other_party_id": other_party_id or "",
                            "other_party_name": other_party_name or "Unknown",
                            "other_party_type": other_party_type or "supplier",
                            "product_id": product_id,
                            "product_title": product_title,
                            "last_message": {
                                "id": str(last_msg.get("_id", "")),
                                "conversation_id": conv_id,
                                "message": last_msg.get("message", ""),
                                "sender_type": last_msg.get("sender_type", "customer"),
                                "sender_id": last_msg.get("sender_id", ""),
                                "recipient_id": last_msg.get("recipient_id", ""),
                                "product_id": product_id,
                                "product_title": product_title,
                                "message_type": last_msg.get("message_type", "general"),
                                "reply_to_message_id": last_msg.get("reply_to_message_id"),
                                "reply_preview": last_msg.get("reply_preview"),
                                "is_read": last_msg.get("is_read", False),
                                "created_at": last_msg.get("created_at", datetime.utcnow())
                            },
                            "unread_count": group.get("unread_count", 0),
                            "created_at": last_msg.get("created_at", datetime.utcnow()),
                            "updated_at": last_msg.get("created_at", datetime.utcnow())
                        })
                    except Exception as conv_error:
                        logger.error(f"Error processing conversation group: {conv_error}", exc_info=True)
                        continue
            except Exception as pipeline_error:
                logger.error(f"Error in aggregation pipeline: {pipeline_error}", exc_info=True)
                raise
            
            return conversations
        except Exception as e:
            logger.error(f"Error getting conversations for customer {customer_id}: {e}", exc_info=True)
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
            if not MessageService._conversation_contains_user(conversation_id, "customer", customer_id):
                logger.warning(
                    "Customer %s not authorized for conversation %s",
                    customer_id,
                    conversation_id,
                )
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
                    "product_title": msg.get("product_title"),
                    "message": msg["message"],
                    "message_type": msg["message_type"],
                    "reply_to_message_id": msg.get("reply_to_message_id"),
                    "reply_preview": msg.get("reply_preview"),
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
            if not user_id or user_id == "admin":
                return "Admin" if user_id == "admin" else "Unknown"
            
            db = get_database()
            # Try users collection
            user = await db.users.find_one(
                {"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id},
                {"business_name": 1, "full_name": 1}
            )
            if user:
                return user.get("business_name") or user.get("full_name") or "Unknown"
            return "Unknown"
        except Exception as e:
            logger.warning(f"Error getting user name for {user_id}: {e}")
            return "Unknown"

    @staticmethod
    async def delete_conversation(conversation_id: str, customer_id: str) -> bool:
        """Delete an entire conversation for a customer."""
        try:
            if not MessageService._conversation_contains_user(conversation_id, "customer", customer_id):
                logger.warning("Customer %s unauthorized to delete conversation %s", customer_id, conversation_id)
                return False

            db = get_database()
            await db.messages.delete_many({"conversation_id": conversation_id})
            return True
        except Exception as exc:
            logger.error("Error deleting conversation %s for customer %s: %s", conversation_id, customer_id, exc)
            return False

    @staticmethod
    async def get_unread_count(customer_id: str) -> int:
        """Return total unread messages for a customer."""
        try:
            db = get_database()
            return await db.messages.count_documents({"recipient_id": customer_id, "is_read": False})
        except Exception as exc:
            logger.error("Error getting unread count for customer %s: %s", customer_id, exc)
            return 0

