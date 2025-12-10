from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class AdminSendMessageRequest(BaseModel):
    recipient_type: Literal["customer", "supplier"]
    recipient_id: str
    message: str = Field(..., min_length=1, max_length=5000)
    admin_name: str = Field(default="Admin")


class AdminMessageResponse(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    sender_type: str
    sender_id: str
    sender_name: Optional[str] = None
    recipient_id: str
    product_id: Optional[str] = None
    product_title: Optional[str] = None
    subject: Optional[str] = None
    message: str
    message_type: str
    reply_to_message_id: Optional[str] = None
    reply_preview: Optional[str] = None
    is_read: bool = False
    attachments: List[str] = []
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class AdminConversationResponse(BaseModel):
    conversation_id: str
    other_party_id: str
    other_party_name: str
    other_party_type: str
    product_id: Optional[str] = None
    product_title: Optional[str] = None
    last_message: Optional[AdminMessageResponse] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime


class AdminConversationListResponse(BaseModel):
    conversations: List[AdminConversationResponse]
    total: int

