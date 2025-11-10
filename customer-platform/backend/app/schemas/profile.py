from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class UserProfile(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    date_of_birth: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    member_since: Optional[str] = None
    membership_tier: Optional[str] = None
    loyalty_tier: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileStats(BaseModel):
    total_bookings: int = 0
    active_bookings: int = 0
    loyalty_points: int = 0
    total_spent: float = 0.0
    currency: str = "USD"


class UpcomingTrip(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    display_date: Optional[str] = None
    status: Optional[str] = None
    status_label: Optional[str] = None
    status_color: Optional[str] = None
    thumbnail: Optional[str] = None
    notes: Optional[str] = None


class TravelPreference(BaseModel):
    label: str
    value: int = Field(ge=0, le=100)


class RecentActivity(BaseModel):
    id: str
    title: str
    timestamp: datetime
    context: Optional[str] = None
    category: Optional[str] = None


class ReferAndEarn(BaseModel):
    code: Optional[str] = None
    referrals: int = 0
    earned: float = 0.0
    currency: str = "USD"


class WishlistItem(BaseModel):
    id: str
    title: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    image: Optional[str] = None
    url: Optional[str] = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    user_id: str
    user: UserProfile = Field(default_factory=UserProfile)
    stats: ProfileStats = Field(default_factory=ProfileStats)
    upcoming_trips: List[UpcomingTrip] = Field(default_factory=list)
    travel_preferences: List[TravelPreference] = Field(default_factory=list)
    recent_activity: List[RecentActivity] = Field(default_factory=list)
    refer_and_earn: ReferAndEarn = Field(default_factory=ReferAndEarn)
    wishlist: List[WishlistItem] = Field(default_factory=list)
    last_synced_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    user: Optional[UserProfile] = None
    stats: Optional[ProfileStats] = None
    upcoming_trips: Optional[List[UpcomingTrip]] = None
    travel_preferences: Optional[List[TravelPreference]] = None
    recent_activity: Optional[List[RecentActivity]] = None
    refer_and_earn: Optional[ReferAndEarn] = None
    wishlist: Optional[List[WishlistItem]] = None
    last_synced_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


