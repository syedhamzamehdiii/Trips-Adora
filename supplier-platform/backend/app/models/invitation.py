from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime, timedelta
from uuid import uuid4


class SupplierInvitation(Document):
    """Model for storing supplier access invitations"""
    token: str = Field(default_factory=lambda: str(uuid4()), unique=True, index=True)
    email: EmailStr
    supplier_code: str  # The supplier account being shared
    inviter_user_id: str  # User who sent the invitation
    permissions: Dict[str, bool] = Field(
        default_factory=lambda: {
            "productsManagement": False,
            "customersFeedbacks": False,
            "finance": False
        }
    )
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=7))
    is_used: bool = False
    used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "supplier_invitations"
        indexes = ["token", "email", "supplier_code"]


class InvitationCreate(BaseModel):
    email: EmailStr
    permissions: Dict[str, bool] = Field(
        default_factory=lambda: {
            "productsManagement": False,
            "customersFeedbacks": False,
            "finance": False
        }
    )


class InvitationResponse(BaseModel):
    token: str
    email: str
    supplier_code: str
    invitation_link: str
    expires_at: datetime
    message: str



