from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SupplierResponse(BaseModel):
    """Response schema for supplier information"""
    supplier_id: str = Field(..., alias="id")
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    total_tours: int = 0
    status: str
    revenue: float = 0.0
    rating: float = 0.0
    bookings: int = 0
    reviews: int = 0
    performance: float = 0.0
    account_type: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        from_attributes = True


class SupplierListResponse(BaseModel):
    """Response schema for paginated supplier list"""
    suppliers: list[SupplierResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SupplierStatsResponse(BaseModel):
    """Response schema for supplier statistics"""
    total_suppliers: int
    active_suppliers: int
    verification_pending: int
    total_earnings: float


class ProductSummary(BaseModel):
    """Summary of supplier product for listing"""
    id: str
    title: str
    tagline: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    price_unit: Optional[str] = None
    status: Optional[str] = None
    duration: Optional[str] = None
    vehicle: Optional[str] = None


class ProductListResponse(BaseModel):
    """Paginated product list for a supplier"""
    products: list[ProductSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class DocumentInfo(BaseModel):
    id: str
    label: str
    url: str


class SupplierDetailResponse(BaseModel):
    """Detailed supplier view for admin portal"""
    supplier_id: str = Field(..., alias="id")
    name: str
    legal_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    account_type: Optional[str] = None
    total_tours: int = 0
    rating: float = 0.0
    earnings: float = 0.0
    payouts: list[dict] = Field(default_factory=list)
    documents: list[DocumentInfo] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        from_attributes = True


class SupplierOnboardingAdminResponse(BaseModel):
    """Pending supplier onboarding item for admin review"""
    id: str
    email: str
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_country: Optional[str] = None
    business_city: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    user_id: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True


class SupplierOnboardingListResponse(BaseModel):
    onboardings: list[SupplierOnboardingAdminResponse]
    total: int
