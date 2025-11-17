# app/schemas/message.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.message import MessageType, MessageSender


class MessageCreate(BaseModel):
    recipient_id: str
    product_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=5000)
    message_type: MessageType = MessageType.GENERAL


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_type: MessageSender
    sender_id: str
    recipient_id: str
    product_id: Optional[str] = None
    subject: Optional[str] = None
    message: str
    message_type: MessageType
    is_read: bool
    attachments: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ConversationResponse(BaseModel):
    conversation_id: str
    other_party_id: str
    other_party_name: str
    other_party_type: str  # "supplier" or "customer"
    product_id: Optional[str] = None
    product_title: Optional[str] = None
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int

