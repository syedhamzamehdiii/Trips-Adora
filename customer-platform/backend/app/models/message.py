# app/models/message.py
from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    INQUIRY = "inquiry"
    ORDER = "order"
    GENERAL = "general"
    SUPPORT = "support"


class MessageSender(str, Enum):
    CUSTOMER = "customer"
    SUPPLIER = "supplier"


class Message(Document):
    conversation_id: str  # Format: "cust:{customer_id}|sup:{supplier_id}"
    sender_type: MessageSender
    sender_id: str  # Customer or Supplier user ID
    recipient_id: str  # Recipient user ID
    product_id: Optional[str] = None  # Product ID if message is about a product
    product_title: Optional[str] = None  # Cached product title for context
    subject: Optional[str] = None
    message: str
    message_type: MessageType = MessageType.GENERAL
    reply_to_message_id: Optional[str] = None
    reply_preview: Optional[str] = None
    is_read: bool = False
    attachments: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "messages"
        indexes = [
            "conversation_id",
            "sender_id",
            "recipient_id",
            "product_id",
            "reply_to_message_id",
            "created_at",
            "is_read"
        ]

