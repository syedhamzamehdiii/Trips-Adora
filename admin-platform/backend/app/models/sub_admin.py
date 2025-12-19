from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime
from enum import Enum


class SubAdminRole(str, Enum):
    SUB_ADMIN = "sub_admin"


class SubAdmin(Document):
    email: EmailStr
    permissions: Dict[str, bool] = Field(
        default_factory=lambda: {
            "productsManagement": False,
            "customersFeedbacks": False,
            "finance": False
        },
        description="Sub-admin permissions"
    )
    invite_token: Optional[str] = None
    invite_token_expires_at: Optional[datetime] = None
    is_active: bool = True
    invited_by: Optional[str] = Field(default="admin", description="Email of admin who invited")
    invited_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "sub_admins"
        indexes = ["email", "invite_token"]


class SubAdminInviteRequest(BaseModel):
    email: EmailStr
    permissions: Dict[str, bool]
    personal_message: Optional[str] = None


class SubAdminLoginRequest(BaseModel):
    email: EmailStr


class SubAdminInviteResponse(BaseModel):
    email: str
    invite_link: str
    message: str

