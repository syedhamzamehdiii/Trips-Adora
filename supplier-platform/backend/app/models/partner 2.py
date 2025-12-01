# app/models/partner.py
from beanie import Document, Link
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from app.models.user import User


class PartnerStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"


class Partner(Document):
    supplier_id: Link[User]
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    status: PartnerStatus = PartnerStatus.PENDING
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    joined_at: Optional[datetime] = None
    
    class Settings:
        name = "partners"