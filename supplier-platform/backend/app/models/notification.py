from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime


class Notification(Document):
    supplier_id: str = Field(..., description="ID of the supplier who should receive this notification")
    type: str = Field(..., description="Type of notification (e.g., 'booking', 'message', 'system')")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    booking_id: Optional[str] = Field(None, description="Associated booking ID if applicable")
    product_id: Optional[str] = Field(None, description="Associated product ID if applicable")
    read: bool = Field(default=False, description="Whether the notification has been read")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = Field(None, description="When the notification was marked as read")
    
    class Settings:
        name = "supplier_notifications"
        indexes = ["supplier_id", "read", "created_at"]

