# app/schemas/product.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.product import (
    ProductStatus,
    ProductCategory,
    ItineraryItem,
    Highlight,
    IncludedExcluded,
    FAQ,
    VehicleDetails,
    PickupDropoff,
    Accessibility
)


class ProductBase(BaseModel):
    """Base product schema with common fields"""
    title: str = Field(..., min_length=30, description="Product title (min 30 chars)")
    category: ProductCategory = Field(default=ProductCategory.TOUR)
    tagline: Optional[str] = None
    description: str
    highlights: List[Highlight] = []
    images: List[str] = []
    hero_image: Optional[str] = None
    gallery_images: List[str] = []
    itinerary: List[ItineraryItem] = []
    duration: Optional[str] = None
    guide_type: Optional[str] = None
    activity_type: Optional[str] = None
    languages: List[str] = []
    things_to_carry: List[str] = []
    included_excluded: Optional[IncludedExcluded] = None
    accessibility: Optional[Accessibility] = None
    vehicle_details: Optional[VehicleDetails] = None
    pickup_dropoff: Optional[PickupDropoff] = None
    price: float
    currency: str = "USD" 
    price_unit: str = "Per Group"
    commission_rate: Optional[float] = 20.0
    faqs: List[FAQ] = []
    destination: Optional[str] = None
    breadcrumb: List[str] = []
    selling_points: List[str] = []
    style_theme: Optional[str] = None
    custom_fields: Dict[str, Any] = {}


class ProductCreate(ProductBase):
    """Schema for creating a new product"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product - all fields optional"""
    title: Optional[str] = Field(None, min_length=30)
    category: Optional[ProductCategory] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[Highlight]] = None
    images: Optional[List[str]] = None
    hero_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    itinerary: Optional[List[ItineraryItem]] = None
    duration: Optional[str] = None
    guide_type: Optional[str] = None
    activity_type: Optional[str] = None
    languages: Optional[List[str]] = None
    things_to_carry: Optional[List[str]] = None
    included_excluded: Optional[IncludedExcluded] = None
    accessibility: Optional[Accessibility] = None
    vehicle_details: Optional[VehicleDetails] = None
    pickup_dropoff: Optional[PickupDropoff] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    price_unit: Optional[str] = None
    commission_rate: Optional[float] = None
    faqs: Optional[List[FAQ]] = None
    destination: Optional[str] = None
    breadcrumb: Optional[List[str]] = None
    selling_points: Optional[List[str]] = None
    style_theme: Optional[str] = None
    status: Optional[ProductStatus] = None
    custom_fields: Optional[Dict[str, Any]] = None


class ProductSummary(BaseModel):
    """Lightweight product summary for list views - excludes heavy fields like images"""
    id: str
    supplier_id: str
    title: str
    category: ProductCategory
    tagline: Optional[str] = None
    status: ProductStatus
    price: float
    currency: str
    destination: Optional[str] = None
    duration: Optional[str] = None
    views: int
    bookings_count: int
    rating: Optional[float] = None
    reviews_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    # Only include first image URL (not base64) for thumbnail
    hero_image_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProductResponse(ProductBase):
    """Schema for product responses"""
    id: str
    supplier_id: str
    status: ProductStatus
    views: int
    bookings_count: int
    rating: Optional[float] = None
    reviews_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Schema for paginated product list"""
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ProductSummaryListResponse(BaseModel):
    """Schema for paginated product summary list (lightweight)"""
    products: List[ProductSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class ProductPublishRequest(BaseModel):
    """Schema for publishing a product"""
    product_id: str


class ProductStatusUpdate(BaseModel):
    """Schema for updating product status"""
    status: ProductStatus
