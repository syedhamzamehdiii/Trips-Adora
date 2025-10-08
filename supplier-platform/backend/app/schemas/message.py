# app/schemas/message.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MessageBase(BaseModel):
    subject: Optional[str] = None
    message: str
    message_type: str = "general"


class MessageCreate(MessageBase):
    recipient_id: str


class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    sender_type: str
    is_read: bool
    attachments: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True