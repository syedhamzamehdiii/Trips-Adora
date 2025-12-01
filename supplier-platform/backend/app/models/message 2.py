# app/models/message.py
from beanie import Document, Link
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum
from app.models.user import User


class MessageType(str, Enum):
    INQUIRY = "inquiry"
    ORDER = "order"
    GENERAL = "general"
    SUPPORT = "support"


class MessageSender(str, Enum):
    CUSTOMER = "customer"
    SUPPLIER = "supplier"


class Message(Document):
    conversation_id: str
    sender_type: MessageSender
    sender_id: Optional[str] = None
    recipient_id: Link[User]
    subject: Optional[str] = None
    message: str
    message_type: MessageType = MessageType.GENERAL
    is_read: bool = False
    attachments: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "messages"
