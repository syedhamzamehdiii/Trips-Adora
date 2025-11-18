from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# Model definitions matching supplier platform
class Highlight(BaseModel):
    icon: Optional[str] = None
    text: str


class IncludedExcluded(BaseModel):
    included: List[str] = []
    excluded: List[str] = []


class ItineraryItem(BaseModel):
    time: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    location: Optional[str] = None
    timeSpent: Optional[str] = None
    isFree: Optional[bool] = None
    photo: Optional[str] = None
    attractionType: Optional[str] = None
    activities: List[str] = []


class VehicleDetails(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[str] = None
    capacity: Optional[int] = None


class PickupDropoff(BaseModel):
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    pickup_time: Optional[str] = None
    available_days: List[str] = []
    available_time_slots: List[str] = []
    pickup_locations: List[str] = []  # Support both singular and plural
    dropoff_locations: List[str] = []  # Support both singular and plural


class Accessibility(BaseModel):
    wheelchair_accessible: bool = False
    service_animals_allowed: bool = False
    infant_seat_available: bool = False
    stroller_friendly: bool = False


class FAQ(BaseModel):
    question: str
    answer: str


class ProductResponse(BaseModel):
    """Schema for product response to customer frontend"""
    id: str
    title: str
    tagline: Optional[str] = None
    description: str
    category: str
    images: List[str] = []
    hero_image: Optional[str] = None
    gallery_images: List[str] = []
    price: float
    currency: str = "USD"
    price_unit: str = "Per Group"
    destination: Optional[str] = None
    duration: Optional[str] = None
    activity_type: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: int = 0
    views: int = 0
    bookings_count: int = 0
    created_at: datetime
    published_at: Optional[datetime] = None
    
    # Additional fields for frontend
    location: Optional[str] = None
    groupSize: Optional[str] = None
    
    # Product details fields
    guide_type: Optional[str] = None
    things_to_carry: List[str] = []
    languages: List[str] = []
    highlights: List[Highlight] = []
    included_excluded: Optional[IncludedExcluded] = None
    itinerary: List[ItineraryItem] = []
    pickup_dropoff: Optional[PickupDropoff] = None
    vehicle_details: Optional[VehicleDetails] = None
    accessibility: Optional[Accessibility] = None
    faqs: List[FAQ] = []
    selling_points: List[str] = []
    style_theme: Optional[str] = None
    
    # Supplier information
    supplier_business_name: Optional[str] = None
    supplier_id: Optional[str] = None  # Include for chat functionality
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ProductListResponse(BaseModel):
    """Schema for paginated product list"""
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

