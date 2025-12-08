# app/schemas/product.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.product import (
    ProductStatus,
    ItineraryItem,
    Highlight,
    IncludedExcluded,
    FAQ,
    VehicleDetails,
    PickupDropoff,
    Accessibility,
    CancellationPolicy
)


class ProductBase(BaseModel):
    """Base product schema with common fields"""
    title: str = Field(..., min_length=30, description="Product title (min 30 chars)")
    # Category is now a free-form string so suppliers can enter custom values
    # (e.g. "tour", "hotel", "rent a car", or any other label)
    category: str = Field(default="tour")
    tagline: Optional[str] = None
    description: str
    highlights: List[Highlight] = []
    images: List[str] = []
    hero_image: Optional[str] = None
    gallery_images: List[str] = []
    itinerary: List[ItineraryItem] = []
    total_tour_days: Optional[str] = None  # persisted for multi-day tours
    day_durations: Dict[Any, Any] = Field(default_factory=dict)  # day -> duration string
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
    cancellation_policy: Optional[CancellationPolicy] = None
    destination: Optional[str] = None
    breadcrumb: List[str] = []
    selling_points: List[str] = []
    style_theme: Optional[str] = None
    custom_fields: Dict[str, Any] = {}
    # Availability fields shared with customer/supplier platforms
    # These mirror the fields on the Product model so availability
    # (inactive dates and vehicle-level inactive dates) is included
    # in all ProductResponse payloads.
    inactive_dates: List[str] = []
    vehicle_inactive_dates: Dict[str, List[str]] = {}


class ProductCreate(ProductBase):
    """Schema for creating a new product"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product - all fields optional"""
    title: Optional[str] = Field(None, min_length=30)
    category: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[Highlight]] = None
    images: Optional[List[str]] = None
    hero_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    itinerary: Optional[List[ItineraryItem]] = None
    total_tour_days: Optional[str] = None
    day_durations: Optional[Dict[Any, Any]] = None
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
    cancellation_policy: Optional[CancellationPolicy] = None
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
    category: str
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
