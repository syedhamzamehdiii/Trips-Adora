"""
Supplier Onboarding Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.supplier_onboarding import BusinessType, OnboardingStatus


class SupplierOnboardingCreate(BaseModel):
    """Schema for creating supplier onboarding"""
    
    # User identification
    email: EmailStr
    user_name: Optional[str] = None  # User's full name from registration
    user_email: Optional[EmailStr] = None  # User's email from registration
    
    # Business Type (Step 1)
    business_type: BusinessType
    employee_count: int = Field(ge=0, default=0)
    
    # Business Identity (Step 2) - Optional for solo
    business_name: Optional[str] = None
    business_phone: Optional[str] = None
    business_phone_code: Optional[str] = None
    business_email: Optional[EmailStr] = None
    business_website: Optional[str] = None
    business_registration: Optional[str] = None
    business_country: Optional[str] = None
    business_city: Optional[str] = None
    business_zip_code: Optional[str] = None
    short_bio: Optional[str] = None
    social_links: List[str] = Field(default_factory=list)
    
    # Business Identity Documents (Cloudinary URLs)
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


class SupplierOnboardingResponse(BaseModel):
    """Schema for supplier onboarding response"""
    id: str
    email: str
    business_type: BusinessType
    employee_count: int
    status: OnboardingStatus
    submitted_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class SupplierOnboardingUpdate(BaseModel):
    """Schema for updating supplier onboarding status (Admin only)"""
    status: OnboardingStatus
    rejection_reason: Optional[str] = None
