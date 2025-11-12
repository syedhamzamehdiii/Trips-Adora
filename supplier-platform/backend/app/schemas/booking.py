from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SupplierBookingResponse(BaseModel):
    """Schema for a single booking response."""
    id: str
    user_id: str
    product_id: Optional[str] = None
    supplier_id: Optional[str] = None
    title: str
    tour_name: Optional[str] = None
    destination: Optional[str] = None
    location: Optional[str] = None
    status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_amount: float = 0.0
    currency: str = "USD"
    loyalty_points: int = 0
    hero_image: Optional[str] = None
    notes: Optional[str] = None
    travelers: Optional[str] = None
    package_type: Optional[str] = None
    pick_up_location: Optional[str] = None
    drop_off_location: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    vehicle: Optional[str] = None
    tour_date_label: Optional[str] = None
    extras: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SupplierBookingListResponse(BaseModel):
    """Schema for list of bookings."""
    bookings: List[SupplierBookingResponse]
    total: int
    stats: Dict[str, Any]


class SupplierBookingStatsResponse(BaseModel):
    """Schema for booking statistics."""
    total: int
    by_status: Dict[str, int]
    total_revenue: float

