# app/schemas/partner.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class PartnerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None


class PartnerCreate(PartnerBase):
    pass


class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class PartnerResponse(PartnerBase):
    id: str
    status: str
    invited_at: datetime
    joined_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True