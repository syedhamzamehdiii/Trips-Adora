"""
Supplier Onboarding Model
Stores supplier registration/onboarding data for admin verification
"""
from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class BusinessType(str, Enum):
    COMPANY = "company"
    SOLO = "solo"
    PRIVATE = "private"


class OnboardingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_REVIEW = "in_review"


class SupplierOnboarding(Document):
    """Supplier onboarding/registration data"""
    
    # User identification
    user_id: Optional[str] = None
    email: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    
    # Business Type (Step 1)
    business_type: BusinessType
    employee_count: int = 0
    
    # Business Identity (Step 2) - Only for non-solo businesses
    business_name: Optional[str] = None
    business_phone: Optional[str] = None
    business_phone_code: Optional[str] = None
    business_email: Optional[str] = None
    business_website: Optional[str] = None
    business_registration: Optional[str] = None
    business_country: Optional[str] = None
    business_city: Optional[str] = None
    business_zip_code: Optional[str] = None
    short_bio: Optional[str] = None
    social_links: List[str] = Field(default_factory=list)
    
    # Business Identity Documents (Step 2)
    logo_url: Optional[str] = None
    insurance_document_url: Optional[str] = None
    business_document_url: Optional[str] = None
    
    # ID Verification (Step 3)
    person_country: Optional[str] = None
    person_city: Optional[str] = None
    person_address: Optional[str] = None
    person_zip_code: Optional[str] = None
    person_phone_code: Optional[str] = None
    person_contact: Optional[str] = None
    id_type: Optional[str] = None
    id_front_url: Optional[str] = None
    id_back_url: Optional[str] = None
    
    # Status and verification
    status: OnboardingStatus = OnboardingStatus.PENDING
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "supplier_onboardings"
        indexes = ["email", "user_id", "status", "submitted_at"]
