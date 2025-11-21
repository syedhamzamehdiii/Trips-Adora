# app/models/product.py
from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ProductStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class ProductCategory(str, Enum):
    TOUR = "tour"
    HOTEL = "hotel"
    RENT_A_CAR = "rent_a_car"


class ItineraryItem(BaseModel):
    time: Optional[str] = None
    title: str
    description: Optional[str] = None
    icon: Optional[str] = None  # pickup, sightseeing, dining, highlight, travel, dropoff
    photo: Optional[str] = None  # Cloudinary URL for itinerary highlight image
    location: Optional[str] = None
    timeSpent: Optional[str] = None
    isFree: Optional[bool] = None
    ticketFare: Optional[str] = None
    ticket: Optional[str] = None
    attractionType: Optional[str] = None
    activities: List[str] = Field(default_factory=list)


class Highlight(BaseModel):
    icon: str  # mountain, camera, car, guide
    text: str


class IncludedExcluded(BaseModel):
    included: List[str] = []
    excluded: List[str] = []


class FAQ(BaseModel):
    question: str
    answer: str


class CancellationTier(BaseModel):
    label: str
    percentage: float
    note: Optional[str] = None


class CancellationPolicy(BaseModel):
    free_cancellation_text: Optional[str] = None
    schedule: List[CancellationTier] = []
    notes: List[str] = []


class VehicleDetails(BaseModel):
    vehicle_type: str  # van, car, bus, train
    vehicle_model: str
    vehicle_year: Optional[str] = None
    capacity: Optional[int] = None


class PickupDropoff(BaseModel):
    pickup_location: str
    dropoff_location: str
    pickup_time: str
    available_days: List[str] = []  # Monday, Tuesday, etc.
    available_time_slots: List[str] = []


class Accessibility(BaseModel):
    wheelchair_accessible: bool = False
    service_animals_allowed: bool = False
    infant_seat_available: bool = False
    stroller_friendly: bool = False


class Product(Document):
    """
    Comprehensive Product model for tours, hotels, and car rentals.
    Designed to support both supplier and customer platforms.
    """
    # Basic Information
    supplier_id: str = Field(..., description="Reference to supplier/user who created")
    title: str = Field(..., min_length=30, description="Product title")
    category: ProductCategory = Field(default=ProductCategory.TOUR)
    tagline: Optional[str] = Field(None, description="Short tagline or subtitle")
    
    # Description & Content
    description: str = Field(..., description="Detailed product description")
    highlights: List[Highlight] = Field(default_factory=list)
    
    # Media
    images: List[str] = Field(default_factory=list, description="Array of image URLs")
    hero_image: Optional[str] = Field(None, description="Main hero/featured image")
    gallery_images: List[str] = Field(default_factory=list, description="Additional gallery images")
    
    # Tour Specific
    itinerary: List[ItineraryItem] = Field(default_factory=list)
    duration: Optional[str] = Field(None, description="e.g., '10 hours', '3 days'")
    
    # Details
    guide_type: Optional[str] = Field(None, description="Driver, Guide, Driver+Guide")
    activity_type: Optional[str] = Field(None, description="Private, Group, Custom")
    languages: List[str] = Field(default_factory=list, description="Supported languages")
    things_to_carry: List[str] = Field(default_factory=list)
    
    # Included/Excluded
    included_excluded: Optional[IncludedExcluded] = None
    
    # Accessibility & Comfort
    accessibility: Optional[Accessibility] = None
    
    # Transportation (for tours)
    vehicle_details: Optional[VehicleDetails] = None
    
    # Pickup & Dropoff
    pickup_dropoff: Optional[PickupDropoff] = None
    
    # Pricing
    price: float = Field(..., description="Price per person/group")
    currency: str = Field(default="USD")
    price_unit: str = Field(default="Per Group", description="Per Person, Per Group, Per Night")
    commission_rate: Optional[float] = Field(default=20.0, description="Platform commission %")
    
    # FAQ
    faqs: List[FAQ] = Field(default_factory=list)
    cancellation_policy: Optional[CancellationPolicy] = None
    
    # Location & Breadcrumb
    destination: Optional[str] = Field(None, description="e.g., Tokyo, Japan")
    breadcrumb: List[str] = Field(default_factory=list, description="['Klook Travel', 'Japan', 'Tokyo']")
    
    # Selling Points & Style
    selling_points: List[str] = Field(default_factory=list)
    style_theme: Optional[str] = Field(None, description="Adventure, Luxury, Cultural, etc.")
    
    # Status & Metadata
    status: ProductStatus = Field(default=ProductStatus.DRAFT)
    views: int = Field(default=0)
    bookings_count: int = Field(default=0)
    rating: Optional[float] = Field(None, ge=0, le=5)
    reviews_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    
    # Additional flexible data
    custom_fields: Dict[str, Any] = Field(default_factory=dict, description="For future extensions")
    
    class Settings:
        name = "products"
        indexes = [
            "supplier_id",
            "category",
            "status",
            "created_at",
            [("title", "text"), ("description", "text")],  # Text search index
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "supplier_id": "user123",
                "title": "Mount Fuji Customized Tour - Private Guided Experience",
                "category": "tour",
                "tagline": "Discover the breathtaking beauty of Mount Fuji",
                "description": "Experience the magic of Mount Fuji on this exclusive one-day private tour...",
                "price": 240.0,
                "currency": "USD",
                "status": "published"
            }
        }

