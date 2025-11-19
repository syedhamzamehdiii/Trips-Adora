from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class BookingStatus(str, Enum):
    PENDING = "pending"
    CUSTOMIZED = "customized"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingItem(BaseModel):
    id: str
    bookingId: str
    userId: Optional[str] = None
    productId: Optional[str] = None
    tourName: Optional[str] = None
    title: Optional[str] = None
    destination: Optional[str] = None
    location: Optional[str] = None
    status: BookingStatus
    statusLabel: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    tourDate: Optional[str] = None
    tourDateLabel: Optional[str] = None
    totalAmount: float = 0.0
    currency: str = "USD"
    loyaltyPoints: int = 0
    heroImage: Optional[str] = None
    image: Optional[str] = None
    notes: Optional[str] = None
    travelers: Optional[str] = None
    packageType: Optional[str] = None
    pickUpLocation: Optional[str] = None
    dropOffLocation: Optional[str] = None
    customerName: Optional[str] = None
    customerEmail: Optional[str] = None
    customerPhone: Optional[str] = None
    vehicle: Optional[str] = None
    extras: Optional[List[Dict[str, str]]] = None
    metadata: Optional[Dict[str, str]] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat() if v else None}
        allow_population_by_field_name = True
        extra = "allow"


class BookingListResponse(BaseModel):
    bookings: List[BookingItem]


class BookingCancellationRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500, description="Reason provided by the customer.")


class BookingCreateRequest(BaseModel):
    title: str
    productId: Optional[str] = None
    destination: Optional[str] = None
    location: Optional[str] = None
    startDate: datetime
    endDate: Optional[datetime] = None
    status: BookingStatus = BookingStatus.CONFIRMED
    totalAmount: float = 0.0
    currency: str = "USD"
    loyaltyPoints: int = 0
    heroImage: Optional[str] = None
    notes: Optional[str] = None
    travelers: Optional[str] = None
    packageType: Optional[str] = None
    pickUpLocation: Optional[str] = None
    dropOffLocation: Optional[str] = None
    customerName: Optional[str] = None
    customerEmail: Optional[str] = None
    customerPhone: Optional[str] = None
    vehicle: Optional[str] = None
    tourDateLabel: Optional[str] = None
    extras: Optional[List[Dict[str, str]]] = None
    metadata: Dict[str, str] = Field(default_factory=dict)


