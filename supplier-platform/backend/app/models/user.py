from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    SUPPLIER = "supplier"
    CUSTOMER = "customer"


class User(Document):
    email: EmailStr
    hashed_password: str
    full_name: str
    business_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    supplier_code: Optional[str] = Field(default=None, description="Human-readable supplier identifier")
    role: UserRole = UserRole.SUPPLIER
    is_active: bool = True
    is_verified: bool = False
    blocked_reason: Optional[str] = None
    blocked_at: Optional[datetime] = None
    blocked_by: Optional[str] = None
    permissions: Dict[str, bool] = Field(
        default_factory=lambda: {
            "productsManagement": False,
            "customersFeedbacks": False,
            "finance": False
        },
        description="User permissions/roles assigned by supplier"
    )
    # List of supplier codes this user can access (for team members/collaborators)
    supplier_access: Dict[str, Dict[str, bool]] = Field(
        default_factory=dict,
        description="Map of supplier_code -> permissions for suppliers this user can access"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = ["email", "supplier_code"]


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    business_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    business_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    country: Optional[str]
    supplier_code: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    permissions: Optional[Dict[str, bool]] = None
    supplier_access: Optional[Dict[str, Dict[str, bool]]] = None
    created_at: datetime
    updated_at: datetime