"""
Message Service for Admin Platform
Handles sending messages from admin to customers
"""
from datetime import datetime
from typing import Dict, Any, Optional
from bson import ObjectId
from app.core.database import get_database
from pymongo.errors import NetworkTimeout, AutoReconnect, ServerSelectionTimeoutError, ConnectionFailure
import logging

logger = logging.getLogger(__name__)

# MongoDB connection errors that should return default values
MONGO_CONNECTION_ERRORS = (
    NetworkTimeout,
    AutoReconnect,
    ServerSelectionTimeoutError,
    ConnectionFailure,
)


class AdminMessageService:
    MESSAGES_COLLECTION = "messages"
    ADMIN_ID = "admin"

    @staticmethod
    def _get_collection(name: str):
        """Get a MongoDB collection by name."""
        db = get_database()
        return db[name]

    @staticmethod
    def _conversation_id(recipient_type: str, recipient_id: str) -> str:
        recipient_id = str(recipient_id).strip()
        if recipient_type == "customer":
            return f"admin|cust:{recipient_id}"
        if recipient_type == "supplier":
            return f"admin|sup:{recipient_id}"
        raise ValueError("recipient_type must be 'customer' or 'supplier'")

    @staticmethod
    def _parse_conversation_id(conversation_id: str) -> tuple[str, str]:
        """Return (recipient_type, id) from admin conversation id."""
        if conversation_id.startswith("admin|cust:"):
            return ("customer", conversation_id.split("cust:", 1)[1])
        if conversation_id.startswith("admin|sup:"):
            return ("supplier", conversation_id.split("sup:", 1)[1])
        return ("unknown", "")

    @staticmethod
    async def _get_customer_name(customer_id: str) -> str:
        """Fetch customer display name."""
        try:
            db = get_database()
            # Try customer profile first
            profile = await db.customer_profiles.find_one(
                {"user_id": customer_id},
                {"user.name": 1, "user.first_name": 1, "user.last_name": 1},
            )
            if profile and profile.get("user"):
                user = profile["user"]
                if user.get("name"):
                    return user["name"]
                if user.get("first_name") or user.get("last_name"):
                    return f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()

            # Fallback to users collection
            users_collection = db.users
            user = await users_collection.find_one(
                {"_id": ObjectId(customer_id) if ObjectId.is_valid(customer_id) else customer_id},
                {"full_name": 1, "business_name": 1, "email": 1},
            )
            if user:
                return user.get("full_name") or user.get("business_name") or user.get("email") or "Customer"
        except Exception as exc:
            logger.debug(f"Could not resolve customer name for {customer_id}: {exc}")
        return "Customer"

    @staticmethod
    async def _get_supplier_name(supplier_id: str) -> str:
        """Fetch supplier display name."""
        try:
            db = get_database()
            users_collection = db.users
            user = await users_collection.find_one(
                {"_id": ObjectId(supplier_id) if ObjectId.is_valid(supplier_id) else supplier_id},
                {"business_name": 1, "full_name": 1, "supplier_code": 1, "email": 1},
            )
            if user:
                return user.get("business_name") or user.get("full_name") or user.get("supplier_code") or user.get("email") or "Supplier"
        except Exception as exc:
            logger.debug(f"Could not resolve supplier name for {supplier_id}: {exc}")
        return "Supplier"

    @staticmethod
    async def send_admin_message(
        customer_id: str,
        message: str,
        admin_name: str = "Admin"
    ) -> Dict[str, Any]:
        """Backward-compatible wrapper for sending to a customer."""
        return await AdminMessageService.send_message(
            recipient_type="customer",
            recipient_id=customer_id,
            message=message,
            admin_name=admin_name,
        )

    @staticmethod
    async def send_message(
        recipient_type: str,
        recipient_id: str,
        message: str,
        admin_name: str = "Admin"
    ) -> Dict[str, Any]:
        """
        Send a message from admin to a customer or supplier.
        """
        try:
            messages_collection = AdminMessageService._get_collection(AdminMessageService.MESSAGES_COLLECTION)
            
            conversation_id = AdminMessageService._conversation_id(recipient_type, recipient_id)
            
            message_doc = {
                "conversation_id": conversation_id,
                "sender_type": "admin",
                "sender_id": AdminMessageService.ADMIN_ID,
                "sender_name": admin_name,
                "recipient_id": str(recipient_id),
                "product_id": None,
                "product_title": None,
                "subject": None,
                "message": message,
                "message_type": "support",
                "reply_to_message_id": None,
                "reply_preview": None,
                "is_read": False,
                "attachments": [],
                "created_at": datetime.utcnow()
            }
            
            result = await messages_collection.insert_one(message_doc)
            message_doc["_id"] = result.inserted_id
            message_doc["id"] = str(result.inserted_id)
            
            logger.info(f"Admin message sent to {recipient_type} {recipient_id}")
            
            return message_doc
            
        except Exception as e:
            logger.error(f"Error sending admin message: {e}")
            raise

    @staticmethod
    async def get_conversations(participant_type: Optional[str] = None, search: Optional[str] = None):
        """
        Return admin conversations with customers and suppliers.
        """
        try:
            collection = AdminMessageService._get_collection(AdminMessageService.MESSAGES_COLLECTION)

            match_stage: Dict[str, Any] = {
                "$or": [
                    {"sender_type": "admin"},
                    {"recipient_id": AdminMessageService.ADMIN_ID},
                    {"conversation_id": {"$regex": "^admin\\|"}}
                ]
            }

            pipeline = [
                {"$match": match_stage},
                {"$sort": {"created_at": -1}},
                {
                    "$group": {
                        "_id": "$conversation_id",
                        "last_message": {"$first": "$$ROOT"},
                        "unread_count": {
                            "$sum": {
                                "$cond": [
                                    {
                                        "$and": [
                                            {"$eq": ["$recipient_id", AdminMessageService.ADMIN_ID]},
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
                {"$sort": {"last_message.created_at": -1}},
            ]

            conversations: list[Dict[str, Any]] = []
            async for group in collection.aggregate(pipeline):
                conv_id = group.get("_id")
                last_msg = group.get("last_message")
                if not conv_id or not last_msg:
                    continue

                other_type, other_id = AdminMessageService._parse_conversation_id(conv_id)
                if participant_type and other_type != participant_type:
                    continue

                # Optional search filter on name/email snippet
                other_name = "User"
                if other_type == "customer":
                    other_name = await AdminMessageService._get_customer_name(other_id)
                elif other_type == "supplier":
                    other_name = await AdminMessageService._get_supplier_name(other_id)

                if search:
                    search_l = search.lower()
                    candidate = f"{other_name} {other_id}".lower()
                    if search_l not in candidate:
                        continue

                product_title = last_msg.get("product_title")
                conversations.append({
                    "conversation_id": conv_id,
                    "other_party_id": other_id,
                    "other_party_name": other_name,
                    "other_party_type": other_type,
                    "product_id": last_msg.get("product_id"),
                    "product_title": product_title,
                    "last_message": {
                        "id": str(last_msg.get("_id", "")),
                        "conversation_id": conv_id,
                        "message": last_msg.get("message", ""),
                        "sender_type": last_msg.get("sender_type", "admin"),
                        "sender_id": last_msg.get("sender_id", AdminMessageService.ADMIN_ID),
                        "sender_name": last_msg.get("sender_name", "Admin"),
                        "recipient_id": last_msg.get("recipient_id", ""),
                        "message_type": last_msg.get("message_type", "support"),
                        "reply_to_message_id": last_msg.get("reply_to_message_id"),
                        "reply_preview": last_msg.get("reply_preview"),
                        "is_read": last_msg.get("is_read", False),
                        "created_at": last_msg.get("created_at", datetime.utcnow()),
                    },
                    "unread_count": group.get("unread_count", 0),
                    "created_at": last_msg.get("created_at", datetime.utcnow()),
                    "updated_at": last_msg.get("created_at", datetime.utcnow()),
                })

            return conversations
        except MONGO_CONNECTION_ERRORS as exc:
            logger.error(f"MongoDB connection error fetching admin conversations: {exc}", exc_info=True)
            return []
        except Exception as exc:
            logger.error(f"Error fetching admin conversations: {exc}", exc_info=True)
            return []

    @staticmethod
    async def get_messages(conversation_id: str) -> list[Dict[str, Any]]:
        """Return all messages for an admin conversation and mark admin inbox as read."""
        try:
            collection = AdminMessageService._get_collection(AdminMessageService.MESSAGES_COLLECTION)
            other_type, _ = AdminMessageService._parse_conversation_id(conversation_id)
            if other_type == "unknown":
                return []

            messages: list[Dict[str, Any]] = []
            async for msg in collection.find({"conversation_id": conversation_id}).sort("created_at", 1):
                messages.append({
                    "id": str(msg.get("_id")),
                    "conversation_id": msg.get("conversation_id"),
                    "sender_type": msg.get("sender_type"),
                    "sender_id": msg.get("sender_id"),
                    "sender_name": msg.get("sender_name", "Admin" if msg.get("sender_type") == "admin" else ""),
                    "recipient_id": msg.get("recipient_id"),
                    "product_id": msg.get("product_id"),
                    "product_title": msg.get("product_title"),
                    "message": msg.get("message"),
                    "message_type": msg.get("message_type"),
                    "reply_to_message_id": msg.get("reply_to_message_id"),
                    "reply_preview": msg.get("reply_preview"),
                    "is_read": msg.get("is_read", False),
                    "created_at": msg.get("created_at"),
                })

            # Mark messages sent TO admin as read
            await collection.update_many(
                {
                    "conversation_id": conversation_id,
                    "recipient_id": AdminMessageService.ADMIN_ID,
                    "is_read": False
                },
                {"$set": {"is_read": True}}
            )

            return messages
        except Exception as exc:
            logger.error(f"Error fetching admin messages for {conversation_id}: {exc}", exc_info=True)
            raise

    @staticmethod
    async def delete_conversation(conversation_id: str) -> bool:
        """Delete all messages in a conversation for admin."""
        try:
            collection = AdminMessageService._get_collection(AdminMessageService.MESSAGES_COLLECTION)
            result = await collection.delete_many({"conversation_id": conversation_id})
            return result.deleted_count > 0
        except Exception as exc:
            logger.error(f"Error deleting conversation {conversation_id}: {exc}", exc_info=True)
            raise

