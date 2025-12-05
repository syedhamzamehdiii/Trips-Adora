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
    ticketFare: Optional[str] = None
    ticket: Optional[str] = None  # For backward compatibility
    photo: Optional[str] = None
    attractionType: Optional[str] = None
    activities: List[str] = []


class VehicleDetails(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[str] = None
    capacity: Optional[int] = None


class Vehicle(BaseModel):
    """Vehicle schema for product vehicles array"""
    title: Optional[str] = None  # Vehicle title/name
    type: Optional[str] = None  # vehicle_type
    model: Optional[str] = None  # variant
    year: Optional[str] = None
    capacity: Optional[int] = None
    currency: Optional[str] = None  # e.g., USD, EUR, JPY
    amount: Optional[float] = None  # Price amount
    pricing_type: Optional[str] = None  # e.g., Per Person, Per Hour, Per Trip
    duration: Optional[str] = None  # e.g., "7h", "Full Day", "8 hours"


class PickupConfiguration(BaseModel):
    """Configuration for a specific pickup location, vehicle, time, and date"""
    pickup_location: str
    dropoff_location: Optional[str] = None  # The selected dropoff location (if different from pickup)
    vehicle_id: Optional[str] = None
    vehicle: Optional[Dict[str, Any]] = None
    pickup_time: str
    pickup_date: Optional[str] = None
    pickup_datetime: Optional[str] = None


class TimeSlotConfiguration(BaseModel):
    """Configuration for generating time slots"""
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[int] = None
    apply_to_all_days: bool = False


class PickupDropoff(BaseModel):
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    pickup_time: Optional[str] = None
    available_days: List[str] = []
    available_time_slots: List[str] = []
    pickup_locations: List[str] = []  # Support both singular and plural
    dropoff_locations: List[str] = []  # Support both singular and plural
    # New fields for enhanced pickup management - MUST be included to preserve vehicle-based configs
    pickup_configurations: List[PickupConfiguration] = []  # Multiple pickup configs (location + vehicle + time + date)
    time_slot_configuration: Optional[TimeSlotConfiguration] = None
    time_slots_by_day: Dict[str, List[str]] = {}


class Accessibility(BaseModel):
    wheelchair_accessible: bool = False
    service_animals_allowed: bool = False
    infant_seat_available: bool = False
    stroller_friendly: bool = False


class FAQ(BaseModel):
    question: str
    answer: str


class CancellationTier(BaseModel):
    label: Optional[str] = None
    percentage: Optional[float] = None
    note: Optional[str] = None


class CancellationPolicy(BaseModel):
    free_cancellation_text: Optional[str] = None
    schedule: List[CancellationTier] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)


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
    vehicles: List[Vehicle] = []  # Array of vehicles from supplier_vehicle_options
    accessibility: Optional[Accessibility] = None
    faqs: List[FAQ] = []
    selling_points: List[str] = []
    style_theme: Optional[str] = None
    cancellation_policy: Optional[CancellationPolicy] = None
    
    # Supplier information
    supplier_business_name: Optional[str] = None
    supplier_id: Optional[str] = None  # Include for chat functionality
    
    # Availability fields mirrored from supplier platform
    inactive_dates: List[str] = []
    vehicle_inactive_dates: Dict[str, List[str]] = {}
    
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

